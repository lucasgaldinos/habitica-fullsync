---
title: "TODOs"
description: "What is missing for this project. Includes completed items from the original TODO list and new findings from the 2026-07-28 code audit."
created: "2026-01-28"
author: "[Lucas Galdino](../../../../authors/Lucas%20Galdino.md)"
tags:
  - "habitica/extensions/obsidian-sync"
  - "habitica/add-ons/todos"
  - "habitica/extensions/todos"
links:
  - "[habitica-fullsync](../../../tasks/habitica-fullsync.md)"
  - "[README](../README.md)"
  - "[plan](plan/plan.md)"
---

# Todos

## ✅ Completed (from original TODO list)

- [x] Dataview blocks for organizing tasks — implemented (Phase 11).
- [x] Notes rendered as nested `> [!note]` callout — implemented (Phase 9).
- [x] Tag hyphen/spacing sanitization — implemented (Phase 8).
- [x] Checklist (subtask) rendering — implemented (Phase 10).
- [x] Create tasks from markdown — implemented (Phase 12).
- [x] Linting infrastructure — ESLint flat config + `eslint-plugin-obsidianmd` + `npm run lint` (2026-07-28).
- [x] Settings file separation — `src/settings.ts` with `DEFAULT_SETTINGS` and `IPluginSettingsHost` (2026-07-28).
- [x] DRY/SOLID refactor of `main.ts` and settings tab (2026-07-28).
- [x] `parseTaskLine`/`parseManagedTaskLine` deduplicated — shared `parseTaskFields()` + `PRIORITY_NAME_TO_VALUE` (2026-07-28).
- [x] `SyncManager.sync()` decomposed into 5 step methods (2026-07-28).
- [x] `rateLimitedFetch` retries 502/503/504 + network failures (2026-07-28).
- [x] `updateLineInFile` throws instead of swallowing (2026-07-28).
- [x] `cleanTitle()` symmetric comparison (2026-07-28).
- [x] `_syncManagedTasks` wrong gate removed (2026-07-29).
- [x] `everyX` added to creation pipeline — 4 files (2026-07-29).
- [x] Checklist regex supports `+ [ ]` / `* [ ]` bullets (2026-07-29).
- [x] UTC date ambiguity fixed — `T00:00:00Z` suffix (2026-07-29).
- [x] Silent `catch {}` blocks now log errors (2026-07-29).
- [x] `SyncContext` + `ParsedTaskFields` moved to `types.ts` (2026-07-29).
- [x] `helpers.ts` decomposed into 6 domain files + barrel re-export (2026-07-29).
- [x] `helpers.ts` barrel file removed — all imports point to domain modules directly (2026-07-29).
- [x] Subtask subId tracking — checklist items now carry `[subId:: uuid]` inline for durable ID-based matching; `scanNestedContent` parses it, `formatTaskLine` renders it, `_syncManagedTasks` prefers subId over text matching (2026-07-29).

---

## 🔴 Critical (code audit 2026-07-28) — ALL DONE ✅

- [x] **DRY: parser duplication.** ✅ Fixed via shared `parseTaskFields()` + `PRIORITY_NAME_TO_VALUE` in `src/parser.ts`.
- [x] **DRY: Priority map duplication.** ✅ Extracted to `PRIORITY_NAME_TO_VALUE` in `src/parser.ts`.

---

## 🟡 Medium (code audit 2026-07-28)

### Architecture / SOLID

- [x] **`SyncManager.sync()` decomposed.** ✅ Split into 5 step methods.
  + `src/sync-manager.ts`

- [x] **Nested function `updateTaskChecklistInMemory` defined inside `_syncManagedTasks()`.** ✅ Extracted to private method `_updateTaskChecklistInMemory(ctx, taskId, checklist)` (2026-07-29).
  + `src/sync-manager.ts`

- [x] **`escapeRegExp` defined in `vault-handler.ts` and re-exported from `helpers.ts`.** ✅ OBE: `helpers.ts` barrel file deleted (2026-07-29). `escapeRegExp` stays in `vault-handler.ts` — it is used only there.
  + `src/vault-handler.ts`

### DRY

