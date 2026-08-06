---
title: "Architecture — habitica-fullsync"
description: "Complete architecture reference for the habitica-fullsync Obsidian plugin. Covers module organization, data flow, key patterns, type system, and design decisions."
created: "2026-08-01"
author: "[Lucas Galdino](../../../../authors/Lucas%20Galdino.md)"
tags: 
  - obsidian/plugin-development 
  - habitica/add-ons/habitica-fullsync/architecture 
  - habitica/extensions/habitica-fullsync/architecture 
---

# Architecture — habitica-fullsync

## Overview

**habitica-fullsync** is an [Obsidian](https://obsidian.md) plugin that bidirectionally syncs tasks between a user's [Habitica](https://habitica.com) account and their Obsidian vault. It was originally a 471-line vanilla javascript monolith by MidwestGuru and has been rewritten into 20 typescript modules following SOLID principles, utilizing an embedded SQLite database (sql.js) for robust state management.

The plugin now uses a dual-layer architecture: a normalized 3NF local SQLite database (`state.sqlite`) acts as the single source of truth, while the Markdown file (`habitica-fullsync.md`) acts as the presentation and user-input layer. The plugin runs explicit Pull and Push sync flows powered by an ETL (Extract, Transform, Load) pipeline for pushing local edits. All Habitica API calls are serialised through a promise queue with configurable spacing to respect Habitica's 30 req/min rate limit.

### Design Philosophy

- **Obsidian at the edges only.** Only 3 of 17 source files import from `'obsidian'`. All sync logic, parsing, formatting, and API communication are pure typescript — testable with Node's built-in test runner.
- **Surgical, additive changes.** No rewrites. Each phase of the refactor (documented in `docs/plan/plan.md`) was independently verifiable with `npm run build`.
- **Crash-safe idempotency.** Every mutation writes the Habitica-assigned `[id::]` back to the vault line **before** the next mutation, so a partial failure cannot cause duplicate tasks.
- **Immutable snapshots.** Settings are captured into a `SyncConfig` at sync start to prevent mid-sync Heisenbugs.

---

## Source Module Map

```tree
src/
├── main.ts                  (130 lines)  Plugin lifecycle + orchestration
├── settings.ts              (180 lines)  Data-driven settings tab, DIP interface
├── types.ts                 (247 lines)  11 interfaces/types, zero logic, zero Obsidian imports
│
├── api/
│   └── api-client.ts        (445 lines)  Habitica HTTP transport, queue, rate limiting, stats
│
├── lib/
│   ├── dataview.ts           (52 lines)  Dataview query block builder
│   └── platform.ts           (34 lines)  Mobile detection + auto-sync platform gate
│
├── markdown/
│   ├── formatter.ts         (223 lines)  Task → markdown line renderer, daily due-date math
│   ├── inline-fields.ts      (94 lines)  [key:: value] tokenizer — single source of truth
│   ├── parser.ts            (267 lines)  Markdown → task input parser (shared field extraction)
│   ├── scanner.ts           (128 lines)  Nested content scanner (notes + checklist blocks)
│   └── tags.ts               (67 lines)  Tag sanitization, normalization, reverse-index builder
│
├── sync/
│   ├── sync-manager.ts      (659 lines)  5-step sync orchestrator
│   ├── sync-file-model.ts   (112 lines)  Single-pass sync-file parser (replaces 3 old loops)
│   ├── sync-report.ts        (58 lines)  Counter accumulator + summary notice renderer
│   └── task-registry.ts      (93 lines)  In-memory task aggregate (personal + group)
│
└── vault/
    ├── vault-handler.ts     (206 lines)  Obsidian Vault read/write, file scanning
    └── line-edit.ts          (97 lines)  Positional line splicing (pure, no Obsidian imports)
```

### Module Dependency Graph

```tree
main.ts ─────────────────────────────────────────────────────────────────────┐
  ├── settings.ts (→ types.ts)                                               │
  ├── api/api-client.ts (→ types.ts)                                         │
  ├── lib/platform.ts                                                        │
  ├── vault/vault-handler.ts (→ vault/line-edit.ts, markdown/inline-fields.ts)│
  └── sync/sync-manager.ts (→ ALL modules below)                             │
        ├── api/api-client.ts                                                │
        ├── lib/dataview.ts                                                  │
        ├── markdown/formatter.ts   (→ markdown/tags.ts, markdown/parser.ts, │
        │                              markdown/inline-fields.ts)            │
        ├── markdown/parser.ts      (→ markdown/tags.ts,                     │
        │                              markdown/inline-fields.ts, types.ts)  │
        ├── sync/sync-file-model.ts (→ markdown/inline-fields.ts,            │
        │                              markdown/scanner.ts, types.ts)        │
        ├── sync/sync-report.ts     (→ types.ts)                             │
        ├── sync/task-registry.ts   (→ types.ts)                             │
        └── vault/vault-handler.ts                                           │
```

**Only 3 files touch Obsidian:** `main.ts`, `settings.ts`, `vault/vault-handler.ts`. All other modules are pure typescript.

---

## Type System (`src/types.ts` — 247 lines)

The domain model is centralized in `src/types.ts` with zero logic and zero Obsidian imports:

| Interface | Purpose | Used By |
|-----------|---------|---------|
| `PluginSettings` | Persisted configuration (11 fields) | main.ts, settings.ts, sync-manager.ts |
| `HabiticaTask` | Habitica API task shape (20+ optional fields) | api-client.ts, formatter.ts, parser.ts, task-registry.ts |
| `HabiticaTag` | Tag as returned by API | api-client.ts |
| `HabiticaChecklistItem` | Subtask item on a task | api-client.ts, formatter.ts, sync-manager.ts |
| `ChecklistItemParsed` | Parsed checklist item from markdown (text, checked, subId) | parser.ts, scanner.ts, sync-manager.ts |
| `NewTaskInput` | Parsed new-task line for creation (extends `BaseTaskFields`) | parser.ts, sync-manager.ts |
| `ManagedTaskFields` | Parsed managed-task line for update diff (extends `BaseTaskFields`) | parser.ts, sync-manager.ts |
| `ParsedTaskFields` | Shared field-extraction result for both parsers | parser.ts |
| `SyncConfig` | Immutable per-run configuration snapshot | sync-manager.ts |
| `SyncContext` | State threaded through 5 sync steps (config + registry + report + tagLookup + scoredIds) | sync-manager.ts |
| `AutoSyncPlatform` | Union type: `'both' \| 'desktop' \| 'mobile'` | types.ts, settings.ts, platform.ts |

`BaseTaskFields` is a shared interface extracted to eliminate the former 12-field duplication across `NewTaskInput`, `ManagedTaskFields`, and `ParsedTaskFields`.

---

## Sync Pipeline

The sync process is now split into explicit **Pull** and **Push** operations, orchestrated by `SyncManager`, to prevent data loss and ensure robust state management using the SQLite database.

### Pull Flow (`SyncManager.pull()`)
1. **Pre-check:** Scans the local Markdown file for unsynced edits (creations, deletions, or field changes).
2. **Conflict Resolution:** If unsynced edits exist, a `SyncWarningModal` prompts the user to cancel or snooze the auto-sync to protect local changes.
3. **Fetch & Store:** Fetches all tasks and tags from Habitica and upserts them into the local SQLite database (`SQLiteStore`).
4. **Render:** Generates the new Markdown file from the SQLite database state, overwriting the local file safely.

### Push Flow (`SyncManager.push()`)
1. **Extract Markdown State**: Reads the local Markdown file and extracts parsed tasks into temporary SQLite staging tables (`staging_tasks`, `staging_checklists`, `staging_tags`, `staging_task_tags`).
2. **Transform (Compute Diffs)**: Computes SQL diffs (`diff_tasks`, `diff_checklists`, `diff_tags`) between the staging tables and the normalized 3NF source of truth.
3. **Load to Remote**: Pushes any creations, edits, checklist mutations, or deletions identified by the diffs to the Habitica API.
4. **Update Local State**: Re-fetches updated tasks from the API and upserts them into the local SQLite database.
5. **Cleanup & Render**: Deletes tasks removed remotely, saves the SQLite database, and regenerates the Markdown file.

### allowUpdates Gate

| Sync trigger | `allowUpdates` | What runs |
|---|---|---|
| Manual sync (command palette) | `true` | All 5 steps including field diffs, checklist changes, deletions |
| Auto-sync (interval) | `false` | Steps 1-3 + 5 only. No field updates, no deletions. |

---

## API Client Design (`src/api/api-client.ts` — 445 lines)

### Serialised Request Queue

All public methods (`fetchUserTasks`, `scoreTask`, `createTask`, `updateTask`, etc.) route through `_enqueue()`, which chains operations onto a single promise queue:

```ascii
Method call → _enqueue(op, name) → run() → op()
                                         ↑
                                    lastRequestTime + minInterval spacing
                                    proactive rate-limit pause (≤10% remaining)
```

This ensures:
- **Inter-request spacing** of at least `minInterval` (default 2,200ms — matches Habitica's 30 req/min)
- **Proactive rate-limit monitoring:** reads `X-RateLimit-Remaining` on every response; pauses queue when ≤ 10% of quota remains
- **No bursts:** rapid-fire operations (e.g., scoring 10 tasks) are automatically spaced

### Rate Limiting

- **Retry logic:** `rateLimitedFetch()` retries on 429, 502, 503, 504, and network failures with exponential backoff
- **Retry counts:** Critical operations (fetch, create, score task) retry 3 times; idempotent mutations (checklist add/score, task update) retry 2 times; destructive operations (delete) retry once
- **Header monitoring:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` read on every response
- **Low-buffer warning:** `console.warn` when remaining ≤ 17% of quota
- **Adaptive pause:** queue pauses when remaining ≤ 10%, waiting for the reset window (capped at 60s)

### Debug Mode

`new HabiticaApiClient(user, token, { debug: true })` enables:
- Per-request timing with `[hf:req]` prefix
- Step-level timing via `console.time`/`console.timeEnd`
- Sync summary with call counts, 429 hits, and operation breakdown
- Low-buffer warnings

Zero debug output in production builds (`debug: false` or default).

---

## Markdown DSL (Inline Fields)

The plugin uses `[key:: value]` inline-field tokens embedded in Markdown task lines. These are Dataview-compatible and parsed by the shared `FIELD_RE` regex in `src/markdown/inline-fields.ts`.

### Core Fields (always rendered)

| Token | Example | Meaning |
|-------|---------|---------|
| `[id:: uuid]` | `[id:: abc-123]` | Habitica task UUID — stable identity |
| `[priority:: level]` | `[priority:: high]` | Task difficulty: high, medium, low, lowest |
| `[due:: YYYY-MM-DD]` | `[due:: 2026-06-01]` | Due date (to-dos) or next occurrence (dailies) |
| `[completion:: YYYY-MM-DD]` | `[completion:: 2026-05-14]` | Date task was completed |

### Optional Fields (rendered when set)

| Token | Type | Rendered When |
|-------|------|---------------|
| `[up:: true/false]` | boolean | Habit direction enabled |
| `[down:: true/false]` | boolean | Habit direction enabled |
| `[streak:: N]` | number | Non-zero streak |
| `[attribute:: str/int/per/con]` | enum | Attribute is set |
| `[frequency:: daily/weekly/monthly/yearly]` | enum | Not daily |
| `[everyX:: N]` | number | N > 1 |
| `[repeat:: su,m,t,w,th,f,s]` | csv | Weekly repeat days (not all 7) |
| `[startDate:: YYYY-MM-DD]` | date | Daily task with explicit start date |
| `[delete::]` | sentinel | Task marked for deletion (manual sync only) |
| `[subId:: uuid]` | string | Checklist item identity (on nested lines) |

### Field-Clearing Sentinels

- `[due:: none]` — clears due date
- `[notes::]` (empty value) — clears notes
- `[priority:: none]` — resets to low (1)

### Example

```markdown
- [ ] Draft report #focus [id:: abc-123] [priority:: high] [due:: 2026-06-01] [frequency:: weekly] [repeat:: m,w,f]
  > [!note]
  > Pull figures from dashboard.
  - [x] Gather metrics [subId:: sub-1]
  - [ ] Write summary [subId:: sub-2]
```

---

## Vault I/O (`src/vault/`)

### Line Identity Strategy

The plugin uses **three strategies** in order of preference:

1. **Positional (primary):** `spliceLineByIndex(content, lineIndex, expectedLine, newLine)` — uses the 0-based line index recorded during the parse pass. Collision-proof. Throws on mismatch.
2. **ID-based (legacy fallback):** `findLineIndexById(content, id)` — locates a line by `[id:: uuid]` token. Used for files created before positional tracking.
3. **Unique-line match (legacy fallback):** `replaceUniqueLine(content, oldLine, newLine)` — matches whole lines, anchored `^…$`. Throws on 0 or >1 matches. Used for ancient vault data.

All current callers use the positional path exclusively. Legacy fallbacks exist only for backward compatibility.

### Write Paths

- `VaultHandler.updateLine(file, lineNumber, oldLine, newLine)` — for existing `TFile` objects (vault scan results)
- `VaultHandler.updateLineInFile(filePath, lineNumber, oldLine, newLine)` — for path-based access (sync file write-backs after task creation). Uses `vault.process()` for atomic read-modify-write.

Both delegate line splicing to the shared `_spliceLine()` private method.

### Vault Scan Optimization

`getRecentCompletedTasks()` uses **MetadataCache pre-filtering**:
1. Check `file.stat.mtime ≥ cutoffDate` — skip unmodified files
2. Check `metadataCache.getFileCache(file).listItems` — skip files with no completed checkboxes
3. Only then read the file and extract matching lines

---

## Key Architectural Patterns

### 1. Interface Segregation — `IPluginSettingsHost`

`settings.ts` defines a minimal contract:

```typescript
export interface IPluginSettingsHost {
  settings: PluginSettings;
  saveSettings(): Promise<void>;
}
```

`HabiticaSyncSettingTab` depends on this interface, not the concrete plugin class. The plugin satisfies it structurally — no circular import from `main.ts`.

### 2. Data-Driven Settings Rendering

Instead of copy-pasted `new Setting(...)` blocks, settings are defined as data:

```typescript
const SETTING_DEFS: SettingDef[] = [
  { name: 'API user', key: 'apiUser', control: 'text', placeholder: '...' },
  { name: 'API token', key: 'apiTokenSecretName', control: 'secret' },
  // ...
];
```

`display()` iterates the array, switching on `control` type. Adding a setting requires **one entry** — no render boilerplate.

### 3. Data-Driven Field Rendering

Optional task fields are rendered via a registry instead of copy-pasted if-blocks:

```typescript
const OPTIONAL_FIELD_RENDERERS: FieldRenderer[] = [
  { inlineKey: 'up', render: t => t.up !== undefined ? String(t.up) : undefined },
  { inlineKey: 'streak', render: t => ... },
  // ...
];
```

Adding a rendered field requires **one entry**.

### 4. Immutable SyncConfig

Settings are snapshotted at sync start:

```typescript
const config: SyncConfig = {
  allowUpdates: options?.allowUpdates ?? false,
  disableScoring: this.settings.disableScoring,
  // ... all other settings
};
```

All 5 steps read from `ctx.config`, never from `this.settings`. Prevents mid-sync Heisenbugs from live settings changes.

### 5. TaskRegistry Aggregate

Instead of `personalTasks.find(...) ?? groupTasks.find(...)` at every call site, a single `TaskRegistry` wraps both arrays:

```typescript
registry.findById(id)          // unified lookup
registry.pushCreated(task)     // append to personal
registry.updateChecklist(id, items)  // update in-place
registry.updateInPlace(id, updated)  // API response → in-memory
registry.remove(id)            // delete from either array
```

The former `_findBoth()` private method collapses the duplicated personal-then-group search pattern.

### 6. Pure Diff for Checklist Items

`_diffChecklistItems()` is a pure function (no API calls, no side effects) that returns categorized deltas:

```typescript
{ newItems, scoreItemIds, editItems, deletedItemIds }
```

This makes the diff testable and separates the "what changed" concern from the "apply changes" concern.

---

## Testing Strategy

**8 test files** covering all pure-logic modules. Run with `npm test` (Node's built-in test runner).

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tags.test.mjs` | 7 | Tag sanitization, normalization, reverse index |
| `format-task-line.test.mjs` | 7 | Task rendering, notes callout, checklist, completion marker, multi-line items |
| `parse-task-line.test.mjs` | 10 | Section→type mapping, date validation, field extraction, tag resolution, checklist items |
| `dataview-block.test.mjs` | 4 | Dataview query block generation per type |
| `inline-fields.test.mjs` | 14 | Token parsing, extraction, stripping, scoring markers, building, round-trips |
| `line-edit.test.mjs` | 7 | Positional splice, unique-line replace, ID-based lookup, ambiguity detection |
| `sync-file-model.test.mjs` | 10 | Classification, scored exclusion, group skip, section tracking, line numbers, nested content |

**Test bundle:** `tests/build-test-bundle.mjs` uses esbuild to bundle `tests/test-barrel.ts` (re-exports from src/) into `tests/dist/barrel.mjs` with `obsidian` marked external.

---

## Build Toolchain

```bash
npm run build     # tsc --noEmit → esbuild → main.js
npm run dev       # esbuild watch mode
npm run lint      # ESLint (obsidianmd plugin rules)
npm run lint:fix  # ESLint with auto-fix
npm test          # Build test bundle + run Node test runner
```

- **typescript:** `tsconfig.json` targets ES2022 with `strict: true`, `noImplicitReturns`, `noEmit`, `esModuleInterop`, `forceConsistentCasingInFileNames`.
- **esbuild:** bundles `src/main.ts` → `main.js` (CJS). `obsidian`, `@codemirror/*`, `@lezer/*` marked external. `builtin-modules` prevents Node built-in bundling (mobile compatibility).
- **ESLint:** flat config with `eslint-plugin-obsidianmd` recommended rules, `@typescript-eslint/parser` with `projectService`, and project-specific overrides.

---

## Security

- **API token:** stored via Obsidian's `SecretStorage` API (macOS Keychain, Linux libsecret, Windows DPAPI). Never written to `data.json`. Only the secret *name* is persisted.
- **Settings:** the `apiToken` field was removed from `PluginSettings`; replaced by `apiTokenSecretName`. The old `data.json` plaintext token is never read by the current code.
- **Logging:** raw task lines in `console.warn`/`console.error` are truncated to 80 characters. Tag names are removed from error messages. Task UUIDs are logged intentionally for debugging (UUIDs are non-secret identifiers).

---

## Deferred / Future Work

See `docs/TODOs.md` for the full list. Key items:

- **Field registry pattern:** the remaining copy-paste in field handling (12+ fields declared across types, parser, formatter, and sync-manager) could be eliminated with a metadata-driven approach — define each field once (name, inline key, type, parse/render/diff functions) and consume everywhere.
- **Reminders DSL:** Habitica reminders are an array-of-objects field. Complex DSL design, low user demand. Deferred.
- **Score-result feedback:** parse HP/XP/Gold deltas from `scoreTask` responses and show notices. Low effort, low priority.
- **Incremental sync:** `updatedAt`-based delta would reduce API calls for large task lists.
- **Machine binding:** `window.crypto.subtle` fingerprinting for device-locking. Requires non-trivial protocol changes.

---

## References

- `docs/plan/plan.md` — Unified implementation plan (Phases 0-15, Field Registry, Obsidian API leverage)
- `docs/plan/validation-pipeline.md` — Step-by-step testing checklist (dev branch only)
- `docs/references/habitica-api-docs.md` — Full Habitica v3 API reference
- `docs/references/habitica-api-links.md` — Supplementary external API resources
- `docs/TODOs.md` — Completed and pending work items