- [x] **Tag-creation loop (`newTagNames` → `createTag` → update maps) appears verbatim in two places** (creation pass and update pass in `sync()`). ✅ Extracted to `_createTagsAndRegister()` private method (2026-07-29).
  + `src/sync-manager.ts`

### Code Smells

- [x] **Magic number `4` in `cutoffDate.setDate(cutoffDate.getDate() - 4)`.** ✅ Replaced with `this.settings.completionLookbackDays` — user-configurable via settings UI (2026-07-29).
  + `src/sync-manager.ts:60`, `src/types.ts`, `src/settings.ts`

- [x] **Magic number `30` in `for (let i = 0; i < 30; i++)` (weekly daily-due scan).** ✅ Replaced with `MAX_WEEKLY_LOOKAHEAD_DAYS = 30` constant (2026-07-29).
  + `src/formatter.ts:83`

### Type Safety

- [x] **`json = (await res.json()) as { ... }` — cast assumes response shape.** ✅ Added runtime type-guard: checks `typeof json === 'object'` and `typeof json.success === 'boolean'` before accessing `.success` (2026-07-29).
  + `src/api-client.ts:95`

- [x] **`new Date(task.startDate!)` — non-null assertion `!`.** ✅ Replaced with `(task.startDate ?? '')` fallback + UTC suffix.
  + `src/formatter.ts`

### Error Handling

- [x] **Group-task fetch failure is caught and logged, but the user sees no notice.** ✅ Now shows `this.noticeFn('⚠️ Failed to fetch group tasks…')` so the user knows the sync is partial (2026-07-29).
  + `src/sync-manager.ts:103–106`

- [x] **Completed-vault-task creation failure is caught and logged; task never retried.** ✅ Scoring failures (all three paths) now tracked in `ctx.scoreFailures` and surfaced in the sync summary notice (2026-07-29).
  + `src/sync-manager.ts:148–155`, `src/types.ts`

- [x] **Three vault-handler methods silently `catch {}`.** ✅ Now log errors via `console.error`.
  + `src/vault-handler.ts`

- [x] **`updateLineInFile` swallows errors.** ✅ Now throws; caller catches with duplicate-task warning.
  + `src/vault-handler.ts`, `src/sync-manager.ts`

- [x] **`rateLimitedFetch` retries only on 429.** ✅ Now retries 502/503/504 + network failures.
  + `src/api-client.ts`

### Potential Bugs

- [x] **Task text truncation: `task.line.split(' [')[0]` splits on `[` to remove inline fields.** ✅ Replaced with `cleanTitle`-style field-stripping regex `/\[[a-zA-Z]+:: [^\]]*\]/g` — properly handles titles containing literal `[` (2026-07-29).
  + `src/sync-manager.ts`

- [x] **UTC date ambiguity.** ✅ Fixed with `T00:00:00Z` suffix in `getNextDailyDueDate` and `getRecentCompletedTasks`.
  + `src/formatter.ts`, `src/vault-handler.ts`

- [x] **Duplicate `#daily`/`#habit`/`#reward` tags possible** ✅ Added `!tags.includes('#daily')` guards before pushing type tags — dedup now covers both user tags and type tags (2026-07-29).
  + `src/formatter.ts:119–121`

### Security

- [x] **API token stored unencrypted** ✅ Replaced with Obsidian's native `SecretStorage` API (1.11.4) — token stored in OS credential store, never written to `data.json`. `SecretComponent` in settings UI. No migration needed (no published users) (2026-07-29).
  + `src/settings.ts`, `src/main.ts`, `src/types.ts`, `manifest.json`

- [x] **Raw task line logged via `console.warn`.** ✅ Now truncated to 80 chars with `…` suffix — enough for debugging without exposing full content (2026-07-29). Also applied to the `vault-handler.ts` instance.
  + `src/sync-manager.ts`, `src/vault-handler.ts`

---

## ⚪ Low (code audit 2026-07-28)

### Architecture / Code Smells

- [x] Four `!` definite assignment assertions in `main.ts` — added comment explaining why they're safe (all initialised in `onload()` before any method access).
- [x] `habiticaTask.up ? 'up' : ...` silently defaults to `'up'` — added comment explaining the intent (legacy habit tasks may have both undefined).
- [x] JSDoc for `formatTaskLine` — no longer references 150-char truncation (already cleaned up in prior refactor).
- [x] `saveSettings()` orphans old `SyncManager` — added comment explaining it's harmless (only state is `_syncInFlight`, new sync uses fresh instance).
- [x] `priorityMap` inline in `formatTaskLine` — already extracted to module-level `PRIORITY_VALUE_TO_NAME` in `parser.ts`.

### Performance

- [x] `getRecentCompletedTasks` reads every Markdown file — mtime pre-filter already skips files older than cutoff. Full mtime caching deferred; comment added noting future optimization path.
- [x] `sanitizeTag` Unicode regex — added `sanitizeCache` (Map<string,string>) caching results. Same tag name on many tasks now only sanitizes once.
- [x] Auto-sync back-pressure — enhanced JSDoc on `SyncManager` explaining intentional skip behavior when sync runs longer than the interval.

### Type Safety

- [x] `task.priority` accessed without null-check — explicit `!= null` guard before `String()` call, separates undefined path from unknown-value path.
- [x] Pre-pass scoring doesn't update registry — after successful `scoreTask`, the in-memory task's `completed` flag is now set to `true`, so `filterActive` correctly excludes it from rendered output without relying solely on `scoredIds`.

### Security / Logging

- [x] `console.error` calls log task IDs (UUIDs) — acknowledged as intentional for debugging. UUIDs are non-secret identifiers needed to trace API interactions.
- [x] Error messages include response body — reduced `body.slice(0, 200)` to `body.slice(0, 100)`. Habitica error responses never include auth tokens, and 100 chars is enough for debugging while limiting exposure.
- [x] `console.error(... failed to create tag "${name}" ...)` — tag name removed from error message. Tag creation failures are still logged with full error details; the tag name (potentially personal) is no longer in the message string.

---

## 🟡 Deferred (autopsy refactor 2026-07-29, not in Phase 0-6 scope)

- [x] **`getNextDailyDueDate` DST edge** — `formatter.ts` now uses local-time math consistently: start parsed as local midnight (no `Z` suffix), today as local midnight via `setHours(0,0,0,0)`, all arithmetic in local milliseconds. Eliminates UTC/local mismatch that caused off-by-one date display on DST transition days.
- [x] **Git history token purge** — `data.json` contained a plaintext API token (`apiToken` key) from before the SecretStorage migration. The token has been rotated; check `git log --all -p -- data.json | grep apiToken` to verify it's not in commit history.
- [x] **Priority `'Unknown'` display** — `formatter.ts` now logs `console.warn` when a priority value has no mapping, before falling back to `'Unknown'`.
- [x] **`VaultHandler.writeFile` adapter fallback** — JSDoc and inline comment now explain the TFile-first design and why the adapter fallback exists (first sync / externally deleted file).
- [x] **`_enqueue` `lastRequestTime` after retries** — `lastRequestTime` is now set AFTER the operation completes (post-retries), so the inter-request spacing includes any 429 backoff time.
- [x] **Checklist text-edit detection (Phase 9 deferred)** — implemented in Phase 11: subId-based text comparison in `_syncManagedTasks` checklist loop, fires `updateChecklistItem` when text differs.
- [x] **Orphaned Habitica task on score failure (pre-existing)** — `_scoreCompletedTasks` now writes `[id::]` to the vault line immediately after `createTask` succeeds, before `scoreTask`. If scoring fails, the ID is preserved so the next sync finds the existing task (by ID) and retries scoring instead of creating a duplicate.
- [x] **`stripInlineFields` regex inconsistency (pre-existing)** — `stripInlineFields` now delegates to the shared `FIELD_RE` (same regex as `parseInlineFields`), so fields like `[id::abc]` (no space after `::`) are consistently stripped.
- [x] **Emoji tag names → 'unknown' (pre-existing)** — `sanitizeTag` regex now includes `\p{Extended_Pictographic}` in the allowed character class, preserving emoji in tag names (e.g. "⭐ important" → `⭐-important` instead of `unknown`).

### Error Handling

- [ ] `allTasks.find()` uses first match if same ID appears in both personal and group task arrays (unlikely but possible if API changes).

## 🟡 Known diff gaps — phased plan

Habitica task fields that the plugin **fetches and renders** but never diffs against the markdown. Editing them in the markdown has no effect; editing them in Habitica is correctly rendered on next sync. All API-supported (see `docs/plan/plan.md` § API-feasibility audit).

### Phase 11 — Checklist diff completion (no new DSL, pure diff logic)

Depends on: nothing. Both items share the `_syncManagedTasks` checklist loop (sync-manager.ts:300-350) — implement together.

- [x] **Checklist text-edit detection** — subId match + `ci.text !== habItem.text` → `PUT /tasks/:taskId/checklist/:itemId` with `{text: ci.text}`. Third branch in existing match logic; no new DSL tokens.
- [x] **Checklist item deletion** — detect subIds in server checklist absent from parsed checklist → `DELETE /tasks/:taskId/checklist/:itemId`. Idempotent (404 on already-deleted is catchable).

### Phase 12 — Simple field diffs (new DSL tokens, one per field)

Depends on: Phase 11 (checklist loop stabilized). All four are independent of each other — implement in parallel if desired.

- [x] **Up / down (habit direction)** — new tokens `[up:: true/false]`, `[down:: true/false]`. Boolean parse in `parseTaskFields`, render in `formatTaskLine`, diff in `_syncManagedTasks`. API: `PUT /tasks/:taskId` accepts `{up, down}`.
- [x] **Streak (daily counter)** — new token `[streak:: N]`. Number parse. API: `PUT /tasks/:taskId` accepts `{streak}`. Low priority (server-managed; diff allows manual correction).
- [x] **Attribute (str/int/per/con)** — new token `[attribute:: str]`. Enum parse. API: `PUT /tasks/:taskId` accepts `{attribute}`. Low priority (rarely changed per-task).

### Phase 13 — Recurrence field diffs (interdependent DSL tokens)

Depends on: Phase 11 (checklist loop stabilized). Frequency, everyX, repeat, and startDate are interdependent (frequency gates repeat and everyX). Implement as one unit.

- [x] **Frequency** — new token `[frequency:: daily/weekly/monthly/yearly]`. Enum parse. API: `PUT /tasks/:taskId` accepts `{frequency}`. Daily tasks only.
- [x] **EveryX** — new token `[everyX:: N]`. Number parse. Only valid when frequency is set. API: `PUT /tasks/:taskId` accepts `{everyX}`.
- [x] **Repeat (weekly days)** — new token `[repeat:: su,m,t,w,th,f,s]` (comma-separated lowercase day codes). Parse into `Record<string, boolean>`. Only valid when `frequency=weekly`. API: `PUT /tasks/:taskId` accepts `{repeat}`.
- [x] **StartDate** — new token `[startDate:: YYYY-MM-DD]`. Date parse via `isValidDateString`. Daily tasks only. API: `PUT /tasks/:taskId` accepts `{startDate}`.

### Phase 14 — Task deletion (destructive, needs safety design)

Depends on: design doc (not code). Deletion is destructive — wrong design = data loss.

- [x] **Design doc** — `[delete::]` sentinel on managed line. Documented in `docs/plan/deletion-design.md`. Challenge/group guard: skip with warning, increment `skippedDeletions`.
- [x] **Implementation** — parse `[delete::]` in `parseTaskFields`, fire `DELETE /tasks/:taskId` in `_syncManagedTasks`, remove from registry, surface `deletedCount` + `skippedDeletions` in summary.

### Phase 15 — Reminders (complex array-of-objects DSL, deferrable)

Depends on: Phase 11 (stable diff infrastructure). Lowest priority — most users manage reminders in the Habitica UI.

- [ ] **Reminders** — new DSL for array-of-objects: `[reminder:: 2026-08-01T09:00]` or similar. Parse into `{id, startDate, time}[]`. Render from server data. Diff: add/remove/update individual reminders. API: `PUT /tasks/:taskId` accepts `{reminders}`. Complex — defer until user demand.

---

## 🔴 Architectural Debt — Field List Shotgun Surgery (2026-08-01 audit)

The single biggest architectural problem in the codebase. Twelve task fields (`text`, `priority`, `date`, `notes`, `tags`, `up`, `down`, `streak`, `attribute`, `frequency`, `everyX`, `repeat`, `startDate`) are declared, parsed, rendered, and diffed across 5 files with zero shared abstraction. This is why adding a field is a 5-file, ~50-line change instead of a one-file, ~5-line change.

The `OPTIONAL_FIELD_RENDERERS` registry in `formatter.ts` and the `SETTING_DEFS` array in `settings.ts` prove the data-driven pattern works — it was just never applied to the field system. The `_setIfChanged()` helper in `sync-manager.ts` is a step in the right direction but only covers the diff side; the parse and render halves still use copy-paste.

### Field Registry — design target

Create a **single metadata definition** of every task field that the plugin handles:

```typescript
// src/field-registry.ts (new file)
interface FieldDefinition {
  name: string;                    // e.g. 'priority'
  inlineKey: string;               // e.g. 'priority'
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'string[]' | 'weekdayMap';
  // Parse: extract from ParsedTaskFields (or parseInlineFields result)
  parseFromFields: (fields: Map<string, string>) => unknown;
  // Render: produce [key:: value] token (or undefined to omit)
  renderToken: (task: HabiticaTask) => string | undefined;
  // Diff: compare parsed vs Habitica, return [key, value] if changed
  diff: (parsed: unknown, habitica: unknown) => [string, unknown] | undefined;
  // API body key (for PUT /tasks/:id)
  apiKey: string;
  // Allowed values (for enum types)
  allowedValues?: readonly string[];
  // Default Habitica value (omit from rendering when set to this)
  defaultValue?: unknown;
}
```

A single `FIELD_REGISTRY: FieldDefinition[]` replaces:
- The 12-field `if (fields.get('priority'))` chain in `parser.ts:parseTaskFields` (~85 lines)
- The `OPTIONAL_FIELD_RENDERERS` array in `formatter.ts` (~30 lines)
- The 8 `this._setIfChanged()` calls in `sync-manager.ts:_syncManagedTasks` (~40 lines)
- The inline field-building logic in `formatter.ts:formatTaskLine` (~15 lines)

**Net reduction: ~200 lines → ~80 lines.** Adding a field becomes a one-file, ~8-line change.

### Sub-tasks ✅ Completed 2026-08-01

- [x] **F1 — Create `src/field-registry.ts`**: define `FieldDefinition` interface and `FIELD_REGISTRY` constant. Port all 12 existing fields (now 14 including `text` and `delete`). Include JSDoc for each field documenting the API behavior. ~364 lines.
  + `src/field-registry.ts` (new)
- [x] **F2 — Adopt in `parser.ts:parseTaskFields()`**: replaced the 85-line `if (fields.get('priority'))` / `if (fields.get('due'))` / … chain with `parseFieldFromRegistry()` calls delegating to the registry. Context-dependent fields (due/date/startDate/frequency) kept as explicit logic — correct design choice given typescript's inability to map union-typed keys cleanly. ~6 calls replaced.
  + `src/markdown/parser.ts`
- [x] **F3 — Adopt in `formatter.ts:formatTaskLine()`**: deleted `OPTIONAL_FIELD_RENDERERS` array, `FieldRenderer` type, and `WEEKDAY_KEYS` const. Replaced with `for (const def of FIELD_REGISTRY)` loop with `CORE_RENDERED_KEYS` skip-set. ~22 lines deleted, ~6 lines added.
  + `src/markdown/formatter.ts`
- [x] **F4 — Adopt in `sync-manager.ts:_syncManagedTasks()`**: replaced the 8 `_setIfChanged()` calls with `for (const def of FIELD_REGISTRY)` loop. Sentinel fields skipped. `tags`→`tagIds` key mapping for ManagedTaskFields impedance match. ~55 lines → 12 lines.
  + `src/sync/sync-manager.ts`
- [x] **F5 — Adopt in `api-client.ts`**: `createTask` and `updateTask` body construction iterate `FIELD_REGISTRY`. Sentinels, stringSet, text, and notes skipped (handled explicitly). `TaskMutateFields` type deleted.
  + `src/api/api-client.ts`
- [x] **F6 — Verify**: `npm test` (61 tests), `npm run build` (tsc + esbuild), manual sync diff-equivalence verified.
- [x] **F7 — Cleanup**: `OPTIONAL_FIELD_RENDERERS` deleted. `_setIfChanged()` deleted. `TaskMutateFields` deleted. `FieldRenderer` type deleted. `WEEKDAY_KEYS` moved to field-registry.ts.

### Related shotgun surgery items ✅ Completed 2026-08-01

- [x] **S1 — `HabiticaApiClient` input type duplication**: extracted `CreateTaskInput` and `UpdateTaskInput` exported interfaces from the formerly inline parameter types. Both now live at module level in `api-client.ts`. ~25 lines of inline type declarations replaced with 2 named interfaces.
  + `src/api/api-client.ts`
- [x] **S2 — `filterActive` called 8 times in `_renderAndWrite`**: `_partitionTasksByType()` pre-computes all 8 buckets. `_renderAndWrite` uses `sectionDefs` array loop instead of 8 individual destructured variables.
  + `src/sync/sync-manager.ts:_renderAndWrite`
- [x] **S3 — `SyncReport.renderSummary()` pluralization boilerplate**: replaced 7 `if (this.X > 0)` blocks with data-driven `parts: Array<[number, string, string?]>` + single `for` loop. ~40 lines → ~25 lines.
  + `src/sync/sync-report.ts`
- [x] **S4 — `updateLineInFile` duplicates `updateLine` logic**: `updateLineInFile` deleted. `updateLine` unified to accept `TFile | string`. `_readContent` and `_writeContent` shared helpers extracted; `writeFile` also delegates to `_writeContent`. ~75 lines removed.
  + `src/vault/vault-handler.ts`

---

## 🟡 Obsidian API Leverage Opportunities (2026-08-01 audit)

The plugin currently imports from `'obsidian'` in only 3 files: `main.ts` (`Plugin`, `Notice`), `settings.ts` (`App`, `PluginSettingTab`, `Setting`, `SecretComponent`), and `vault/vault-handler.ts` (`App`, `TFile`). This minimal footprint is good for testability but we are leaving several Obsidian APIs unused that would improve correctness, UX, and performance.

### High impact (should implement) ✅ Completed 2026-08-01

- [x] **O1 — Use `requestUrl` instead of raw `fetch`**: Obsidian's `requestUrl` handles CORS, mobile network proxies, and has built-in timeout/retry behavior. The plugin makes external API calls as its *primary function*. Replace `window.fetch` in `rateLimitedFetch` with `requestUrl`. Requires `minAppVersion` ≥ 0.13.0 (we're at 1.11.4). The response shape differs slightly (`requestUrl` returns `{ status, headers, text, json }`) — the `_parseResponse` method needs adaptation. ~30 lines changed.
  + `src/api/api-client.ts:rateLimitedFetch`
  + `manifest.json` (verify minAppVersion supports requestUrl)
- [x] **O2 — Wrap first auto-sync in `Workspace.onLayoutReady()`**: the current `onload()` starts auto-sync immediately, before `metadataCache` may be populated. The Obsidian docs explicitly recommend gating first sync on layout readiness. The fix is a one-line wrap. This is a real race condition, not theoretical — users who open Obsidian with many files will have incomplete vault scans on first sync.
  + `src/main.ts:onload()`
- [x] **O3 — Add ribbon icon for manual sync trigger**: `Plugin.addRibbonIcon('refresh-cw', 'Sync Habitica tasks', () => this.syncHabitica(true))`. Standard Obsidian UX convention. Every other sync plugin has one. 5 lines.
  + `src/main.ts:onload()`
- [x] **O4 — Add status bar item for sync state**: show "⏳ Syncing…" while `_syncInFlight`, "✅ Synced just now" after completion, "❌ Sync failed" on error. `sync()` returns a status string (`'completed' | 'skipped-in-flight' | 'skipped-cooldown'`) so the status bar doesn't lie when sync is skipped. ~35 lines.
  + `src/main.ts` (new private fields + status bar item management)
  + `src/sync/sync-manager.ts` (sync() return type changed from void to string)

### Medium impact (nice to have) ✅ Completed 2026-08-01

- [x] **O5 — Use `normalizePath()` for all path construction**: replace template literals like `${outputFolder}/habitica-fullsync.md` with `normalizePath(`${outputFolder}/habitica-fullsync.md`)`. Prevents cross-platform path bugs (Windows backslash, double slashes). Obsidian internally normalizes but the API contract says callers should normalize. ~8 lines across 2 files.
  + `src/sync/sync-manager.ts` (filePath construction)
  + `src/vault/vault-handler.ts` (path arguments)
- [x] **O6 — Subscribe to `MetadataCache.on('changed')` for incremental vault scanning**: instead of rescanning every `.md` file on every sync, maintain a `Set<string>` of recently modified files by subscribing to cache change events. The full scan still runs when the set is empty as a consistency check. ~20 lines.
  + `src/vault/vault-handler.ts` (new subscription in constructor or on init)
  + `src/main.ts` (register/unregister event)
- [x] **O7 — Use `Plugin.registerEvent()` for automatic cleanup**: replace manual `window.clearInterval` in `onunload` with `this.registerEvent()` calls for interval handles and future MetadataCache subscriptions. The framework does the cleanup — fewer lines, fewer leaks. ~5 lines changed.
  + `src/main.ts:_scheduleAutoSync`
- [x] **O8 — Use `FileManager.trashFile()` if we ever add a "delete sync file" feature**: respects user's trash preferences (system trash vs `.trash/` folder). Currently no deletion feature exists, but if one is added, don't use `adapter.remove` — use `trashFile`.
  + Future feature — documented for awareness. No code change needed.

### Low impact (documented for awareness) ✅ All addressed 2026-08-01

- [x] **O9 — `requireApiVersion('1.11.4')` guard at plugin load**: fails fast with a clear message if the plugin is loaded on an older Obsidian version. Currently we just set `minAppVersion` in `manifest.json` and hope for the best. ~3 lines.
  + Skipped — `requireApiVersion` is not exported from the `obsidian` package types. `minAppVersion` in `manifest.json` already enforces this at the Obsidian plugin loader level.
- [x] **O10 — `FileManager.generateMarkdownLink()` for task references**: if we ever add cross-references between the sync file and individual task files (e.g., a "task detail" note per Habitica task), use `generateMarkdownLink` to produce correct relative links. Currently unused — document the API.
  + Future feature — documented for awareness. No code change needed.
- [x] **O11 — `Vault.create()` / `Vault.delete()` for file lifecycle**: we use `adapter.write` for first-sync file creation (when `TFile` doesn't exist yet). Obsidian's `Vault.create` is the canonical API — it creates the file, indexes it, and fires events. The adapter bypasses all of this. The current code has a TFile-first fallback that's architecturally sound; the comment at vault-handler.ts explains the trade-off. No immediate action needed — the existing pattern is defensible.
  + `src/vault/vault-handler.ts:writeFile` — current pattern is defensible; documented.

---

## � Pre-Launch Checklist (2026-08-04 ESLint audit)

Cross-referenced against the [Obsidian plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines), [submission requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins), and [October self-critique checklist](https://docs.obsidian.md/oo/plugin).

### 🔴 Blocker: Fix ESLint config — three rules disabled unnecessarily

The current `eslint.config.mjs` ships three rule overrides that the codebase already complies with. They should be re-enabled as guardrails.

- [x] **Re-enable `no-restricted-globals`**: Code already uses `requestUrl` (O1 completed in v1.8.0). Zero `fetch()` calls exist in `src/`. The config comment claiming "fetch is intentional" is factually wrong — the method is named `rateLimitedFetch` but calls `requestUrl` internally. Fix the comment and remove the override.
  + `eslint.config.mjs:59–60` — remove `'no-restricted-globals': 'off'` and its misleading comment.
- [x] **Re-enable `eslint-comments/no-restricted-disable`**: Zero `eslint-disable` comments exist anywhere in `src/`. The recommended config blocks these to prevent rules from being silenced without review. Re-enable.
  + `eslint.config.mjs:62` — remove `'eslint-comments/no-restricted-disable': 'off'`.
- [x] **Re-enable `obsidianmd/sample-names`**: Zero sample names (`MyPlugin`, `SampleSettingTab`) exist in the codebase. The October checklist explicitly requires placeholder removal. Re-enable to prevent regressions.
  + `eslint.config.mjs:65` — remove `'obsidianmd/sample-names': 'off'`.
- [x] **Run `npm run lint` after changes** — verified 0 errors, 0 warnings (2026-08-04).
- [x] **Relocate misplaced type declarations to `types.ts`** (2026-08-04 audit): `IPluginSettingsHost` moved from `settings.ts`, `InlineFields` moved from `markdown/inline-fields.ts`. Both are pure types with zero Obsidian imports — the `types.ts` file is the single source of truth for shared interfaces (now 13 interfaces/types). `DeclarativeControlDef`/`DeclarativeSettingEntry` remain local to `settings.ts` (non-exported; `DeclarativeSettingEntry` references `Setting` from `'obsidian'`). Full audit confirmed no other misplaced exported types. `npm run lint`: 0 errors, 0 warnings.
  + `src/types.ts` — added `IPluginSettingsHost`, `InlineFields`
  + `src/settings.ts` — removed `IPluginSettingsHost`, imports from `./types`
  + `src/markdown/inline-fields.ts` — removed `InlineFields`, imports from `../types`

### 🟡 Pre-Launch: Manifest description cleanup

- [x] **Rewrite `manifest.json` description** (2026-08-04): Changed from comma-separated feature list with fork backstory to action-oriented 170-char description. "Bidirectional sync of Habitica tasks into Obsidian markdown. Score completions, create tasks from notes, sync checklists, tags, and recurrence rules — all from your vault."

### 🟡 Pre-Launch: sql.js mobile compatibility — deferred (2026-08-04)

The plugin uses `sql.js` (SQLite WASM, ~1.5MB) persisted via `Vault.adapter.writeBinary`. On mobile, the adapter is `CapacitorAdapter`. WASM is technically web-standard and should work in mobile WebViews, but the Obsidian review may scrutinize it.

- [ ] **Deferred until ≥1 beta tester with physical device is available**: Test `sql.js` WASM initialization, `adapter.writeBinary`, `adapter.mkdir`, and `adapter.exists` on real Android (Chrome WebView via USB debugging) and iOS (Safari WebView via Web Inspector) devices.
- [ ] **Decision gate — if any test fails**: Migrate to Dexie.js (IndexedDB wrapper, ~20KB). See `docs/plan/plan.md` § Pre-Launch Readiness Audit for fallback options A/B/C.

### 🟡 Pre-Launch: Address `obsidianmd/settings-tab/prefer-setting-definitions` warning

`npm run lint` reports 1 warning in `src/settings.ts`. The data-driven `SETTING_DEFS` render loop is architecturally clean but diverges from the canonical pattern.

- [x] **Add `getSettingDefinitions()` with dual-support (Path B)**: implemented declarative API alongside existing `display()`. `SecretComponent` handled via `render` callback (not natively supported as a declarative control type). `outputFolder` upgraded to native `folder` control. Local `DeclarativeControlDef`/`DeclarativeSettingEntry` types until `minAppVersion` ≥ 1.13.0. `_renderApiTokenControl()` extracted as private method — shared between both paths (DRY). Verified 0 errors, 0 warnings via `npm run lint` (2026-08-04).
  + `src/settings.ts:getSettingDefinitions()`, `_renderApiTokenControl()`

### ⚪ Pre-Launch: Beta testing (deferred)

- [ ] **Deferred until pre-release is cut**: Create GitHub release, distribute via BRAT, recruit ≥3 testers (desktop + Android + iOS), collect feedback for ≥1 week. See `docs/plan/plan.md` § Pre-Launch Readiness Audit.

---

## Future (from plan.md)

- [ ] Machine binding / device-locking via `window.crypto.subtle`
- [ ] Score-result feedback (HP/XP/Gold delta notices)
- [ ] Conflict resolution for tasks completed on two devices between syncs
- [ ] Incremental sync via `updatedAt`-based delta
- [ ] Unit test automation (Jest/Vitest) — helpers are already pure functions across `src/platform.ts`, `src/tags.ts`, `src/scanner.ts`, `src/dataview.ts`, `src/formatter.ts`, `src/parser.ts`
- [ ] `getSettingDefinitions()` adoption for Obsidian 1.13+ settings search (requires password-masking and validation support in the declarative API)
