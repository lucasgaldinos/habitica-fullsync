---
title: "habitica-fullsync — Implementation Plan"
description: "Bug-fix and hardening plan for the habitica-fullsync Obsidian plugin. Covers TypeScript + esbuild toolchain migration, payload validation, concurrency guarding, vault mutation safety, daily due-date math, dead code removal, and UX polish."
created: "2026-05-14"
author: "[[Lucas Galdino]]"
tags: []
links: []
---

# habitica-fullsync full implementation plan

## 1. Refactor Analysis

### 1.1 Code Smell Inventory

>[!note]
> Line references are against the current `main.js` (471 lines, vanilla CJS). They become approximate after Phase 0 splits the file into `src/` modules — adjust references by module name after that point.

| # | Smell | Location | Severity |
| --- | --- | --- | --- |
| S1 | Unchecked `.map()` on potentially-undefined API array | `SyncManager.sync` L132, `formatTaskLine` L210 | 🔴 Critical |
| S2 | HTTP response consumed without `res.ok` / Habitica `success` field check | `fetchUserTasks` L36, `fetchTags` L41, `fetchGroupTasks` L46, `createTask` L55, `scoreTask` L59–63 | 🔴 Critical |
| S3 | No in-flight guard — concurrent sync runs are possible | `syncHabitica` L350–352, `onload` L319–321, command callback L304 | 🔴 Critical |
| S4 | Regex line-replacement keyed on task text prefix, not on stable ID | `VaultHandler.updateLine` L97 | 🟠 High |
| S5 | `everyX` daily due-date loop precondition is always false | `getNextDailyDueDate` L241 — `while (baseDate < start)` unreachable when `baseDate === start` | 🟠 High |
| S6 | `crypto` imported + `machineId` setting present; no runtime enforcement | L3, L342 | 🟡 Medium |
| S7 | API token rendered in plaintext `<input>` | `HabiticaSyncSettingTab.display` L377–386 | 🟡 Medium |
| S8 | `scoreTask` return value never validated or awaited for success | L159, L167 | 🟡 Medium |
| S9 | `formatTasks` / `formatTaskLine` / `getNextDailyDueDate` are closures scoped inside `sync()`, redeclared on every call | L203–263 | 🟢 Low |
| S10 | `filterActive` lambda also declared inside `sync()` | L179–180 | 🟢 Low |
| S11 | `notes` field not null-guarded when calling `.replace()` | L217 — already guarded by ternary, but `task.notes` could be `null` rather than `undefined`; `.replace` on `null` throws | 🟡 Medium |
| S12 | `task.date` not validated before `new Date(task.date)` | L221 | 🟡 Medium |
| S13 | `task.startDate` not validated before `new Date(task.startDate)` | L235 | 🟡 Medium |
| S14 | `machineId` field stored and loaded from settings but never read | L342 | 🟢 Low |
| S15 | Entire codebase is a 471-line vanilla CJS blob with implicit `any` everywhere | All of `main.js` | 🟠 High |

### 1.2 Existing Patterns Worth Keeping

| Pattern | Where | Note |
| --- | --- | --- |
| Rate-limit retry with exponential backoff | `rateLimitedFetch` L19–32 | Solid — keep as-is |
| Class-per-concern separation (`ApiClient`, `VaultHandler`, `SyncManager`, `Plugin`) | L6–353 | Clean boundary — maps directly to the `src/` module split |
| `try/catch` around group-task fetch | L135–139 | Good isolation — extend same pattern to all API calls |
| Platform-aware auto-sync gating | L310–322 | Keep exactly |
| `%%scored%%` marker to prevent double-scoring | L83, L161, L169 | Keep; extend to prevent races |
| `escapeRegExp` helper | L67–69 | Keep; moves to `src/helpers.ts` |
| `outputFolder` + `ensureFolder` | L101–107 | Keep |

### 1.3 Reimplementation Strategy

**Do not rewrite from scratch.** Surgical fixes per phase, preserving all working logic. Each phase is independently verifiable with `npm run build`. The class structure remains unchanged; only method bodies, one setting UI element, and the surrounding toolchain change.

Execution order: Phase 0 establishes the build foundation. Phases 1–7 apply fixes in risk-priority descending order — crashes first, data safety second, UX polish last.

---

## 2. Source Module Structure

The current 471-line monolith gets split into the following `src/` layout. **No logic changes are made during the split** — that is Phase 0's only job. Logic changes happen in Phases 1–7.

```tree
habitica-fullsync/
├── src/
│   ├── main.ts          # HabiticaSyncFullPlugin, HabiticaSyncSettingTab, isMobilePlatform
│   ├── api-client.ts    # HabiticaApiClient
│   ├── vault-handler.ts # VaultHandler
│   ├── sync-manager.ts  # SyncManager
│   ├── helpers.ts       # escapeRegExp, toLocaleDateStringSafe, formatTaskLine,
│   │                    #   getNextDailyDueDate, formatTasks, filterActive
│   └── types.ts         # PluginSettings, HabiticaTask, HabiticaTag interfaces
├── main.js              # esbuild output — what Obsidian loads; do not edit manually
├── manifest.json
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

Each `src/` file uses ES module `import`/`export` syntax. esbuild bundles everything into `main.js` with `obsidian` marked external. The output is still a single `main.js` — the difference is that the **source** is now typed, modular, and maintainable, rather than a CJS blob that silently treats everything as `any`.

### 2.1 `src/types.ts`

Defines the three interfaces that give the rest of the codebase type safety. Every module imports from here.

```typescript
export interface PluginSettings {
  apiUser: string;
  apiToken: string;
  groupId: string;
  outputFolder: string;
  autoSync: boolean;
  autoSyncPlatform: 'both' | 'desktop' | 'mobile';
  syncInterval: number;
  disableScoring: boolean;
  disableCreating: boolean;
}

export interface HabiticaTag {
  id: string;
  name: string;
}

export interface HabiticaTask {
  id: string;
  type: 'habit' | 'daily' | 'todo' | 'reward';
  text: string;
  notes: string | null;
  tags: string[];
  completed: boolean;
  priority: number;
  date?: string;
  startDate?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  everyX?: number;
  repeat?: Record<string, boolean>;
  up?: boolean;
  down?: boolean;
}
```

These types replace every implicit `any` the vanilla js relied on. The typescript compiler will now catch the class of bugs listed in S1–S13 *at build time* rather than at runtime in someone's vault.

### 2.2 `src/api-client.ts`

Contains `HabiticaApiClient` and nothing else. Imports `HabiticaTask` and `HabiticaTag` from `types.ts`. The `_parseResponse` method added in Phase 1 lives here.

### 2.3 `src/vault-handler.ts`

Contains `VaultHandler`. Imports `App`, `TFile` from `obsidian` for proper typing. Imports `escapeRegExp` from `helpers.ts`.

```typescript
import { App, TFile } from 'obsidian';
import { escapeRegExp } from './helpers';
```

`app.vault.read(file: TFile)`, `app.vault.modify(file: TFile, content: string)`, `app.vault.adapter.exists(path: string)`, `app.vault.createFolder(path: string)`, and `app.vault.adapter.write(path: string, content: string)` are all standard Obsidian Vault API — properly typed via the `obsidian` package.

### 2.4 `src/sync-manager.ts`

Contains `SyncManager`. Imports `HabiticaApiClient` from `api-client.ts`, `VaultHandler` from `vault-handler.ts`, `PluginSettings` from `types.ts`, and all formatting helpers from `helpers.ts`.

### 2.5 `src/helpers.ts`

Contains all pure utility functions: `escapeRegExp`, `toLocaleDateStringSafe`, `formatTaskLine`, `getNextDailyDueDate`, `formatTasks`, and `filterActive`. These have zero Obsidian API dependencies and zero side effects — they are the easiest to test and the most appropriate candidates for isolation. In the original code these were closures inside `sync()` (S9, S10), which is fixed here structurally.

```typescript
import { HabiticaTask } from './types';

export function escapeRegExp(s: string): string { ... }
export function toLocaleDateStringSafe(dateInput: unknown): string | null { ... }
export function getNextDailyDueDate(task: HabiticaTask): string | null { ... }
export function formatTaskLine(task: HabiticaTask, tagLookup: Record<string, string>, today: string): string { ... }
export function formatTasks(taskList: HabiticaTask[], tagLookup: Record<string, string>, today: string): string[] { ... }
export function filterActive(list: HabiticaTask[], type: HabiticaTask['type'], scoredIds: Set<string>): HabiticaTask[] { ... }
```

### 2.6 `src/main.ts`

Plugin entry point. Imports `Plugin`, `PluginSettingTab`, `Setting`, `Notice` from `obsidian`. Imports `HabiticaApiClient`, `VaultHandler`, `SyncManager`, and `PluginSettings`. Contains `HabiticaSyncFullPlugin`, `HabiticaSyncSettingTab`, and `isMobilePlatform`. The default export is `HabiticaSyncFullPlugin` — esbuild resolves this.

```typescript
import { Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
```

---

## 3. Implementation Plan

### Overview

**Problem:** `habitica-fullsync` crashes on real API payloads (missing `tags` array), silently swallows HTTP errors, allows duplicate scoring from concurrent sync runs, mis-targets Markdown lines by text prefix instead of stable ID, computes wrong due dates for multi-day `everyX` dailies, has a dead `crypto` import, and exposes the API token in plain text — all of this in a typeless CJS blob with no build toolchain.

**Success criteria:**

- `npm run build` succeeds with zero typescript errors.
- Zero `TypeError: Cannot read properties of undefined` crashes during normal sync.
- A non-2xx or `success: false` API response throws a named error that surfaces in the sync failure notice, not silently corrupts state.
- Concurrent sync invocations are serialised; the second call is silently skipped while the first is in-flight.
- `updateLine` always uses `[id:: ...]` when present; falls back to prefix-regex only when ID is absent.
- `getNextDailyDueDate` returns the correct next occurrence for `everyX > 1`.
- `crypto` / `machineId` dead code is removed.
- The API token input field uses `type="password"`.
- All existing features continue to work unchanged.

**Users:** Solo Obsidian users + small groups using Habitica party tasks.

---

### Phase 0 — Toolchain Setup
>
> **Goal:** Establish the typescript + esbuild build toolchain. Port `main.js` into the `src/` module structure. Zero logic changes — the output `main.js` must be functionally equivalent to the current one. Everything that follows is built on this foundation.
> **Estimated effort:** Medium — ~2 hours of setup and porting.

#### 0.1 — Initialise `package.json`

Copy the `package.json` from [obsidianmd/obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) or initialise from scratch. The relevant sections:

```json
{
  "name": "habitica-fullsync",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc --noEmit --skipLibCheck && node esbuild.config.mjs production"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "esbuild": "^0.21.0",
    "obsidian": "latest",
    "typescript": "^5.0.0"
  }
}
```

Run `npm install`. This produces `node_modules/` — add it to `.gitignore` if not already there.

#### 0.2 — Add `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "CommonJS",
    "target": "ES2018",
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["ES6", "DOM"]
  },
  "include": ["src/**/*.ts"]
}
```

`strict: true` is the eventual goal. For the initial port, `strictNullChecks: true` is sufficient — it will catch the null/undefined bugs from S1–S13 at compile time. Full strict mode can be enabled after Phase 1 resolves all the guards.

#### 0.3 — Add `esbuild.config.mjs`

```javascript
import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins,
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
```

`obsidian` is marked external — esbuild will not bundle it. Obsidian's runtime provides it. Every other dependency gets bundled. `builtin-modules` prevents Node built-ins from being bundled (mobile compatibility — Node built-ins don't exist in the WebView).

#### 0.4 — Port `main.js` into `src/` modules

Split the current `main.js` into the six files described in Section 2. Rules for this step:

- **No logic changes.** Copy method bodies verbatim; only add `import`/`export` statements.
- The `crypto` import (`const crypto = require('crypto')`) is dropped here — it had no usages. This is the only removal permitted in Phase 0.
- The `require('obsidian')` calls become a single `import { Plugin, PluginSettingTab, Setting, Notice } from 'obsidian'` at the top of `src/main.ts`.
- Inner closures (`formatTasks`, `formatTaskLine`, `getNextDailyDueDate`, `filterActive`) move to `src/helpers.ts` and become module-level exports. Their signatures gain explicit typescript parameters in Phase 1; for now, annotate parameters as their best-guess types and add `// TODO: tighten in Phase 1` comments where `any` is unavoidable.
- `module.exports = HabiticaSyncFullPlugin` at the bottom of `main.js` becomes `export default HabiticaSyncFullPlugin` in `src/main.ts`. esbuild handles the CJS interop.

#### 0.5 — Verify build

```bash
npm run build
```

The output `main.js` should load in Obsidian and behave identically to the original. Do a full manual sync and confirm the output file is produced. If the build fails, fix typescript errors before proceeding to Phase 1 — do not paper over them with `// @ts-ignore`.

**Deliverables for Phase 0:**

- [x] `package.json` present with `dev` and `build` scripts
- [x] `npm install` succeeds; `node_modules/` present
- [x] `tsconfig.json` present with `strictNullChecks: true`
- [x] `esbuild.config.mjs` present
- [x] `src/types.ts` present with `PluginSettings`, `HabiticaTask`, `HabiticaTag` interfaces
- [x] `src/main.ts`, `src/api-client.ts`, `src/vault-handler.ts`, `src/sync-manager.ts`, `src/helpers.ts` present
- [x] `const crypto = require('crypto')` removed (only logic removal permitted in this phase)
- [x] `npm run build` succeeds with zero errors
- [x] Manual sync test passes — output file produced correctly

> ✅ Verified 2026-05-14 — all `src/` modules created, esbuild bundles to `main.js`, `strict: true` active in final tsconfig.

**Complexity:** Medium
**Dependencies:** None
**Testing checkpoint:** `npm run build` must exit 0. Load the plugin in Obsidian and run a full sync. Output must match what the original `main.js` produced.

---

### Phase 1 — Payload Validation Hardening
>
> **Goal:** Eliminate all crash vectors from unchecked array/property access on API payloads. These are the bugs that produce `TypeError: Cannot read properties of undefined` at runtime in production vaults — i.e., in the environment where the developer is not watching the console.
> **Estimated effort:** Small — ~25 lines changed. All changes are in `src/api-client.ts`, `src/helpers.ts`, and `src/sync-manager.ts`.

#### 1.1 — `fetchTags` null-safe tagLookup (L132)

**Current (L132):**

```js
const tagLookup = Object.fromEntries(tags.map(tag => [tag.id, tag.name]));
```

**Fix:**

```js
const rawTags = Array.isArray(tags) ? tags : [];
const tagLookup = Object.fromEntries(rawTags.map(tag => [tag.id, tag.name]));
```

*Why `Array.isArray` instead of `|| []`: guards against `null`, `false`, `0`, and non-array truthy values uniformly.*

#### 1.2 — `fetchUserTasks` and `fetchGroupTasks` array guards (L130–136, L141)

After each API call, wrap the result:

```js
const tasks      = Array.isArray(await this.apiClient.fetchUserTasks())
                     ? await this.apiClient.fetchUserTasks()   // ← WRONG: double call
                     : [];
```

The cleanest pattern — assign once, then guard:

```js
const rawTasks = await this.apiClient.fetchUserTasks();
const tasks = Array.isArray(rawTasks) ? rawTasks : [];
// ... (same for groupTasks)
const allTasks = [...tasks, ...groupTasks];
```

#### 1.3 — `task.tags` null-safe in `formatTaskLine` (L210)

**Current (L210):**

```js
const tags = task.tags.map(id => `#${tagLookup[id] || 'unknown'}`);
```

**Fix:**

```js
const tags = (Array.isArray(task.tags) ? task.tags : []).map(id => `#${tagLookup[id] || 'unknown'}`);
```

#### 1.4 — `task.notes` null guard (L216–218)

**Current:**

```js
const notesPart = task.notes
  ? ` (${task.notes.replace(/(\r\n|\n|\r)/g, '; ').trim()})`
  : '';
```

This crashes if `task.notes === null` (null is truthy... wait, null is falsy — actually safe).
**However**, `task.notes` could be a number (Habitica schema is loose). Add explicit string coercion:

```js
const notesRaw = task.notes != null ? String(task.notes) : '';
const notesPart = notesRaw
  ? ` (${notesRaw.replace(/(\r\n|\n|\r)/g, '; ').trim()})`
  : '';
```

#### 1.5 — `task.date` and `task.startDate` date guards (L221, L235)

**Current (L221):**

```js
if (task.type === 'todo' && task.date) {
  line += ` [due:: ${new Date(task.date).toLocaleDateString('en-CA')}]`;
}
```

`new Date(undefined)` returns `Invalid Date`; `toLocaleDateString` on an Invalid Date returns `"Invalid Date"`.

**Fix — add `toLocaleDateStringSafe` to `src/helpers.ts` (not inline, not inside a closure):**

```typescript
export function toLocaleDateStringSafe(dateInput: unknown): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput as string);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-CA');
}
```

Use it:

```typescript
// in formatTaskLine (src/helpers.ts)
const dueDateStr = toLocaleDateStringSafe(task.date);
if (task.type === 'todo' && dueDateStr) {
  line += ` [due:: ${dueDateStr}]`;
}
```

```typescript
// at top of getNextDailyDueDate (src/helpers.ts)
const start = new Date(task.startDate!);
if (isNaN(start.getTime())) return null;   // ← guard early-return
```

#### 1.6 — HTTP response validation in `HabiticaApiClient` (`src/api-client.ts`)

Add a private helper method inside `HabiticaApiClient`:

```typescript
private async _parseResponse<T>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch (_) {}
    throw new Error(`Habitica API error [${context}]: HTTP ${res.status} — ${body.slice(0, 200)}`);
  }
  let json: { success: boolean; data: T; message?: string };
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Habitica API error [${context}]: invalid JSON response`);
  }
  if (json.success === false) {
    throw new Error(`Habitica API error [${context}]: ${json.message || 'unknown error'}`);
  }
  return json.data;
}
```

Replace every raw `(await res.json()).data` usage:

| Method | Replace with |
| --- | --- |
| `fetchUserTasks` | `return await this._parseResponse<HabiticaTask[]>(res, 'fetchUserTasks');` |
| `fetchTags` | `return await this._parseResponse<HabiticaTag[]>(res, 'fetchTags');` |
| `fetchGroupTasks` | `return await this._parseResponse<HabiticaTask[]>(res, 'fetchGroupTasks');` |
| `createTask` | `return await this._parseResponse<HabiticaTask>(res, 'createTask');` |
| `scoreTask` | `return await this._parseResponse<unknown>(res, \`scoreTask/${id}\`);` |

The generic type parameter makes the return type explicit across the codebase. typescript will now complain loudly if a call site misuses the result.

**Deliverables for Phase 1:**

- [x] `toLocaleDateStringSafe` added to `src/helpers.ts` as a named export
- [x] `_parseResponse<T>` method added to `HabiticaApiClient` in `src/api-client.ts`
- [x] All 5 API methods updated to use `_parseResponse` with correct generic type
- [x] `tagLookup` assignment guarded with `Array.isArray`
- [x] `tasks` and `groupTasks` assignments guarded with `Array.isArray`
- [x] `task.tags` in `formatTaskLine` guarded
- [x] `task.notes` coerced to string
- [x] `task.startDate` / `task.date` validated with `toLocaleDateStringSafe`
- [x] `npm run build` exits 0 with zero typescript errors

> ✅ Verified 2026-05-14 — all guards present in `src/helpers.ts` and `src/api-client.ts`; build passes.

**Complexity:** Small
**Dependencies:** Phase 0
**Testing checkpoint:** `npm run build` must pass. Trigger sync with a Habitica account that has reward tasks (rewards frequently omit `tags`). Confirm no `TypeError` in the Obsidian console.

---

### Phase 2 — Sync Concurrency Guard
>
> **Goal:** Ensure at most one sync run is in-flight at any time. Auto-sync and manual command must not overlap.
> **Estimated effort:** Small — ~10 lines. Changes are in `src/sync-manager.ts`.

#### 2.1 — Add `_syncInFlight` flag to `SyncManager`

**Current constructor (L116–121):**

```js
constructor(apiClient, vaultHandler, settings, noticeFn) {
  this.apiClient = apiClient;
  this.vaultHandler = vaultHandler;
  this.settings = settings;
  this.noticeFn = noticeFn;
}
```

**Fix:**

```js
constructor(apiClient, vaultHandler, settings, noticeFn) {
  this.apiClient = apiClient;
  this.vaultHandler = vaultHandler;
  this.settings = settings;
  this.noticeFn = noticeFn;
  this._syncInFlight = false;   // ← add
}
```

#### 2.2 — Guard the top of `sync()` (L123)

**Current (L123–129):**

```js
async sync() {
  const { groupId, outputFolder, disableScoring, disableCreating } = this.settings;
  const TODAY = ...
  const cutoffDate = ...
  try {
```

**Fix:**

```js
async sync() {
  if (this._syncInFlight) {
    console.warn('habitica-fullsync: sync already in progress, skipping.');
    return;
  }
  this._syncInFlight = true;
  const { groupId, outputFolder, disableScoring, disableCreating } = this.settings;
  const TODAY = ...
  const cutoffDate = ...
  try {
```

#### 2.3 — Release flag in both success and failure paths (L274–279)

**Current:**

```js
    this.noticeFn(`✅ Habitica sync complete: ${filePath}`);
  } catch (err) {
    console.error('Habitica sync failed:', err);
    this.noticeFn('❌ Habitica sync failed. Check console for details.');
  }
}
```

**Fix — use `finally`:**

```js
    this.noticeFn(`✅ Habitica sync complete: ${filePath}`);
  } catch (err) {
    console.error('Habitica sync failed:', err);
    this.noticeFn('❌ Habitica sync failed. Check console for details.');
  } finally {
    this._syncInFlight = false;
  }
}
```

**Deliverables for Phase 2:**

- [x] `_syncInFlight = false` initialised in `SyncManager` constructor
- [x] Early-return guard at top of `sync()`
- [x] `finally` block resets flag
- [x] `npm run build` exits 0

> ✅ Verified 2026-05-14 — concurrency guard and `finally` reset implemented in `src/sync-manager.ts`.

**Complexity:** Small
**Dependencies:** Phase 1 (so that any new throw paths introduced by `_parseResponse` are covered by the `finally` guard)
**Testing checkpoint:** `npm run build` must pass. Open DevTools console. Trigger manual sync, then immediately trigger it again via command palette. Confirm the second invocation logs the `sync already in progress` warning and does not start a second network request cycle.

---

### Phase 3 — Vault Mutation Hardening (ID-based line targeting)
>
> **Goal:** `VaultHandler.updateLine` must use the Habitica task ID as the primary key when present; fall back to prefix-regex only as a last resort.
> **Estimated effort:** Small — ~20 lines. Changes are in `src/vault-handler.ts`.

#### 3.1 — Rewrite `updateLine` with ID-first strategy (L95–99)

**Current (L95–99):**

```js
async updateLine(file, newLine) {
  const content = await this.app.vault.read(file);
  const updated = content.replace(new RegExp(`^${escapeRegExp(newLine.split(' [id::')[0])}.*$`, 'm'), newLine);
  await this.app.vault.modify(file, updated);
}
```

**The problem:** `newLine.split(' [id::')[0]` extracts the text *before* the ID marker from the *new* line being written. If two tasks share the same leading text (e.g., "Exercise"), the first match wins regardless of task identity. There is no type safety catching this because the original code has no types.

**Fix — typed version in `src/vault-handler.ts`:**

```typescript
async updateLine(file: TFile, newLine: string): Promise<void> {
  const content = await this.app.vault.read(file);

  // Strategy 1: match by task ID (stable, collision-proof)
  const idMatch = newLine.match(/\[id:: ([^\]]+)\]/);
  if (idMatch) {
    const id = idMatch[1];
    // Match any line containing exactly this [id:: <id>] token
    const idPattern = new RegExp(`^[^\n]*\\[id:: ${escapeRegExp(id)}\\][^\n]*$`, 'm');
    if (idPattern.test(content)) {
      const updated = content.replace(idPattern, newLine);
      await this.app.vault.modify(file, updated);
      return;
    }
    // ID not found in file yet — fall through to prefix match
  }

  // Strategy 2: prefix-regex fallback (original behaviour)
  const prefix = newLine.split(' [id::')[0];
  const prefixPattern = new RegExp(`^${escapeRegExp(prefix)}.*$`, 'm');
  if (prefixPattern.test(content)) {
    const updated = content.replace(prefixPattern, newLine);
    await this.app.vault.modify(file, updated);
    return;
  }

  // Strategy 3: line not found — warn, do not silently corrupt file
  console.warn(`habitica-fullsync: updateLine could not locate target line in "${file.path}". Line was:\n${newLine}`);
}
```

**Deliverables for Phase 3:**

- [x] `updateLine` rewritten with three-strategy cascade in `src/vault-handler.ts`
- [x] Method signature properly typed: `(file: TFile, newLine: string): Promise<void>`
- [x] No change to call sites — API surface identical
- [x] `npm run build` exits 0

> ✅ Verified 2026-05-14 — ID-first → prefix-regex → warn-only cascade implemented in `src/vault-handler.ts`.

**Complexity:** Small
**Dependencies:** Phase 1 (so API calls are already guarded before `updateLine` is reached)
**Testing checkpoint:** `npm run build` must pass. Create two tasks with identical text prefix (e.g., "Buy milk" and "Buy milk #2"). Complete one in Obsidian. Confirm only the correct task line is marked `%%scored%%`.

---

### Phase 4 — Daily Due-Date Fix for `everyX > 1`
>
> **Goal:** Correctly compute the next occurrence of a daily task that repeats every N days when N > 1.
> **Estimated effort:** Small — ~15 lines. Changes are in `src/helpers.ts`, `getNextDailyDueDate`.

#### 4.1 — Root cause analysis

`getNextDailyDueDate` (`src/helpers.ts` after Phase 0), `freq === 'daily'` branch:

```typescript
let baseDate = start > today ? new Date(start) : new Date(today);
if (freq === 'daily') {
  while (baseDate < start) {          // ← BUG: never true when baseDate >= start
    baseDate.setDate(baseDate.getDate() + everyX);
  }
  return baseDate.toLocaleDateString('en-CA');
}
```

When `start <= today`, `baseDate = new Date(today)`. `today >= start`, so the while loop is skipped and the function returns today regardless of whether today actually falls on a valid `everyX` cycle boundary.

**Correct algorithm:**

1. Determine the cycle origin (`start`).
2. Compute how many full `everyX`-day cycles have elapsed since `start` up to today.
3. The next valid occurrence is `start + (elapsedCycles + 1) * everyX` days — unless `start + elapsedCycles * everyX` equals today, in which case today is the due date.

#### 4.2 — Rewrite `freq === 'daily'` branch

**Fix (in `src/helpers.ts`):**

```typescript
if (freq === 'daily') {
  // Normalise both dates to midnight UTC to avoid DST offset contamination
  const startMs   = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const todayMs   = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  if (todayMs < startMs) {
    // Task hasn't started yet — next occurrence is the start date itself
    return start.toLocaleDateString('en-CA');
  }

  const dayMs          = 24 * 60 * 60 * 1000;
  const daysSinceStart = Math.round((todayMs - startMs) / dayMs);
  const remainder      = daysSinceStart % everyX;
  const daysUntilNext  = remainder === 0 ? 0 : everyX - remainder;
  const nextMs         = todayMs + daysUntilNext * dayMs;
  const next           = new Date(nextMs);

  return next.toLocaleDateString('en-CA');
}
```

**Example verification:**

- `start = 2026-01-01`, `everyX = 3`, `today = 2026-05-14`
- Days since start: 133. 133 % 3 = 1. Days until next = 3 − 1 = 2. → `2026-05-16` ✓
- `today = 2026-05-15` (133+1=134), 134 % 3 = 2, days until next = 1. → `2026-05-16` ✓
- `today = 2026-05-16` (135), 135 % 3 = 0, days until next = 0. → `2026-05-16` (today is due) ✓

#### 4.3 — Retain `weekly` branch unchanged

The `weekly` branch is correct and is not touched.

**Deliverables for Phase 4:**

- [x] `freq === 'daily'` branch inside `getNextDailyDueDate` replaced
- [x] UTC normalisation applied to avoid DST issues
- [x] Early-return for future start dates
- [x] `npm run build` exits 0

> ✅ Verified 2026-05-14 — UTC modulo arithmetic (`daysSinceStart % everyX`) implemented in `src/helpers.ts`.

**Complexity:** Small
**Dependencies:** Phase 1 (`task.startDate` null guard must be in place before this branch is reached)
**Testing checkpoint:** `npm run build` must pass. Create a Habitica daily with `everyX = 3`, note its start date. Confirm the `[due:: ...]` value in the synced Markdown matches the expected next occurrence date.

---

### Phase 5 — Dead Code Cleanup (`machineId`)
>
> **Goal:** Remove the `machineId` setting and the `PluginSettings` interface field that were never implemented. The `crypto` import was already dropped in Phase 0 as part of the porting step; this phase handles the remaining runtime artifact.
> **Estimated effort:** Tiny — 2 lines removed.

#### Decision matrix

| Option | Effort | User impact |
| --- | --- | --- |
| A — Remove `machineId` from `PluginSettings` interface and `loadSettings` defaults entirely | Tiny | Users lose a setting field they cannot currently use anyway |
| B — Document "not yet implemented" in settings UI | Tiny | Transparent; setting stays but is clearly inactive |
| C — Implement device binding (hash machine fingerprint via `window.crypto.subtle`, store in `machineId`, gate sync) | Large | Adds real multi-device protection |

**Recommended: Option A.** Simplest, least surface area. The typescript interface enforces it — if `machineId` is removed from `PluginSettings`, any future attempt to accidentally reference it will be a compile error, not a silent runtime no-op.

If Option C is desired in a future iteration, it gets its own plan. Note: `window.crypto.subtle` is the correct API for both desktop Electron and mobile WebView. Node's `crypto` module has no business in an Obsidian plugin.

#### 5.1 — Remove `machineId` from `PluginSettings` (`src/types.ts`)

```diff
 export interface PluginSettings {
   ...
-  machineId: string;
 }
```

#### 5.2 — Remove `machineId` from `loadSettings` defaults (`src/main.ts`)

```diff
-  machineId: ''
```

#### 5.3 — CHANGELOG entry

```markdown
### Removed
- `machineId` setting — machine binding was not implemented at runtime; removed to
  eliminate dead code and reduce confusion. May be revisited in a future release.
- `crypto` module import — removed during toolchain migration (Phase 0); it had no
  usages and is incompatible with the mobile WebView environment.
```

**Deliverables for Phase 5:**

- [x] `machineId` removed from `PluginSettings` interface in `src/types.ts`
- [x] `machineId: ''` removed from `loadSettings` defaults in `src/main.ts`
- [x] CHANGELOG entry added
- [x] `npm run build` exits 0

> ✅ Verified 2026-05-14 — `machineId` absent from `src/types.ts` and `src/main.ts`; CHANGELOG `[Unreleased]` block documents removal.

**Complexity:** Tiny
**Dependencies:** Phase 0 (crypto already removed; this is just the settings field)
**Testing checkpoint:** `npm run build` must pass — typescript will confirm `machineId` is not referenced anywhere. Load plugin, confirm no `ReferenceError`. Confirm existing vaults with `machineId` in `data.json` load without error (`Object.assign` with no `machineId` default silently ignores the stored key).

---

### Phase 6 — API Token Input Masking
>
> **Goal:** The API token `<input>` field should use `type="password"` to prevent casual shoulder-surfing. Storage is unchanged (Obsidian handles it).
> **Estimated effort:** Tiny — 2 lines. Changes are in `src/main.ts`, `HabiticaSyncSettingTab.display`.

#### 6.1 — Mask token input element

**Current (`src/main.ts`, `HabiticaSyncSettingTab.display`):**

```typescript
new Setting(containerEl)
  .setName('API Token')
  .setDesc('Your Habitica API Token (stored in plain text; do not share your vault)')
  .addText(text => text
    .setPlaceholder('Enter API Token')
    .setValue(this.plugin.settings.apiToken)
    .onChange(async (value) => {
      this.plugin.settings.apiToken = value;
      await this.plugin.saveSettings();
    }));
```

**Fix — refactor callback from expression to block body to access `inputEl`:**

```typescript
new Setting(containerEl)
  .setName('API Token')
  .setDesc('Your Habitica API Token (kept in Obsidian local storage; do not share your vault)')
  .addText(text => {
    text
      .setPlaceholder('Enter API Token')
      .setValue(this.plugin.settings.apiToken)
      .onChange(async (value) => {
        this.plugin.settings.apiToken = value;
        await this.plugin.saveSettings();
      });
    text.inputEl.type = 'password';   // ← TextComponent.inputEl is HTMLInputElement
    return text;
  });
```

**Note:** `TextComponent.inputEl` is a standard `HTMLInputElement`, confirmed by the Obsidian API. Setting `type = 'password'` causes Electron and the mobile WebView to render bullets instead of plain characters. It does not affect the stored value or the `onChange` callback. typescript will type-check `text.inputEl.type` correctly via the `obsidian` package types.

**Deliverables for Phase 6:**

- [x] `addText` callback refactored from arrow-expression to block body
- [x] `text.inputEl.type = 'password'` added
- [x] `npm run build` exits 0

> ✅ Verified 2026-05-14 — password masking implemented in `src/main.ts` L113; description updated to "kept in Obsidian local storage".

**Complexity:** Tiny
**Dependencies:** Phase 0 (typescript source must be in place)
**Testing checkpoint:** `npm run build` must pass. Open plugin settings. Confirm API Token field shows bullets/dots instead of plain text.

---

### Phase 7 — Final Review, Regression Testing Checklist & Cleanup
>
> **Goal:** Validate all phases together, confirm closure hoisting is complete in `src/helpers.ts`, enable full `strict` mode, and ship the final `main.js`.
> **Estimated effort:** Medium — 2–3 hours.

#### 7.1 — Confirm helper functions are properly in `src/helpers.ts` (S9, S10)

By Phase 0, `formatTasks`, `formatTaskLine`, `getNextDailyDueDate`, and `filterActive` should already be module-level exports in `src/helpers.ts`, not closures inside `sync()`. This phase is a confirmation pass — verify no inner closure redeclarations survived the port. If any remain inside `SyncManager.sync()`, hoist them now.

The correct typescript signatures after all phases are complete:

```typescript
// src/helpers.ts
export function filterActive(
  list: HabiticaTask[],
  type: HabiticaTask['type'],
  scoredIds: Set<string>
): HabiticaTask[]

export function formatTaskLine(
  task: HabiticaTask,
  tagLookup: Record<string, string>,
  today: string
): string

export function formatTasks(
  taskList: HabiticaTask[],
  tagLookup: Record<string, string>,
  today: string
): string[]

export function getNextDailyDueDate(task: HabiticaTask): string | null
```

`SyncManager.sync()` calls these as imported functions — no implicit closure capture, no re-declaration on every sync run.

#### 7.2 — Enable full `strict` mode in `tsconfig.json`

After Phase 1 resolves all null/undefined guards, upgrade `tsconfig.json`:

```diff
-    "strictNullChecks": true,
+    "strict": true,
```

Run `npm run build`. Fix any new errors — at this point there should be few, if any. The type system now has maximum teeth.

#### 7.3 — Validate `scoreTask` response (S8)

`scoreTask` now uses `_parseResponse<unknown>` (Phase 1). No additional change needed beyond confirming it is applied and the build is clean.

#### 7.4 — Manual regression test checklist

Run `npm run build` first. Then execute each scenario and observe the Obsidian console + sync output file:

| # | Scenario | Expected behaviour |
| --- | ---------- | -------------------- |
| T1 | Sync with at least one task that has zero tags | No `TypeError`; task line appears with no `#tag` tokens |
| T2 | Sync with a Habitica reward task | No crash; reward appears under `### Rewards` |
| T3 | Trigger manual sync, then immediately trigger it again | Second call logs `sync already in progress` warning; only one network cycle completes |
| T4 | Auto-sync interval fires while manual sync is still running | Interval call is silently skipped; no double-score markers appear |
| T5 | Complete a task in Obsidian that has `[id:: ...]`; run sync | Correct task line updated with `%%scored%%`; no other lines affected |
| T6 | Two tasks with identical leading text prefix | Only the one with matching `[id:: ...]` gets the `%%scored%%` annotation |
| T7 | Complete a task with no `[id:: ...]` in Obsidian (with `disableCreating = false`) | New Habitica task created; `[id:: <new-id>] %%scored%%` appended to line |
| T8 | Daily with `everyX = 3`, start date in the past | `[due:: ...]` reflects actual next cycle date, not today if today is off-cycle |
| T9 | Daily with `everyX = 1` | `[due:: ...]` = today (unchanged behaviour) |
| T10 | `res.ok === false` from API (simulate with invalid credentials) | Sync fails with meaningful error message in notice, not a silent undefined crash |
| T11 | API token field in settings | Characters are masked (bullet/dot display) |
| T12 | Plugin loads on mobile (if available) | No `ReferenceError`; `crypto` was removed in Phase 0 |
| T13 | Existing vault with `machineId` in `data.json` | Plugin loads without error; `machineId` value is silently ignored |
| T14 | Full sync with group ID set | Group tasks appear under `#### Group Tasks` sections |
| T15 | Full sync with `disableScoring = true` | No POST to `/tasks/:id/score/...` in network tab |
| T16 | Full sync with `disableCreating = true` | Obsidian-native completed tasks (no ID) are not sent to Habitica create endpoint |

#### 7.5 — Code quality final pass

- [x] `npm run build` exits 0 with `strict: true` in `tsconfig.json`
- [x] No `console.log` debugging statements left in any `src/` file
- [x] All `console.error` and `console.warn` calls include module + method context in the message prefix
- [x] `src/main.ts` default export is `HabiticaSyncFullPlugin` — esbuild handles CJS interop, no `module.exports` needed
- [x] All `src/` files are UTF-8, no BOM
- [x] `main.js` in the repo root is the esbuild output; it is not hand-edited
- [x] `node_modules/` is in `.gitignore`

> ✅ Verified 2026-05-14 — `"strict": true` in tsconfig; `export default HabiticaSyncFullPlugin` at end of `src/main.ts`; build output confirmed.

#### 7.6 — Update CHANGELOG.md

Add a new version entry summarising all changes:

```markdown
## [Unreleased]

### Added
- typescript + esbuild build toolchain (Phase 0). Source now lives in `src/`.
  Run `npm run build` to produce `main.js`. Run `npm run dev` for watch mode.
- `src/types.ts` — `PluginSettings`, `HabiticaTask`, and `HabiticaTag` interfaces
  providing end-to-end type safety.

### Fixed
- `TypeError: Cannot read properties of undefined (reading 'map')` crash when Habitica
  returns tasks with missing `tags` array (rewards, group tasks, new todos).
- HTTP error responses from Habitica API no longer propagate silently as `undefined`;
  they now throw a named error with the HTTP status and message body.
- `getNextDailyDueDate` now correctly computes the next occurrence for dailies with
  `everyX > 1` (previously always returned the start date or today).
- `VaultHandler.updateLine` now uses `[id:: ...]` as primary match key, preventing
  mis-targeting of lines that share a common text prefix.

### Changed
- `SyncManager.sync()` is now protected by an in-flight guard; concurrent invocations
  (auto-sync interval + manual command) are serialised — the second call is skipped.
- API Token setting field now renders as a password input (characters masked).
- Helper functions (`formatTaskLine`, `formatTasks`, `getNextDailyDueDate`, `filterActive`)
  are now module-level exports in `src/helpers.ts`; no longer re-created on every sync call.

### Removed
- `crypto` module import — incompatible with mobile WebView; had no usages.
- `machineId` setting — machine binding was not implemented at runtime; removed to
  eliminate dead code. May be revisited in a future release.
```

---

## 4. Considerations

### Assumptions

- Obsidian's `app.vault.modify()` is atomic enough for single-file updates; no external file locking is needed.
- The Habitica v3 API contract (`data`, `success`, `message` fields) is stable.
- `window.fetch` is available in both Electron (desktop) and the mobile WebView.
- `TextComponent.inputEl` on Obsidian's `TextComponent` is a standard `HTMLInputElement` — confirmed by the `obsidian` npm package types.
- esbuild correctly tree-shakes unused exports; only code reachable from `src/main.ts` ends up in `main.js`.

### Constraints

- **Build toolchain required.** Source is typescript in `src/`. The output `main.js` is produced by esbuild. Do not hand-edit `main.js` — changes will be overwritten by the next build.
- **Output is still a single `main.js`.** Obsidian loads `main.js` from the plugin directory. The `src/` split is a development-time concern only.
- **No new runtime dependencies.** `obsidian`, `typescript`, and `esbuild` are `devDependencies`; they are not bundled into `main.js`. `obsidian` is marked external in esbuild config.
- **Must run in both Electron (desktop) and the mobile WebView.** No Node built-in modules in runtime code. `esbuild.config.mjs` lists `builtin-modules` as external to enforce this.
- **`strict: true` in `tsconfig.json` after Phase 7.** Phase 0 starts with `strictNullChecks: true`; full strict mode is enabled in Phase 7 after all null guards are in place.

### Risks

| Risk | Likelihood | Mitigation |
| ------ | ----------- | ------------ |
| Habitica API changes `tags` field shape in a future update | Low | `Array.isArray` guard is robust against future shape variations; `HabiticaTask` interface documents the expected shape |
| `text.inputEl` removed or renamed in a future Obsidian API version | Very Low | typescript will catch this at build time via the `obsidian` package; simple to fix |
| Phase 0 port introduces a subtle behavioural regression | Low | Phase 0 explicitly forbids logic changes; `npm run build` + full sync test verifies parity before any Phase 1–7 changes |
| UTC normalisation in Phase 4 shifts due dates by ±1 day in edge time zones | Low | UTC math is timezone-agnostic; local display via `toLocaleDateString('en-CA')` is correct |
| Removing `machineId` breaks a user's existing `data.json` | Very Low | `Object.assign` with no `machineId` default silently ignores the stored key on next load |
| esbuild version incompatibility with the `obsidian-sample-plugin` config | Very Low | Pin esbuild version in `package.json`; use the same config as the sample plugin |

## 7. QoL Improvements (2026-05-14)

> ✅ Completed 2026-05-14

### Problem A: Sync-file checkbox scoring (bidirectional sync)

**Root cause:** `getRecentCompletedTasks` required `[completion:: YYYY-MM-DD]` to pick up a
task. The sync output file (`habitica-fullsync.md`) never has that field on active tasks, so
checking off a task in the file was silently ignored and overwritten on the next sync.

**Fix:**

- Added `VaultHandler.getCheckedTasksFromFile(filePath)` — scans a specific file for
  `- [x]` lines with `[id:: ...]` and no `%%scored%%`, returns `{ id, line }[]`.
- Added a pre-pass in `SyncManager.sync()` (runs after fetching Habitica data): calls
  `getCheckedTasksFromFile` on the sync output file and scores any `todo`/`daily` tasks.
- Habits and rewards excluded from the pre-pass: habits don't become `completed: true`
  after scoring (causing repeat-scoring on every sync until file regenerates); rewards
  are a purchase action, not a checkbox action.
- Idempotency: Habitica marks `todo`/`daily` tasks `completed: true` after scoring, so
  the `if (habiticaTask.completed) continue` guard prevents re-scoring if the sync file
  hasn't been regenerated yet.
- Added `scoredIds.has(id)` guard in the general vault scan to prevent double-scoring
  when the same ID appears in both paths within one sync run.
- Per-task `try/catch` around all `scoreTask` calls — one failed task no longer aborts
  the entire sync.

### Problem B: Markdown output quality

- `formatTaskLine`: strips `^#{1,6}\s+` from task titles (Habitica allows heading
  syntax in task text; renders as broken headings in Obsidian list view).
- `formatTaskLine`: notes now split on real newlines → per-segment heading markers
  stripped → empty segments dropped → joined with ` · ` → truncated at ~150 chars at
  word boundary.
- `SyncManager.sync()`: "Group Tasks" subsection only rendered when `groupId` is
  configured. Removes ~8 lines of noise for users without group tasks.
- Removed `#### Personal Tasks` sub-header; tasks listed directly under `### Dailies`,
  `### To-Dos`, etc.
- Summary line changed to per-type breakdown:
  `*N active tasks: X dailies · X to-dos · X rewards · X habits*`
- Summary counts now based on filtered (rendered) arrays, not raw `allTasks` length.

**Files modified:**

- `src/vault-handler.ts` — added `getCheckedTasksFromFile`
- `src/helpers.ts` — updated `formatTaskLine`
- `src/sync-manager.ts` — pre-pass, double-score guard, conditional group section, new summary
- `src/main.ts` — no changes (prior fix: `saveSettings()` recreates apiClient)
- `README.md` — added sync-file scoring feature, updated Markdown Output section
- `CHANGELOG.md` — documented all changes under `[Unreleased]`

- **Machine binding / device-locking** — requires `window.crypto.subtle` fingerprinting (mobile-safe) and a non-trivial sync protocol change. Deserves its own plan; `machineId` is the intended storage field if this is ever implemented.
- **Score-result feedback** (HP/XP/Gold delta notices) — requires parsing the `scoreTask` response body, which is now correctly validated (Phase 1) but not displayed. Low effort to add; the data is there.
- **Conflict resolution** — if the same task is completed on two devices between syncs, current logic will score it twice. Solving this requires server-side deduplication or a last-write-wins timestamp strategy.
- **Incremental sync** — currently re-fetches all tasks on every run. A `updatedAt`-based delta sync would reduce API calls significantly for large task lists.
- **Unit tests** — now that helpers are in `src/helpers.ts` as pure functions with typescript signatures, adding a test runner (Jest or Vitest) is straightforward and would make regression testing T1–T16 automatable.
- **ESLint / Prettier** — consistent with the Obsidian sample plugin toolchain; adds zero runtime overhead.

---

## 6. Execution Order Summary

```ascii
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6  →  Phase 7
(toolchain) (crash)     (race)     (vault)    (date math)  (dead code)  (UX polish)  (review)
    ↓
[npm run build — must pass before Phase 1 begins]
    ↓
[T1–T5 checkpoint after Phase 1+2+3]  [npm run build after each phase]
    ↓
[T6–T10 checkpoint after Phase 4+5]   [npm run build after each phase]
    ↓
[T11–T16 full regression after Phase 6+7 with strict: true]
```

Total estimated effort: **~6–9 hours** (Phase 0 adds ~2–3 hours of toolchain setup and porting on top of the ~4–6 hours for Phases 1–7). An engineer already familiar with the Obsidian plugin toolchain can compress Phase 0 significantly.

---

*Source reviewed: `main.js` (471 lines, CJS), `habitica-fullsync-comparison-and-debugging.md`*
*Reference: [obsidianmd/obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin)*

---

## 8. Feature Expansion Plan (from `TODOs.md`, 2026-05-29)

> ✅ **Implemented 2026-05-29.** All five features (F1–F5) shipped across Phases 8–12 plus
> a test suite and docs. `npm run build` and `npm test` (27 tests) pass. Not yet committed.

This section extends the completed refactor (Phases 0–7 + QoL) with the feature work
captured in `TODOs.md`. It is a **new, not-yet-started** body of work. Each phase below is
independently shippable and ends with a passing `npm run build`. The current `src/` module
boundaries (`types.ts`, `api-client.ts`, `vault-handler.ts`, `helpers.ts`, `sync-manager.ts`,
`main.ts`) are preserved — no monolith reintroduced.

### 8.0 Problem statement & approach

`TODOs.md` requests five capabilities. After clarifying scope with the user, the agreed
behaviour is:

| # | TODO | Agreed behaviour |
| --- | ------ | ------------------ |
| F1 | Use Dataview for organizing tasks | Keep inline fields (`[id::]`, `[due::]`, …) **and** emit ready-made `dataview` query blocks. **One query per task type** (Dailies / To-Dos / Habits / Rewards), each surfacing that type's relevant fields. |
| F2 | Tags break when they contain hyphens/spaces | Sanitize Habitica tag names into valid single-token Obsidian tags (spaces → hyphens, strip illegal chars). Multi-word tags like `data engineering` become `#data-engineering`. Mapping must be reversible for F5. |
| F3 | Notes rendering is a cluttered parenthetical | Render notes as a nested Obsidian callout `> [!note]` under the task line instead of `(…)`. |
| F4 | Checklists (subtasks) are dropped | Fetch the Habitica `checklist` array and render each item as an indented nested checkbox (`- [ ]` / `- [x]`) under the parent task. |
| F5 | Cannot create *new* (active) tasks from markdown | Any **unchecked** (`- [ ]`) line in the sync file with **no `[id::]`** is created in Habitica on the next sync. Infer the task **type from the section** the line sits under; parse `text`, `[priority::]`, `[due::]`, `#tags`, and callout notes; write the assigned `[id::]` back. |

**Guiding principle (unchanged from §1.3):** surgical, additive changes. The output-document
assembly in `SyncManager.sync()` and the line formatter in `helpers.ts` are the main touch
points; the API client gains richer create/parse support; the vault handler gains a
"creatable lines" scanner.

### 8.1 Dependency / execution order

```ascii
Phase 8  (F2 tag sanitization)        ── independent, do first (smallest, unblocks F5 mapping)
   ↓
Phase 9  (F3 notes callout)           ── changes formatTaskLine output contract
   ↓
Phase 10 (F4 checklist rendering)     ── extends the same multi-line output contract
   ↓
Phase 11 (F1 per-type Dataview blocks)── consumes the now-stable inline-field output
   ↓
Phase 12 (F5 create-from-markdown)    ── largest; depends on stable sections + tag mapping
```

Rationale: Phases 9 and 10 both change `formatTaskLine` from "one line per task" to
"one line + optional nested block per task", so they are adjacent and share a contract
change. Phase 12 (creation) must come last because it parses the exact output structure
(section headings, inline fields, sanitized tags) produced by Phases 8–11.

---

### Phase 8 — Tag sanitization (F2)

**Goal:** Habitica tag names containing spaces or other tag-illegal characters currently
emit broken Obsidian tags (`#data engineering` → only `#data` is a tag). Normalize them.

**Files:** `src/helpers.ts` (primary), `src/types.ts` (optional helper export).

**Changes:**

- Add a pure helper `sanitizeTag(name: string): string` in `helpers.ts`:
  + Trim; replace runs of whitespace with a single `-`.
  + Remove characters Obsidian disallows in tags (keep letters, digits, `_`, `-`, `/`;
    Unicode letters allowed). Collapse repeated `-`.
  + If the result is empty, fall back to `unknown`.
- In `formatTaskLine` (helpers.ts L81), pipe each resolved tag name through `sanitizeTag`:
  `(...).map(id => \`#${sanitizeTag(tagLookup[id] || 'unknown')}\`)`.
- Keep the type tags (`#daily`, `#habit`, `#reward`) as-is (already valid).

**Reversibility note for F5:** sanitization is lossy (`data engineering` and
`data-engineering` both → `data-engineering`). For Phase 12's tag mapping, build a
**normalized reverse index**: `normalize(name) → tagId`, where `normalize` lowercases and
treats `-`/space/`_` as equivalent. This lets a markdown `#data-engineering` map back to
the Habitica tag `data engineering` without a perfect round-trip.

**Edge cases:** tag names that are purely punctuation; duplicate tags after sanitization
(dedupe the rendered tag list); leading digits (Obsidian allows, leave as-is).

**Verification:** unit-style check (manual) — a task with tags `focus`, `data engineering`,
`self awareness` renders `#focus #data-engineering #self-awareness`. `npm run build` clean.

---

### Phase 9 — Notes as a nested callout (F3)

**Goal:** Replace the inline `(notes…)` parenthetical with a nested Obsidian callout under
the task line so notes are readable and don't clutter the inline-field line.

**Files:** `src/helpers.ts` (`formatTaskLine`, `formatTasks`), `src/sync-manager.ts`
(output assembly already joins with `\n`, so multi-line strings flow through unchanged).

**Contract change:** `formatTaskLine` currently returns a single line. It will now return a
**multi-line string** (`\n`-joined): the task line, followed by the indented callout when
notes exist. `formatTasks` already returns `string[]` joined by `\n` upstream — verify that
a multi-line element joins correctly (it does, since `output.join('\n')` flattens).

**Output shape:**

```md
- [ ] Define my daily mantras #focus [id:: …] [priority:: medium] [due:: 2026-05-10]
  > [!note]
  > First segment of the note.
  > Second segment.
```

- Indent the callout by 2 spaces so Obsidian nests it inside the list item.
- Reuse the existing notes cleaning (split on newlines, strip heading markers, drop empties)
  but **stop truncating at 150 chars** — the callout has room. Each cleaned segment becomes
  its own `>` line (preserves structure better than ` · ` joining).
- When notes are empty/null, emit only the task line (no empty callout).

**Edge cases:** notes containing `>` or callout-like syntax (escape or leave — Obsidian
tolerates nested `>`); very long single-line notes (wrap naturally, no truncation);
completed tasks keep `[completion::]` on the task line, callout still renders beneath.

**Verification:** a task with multi-line notes renders the callout; a task without notes
renders a single line; `npm run build` clean; eyeball in Obsidian reading view.

---

### Phase 10 — Checklist (subtask) extraction (F4)

**Goal:** Habitica tasks carry a `checklist` array that is currently fetched (it's in the
`/tasks/user` payload) but ignored. Render each item as a nested checkbox under the task.

**Files:** `src/types.ts` (new interface + field), `src/helpers.ts` (`formatTaskLine`),
optionally `src/api-client.ts` + `src/sync-manager.ts` (stretch: score checklist items).

**Changes:**

- `types.ts`: add

  ```ts
  export interface HabiticaChecklistItem { id: string; text: string; completed: boolean; }
  ```

  and `checklist?: HabiticaChecklistItem[];` on `HabiticaTask` (guard with `Array.isArray`,
  per the existing `tags` convention).
- `formatTaskLine`: after the task line (and after the notes callout from Phase 9), append
  each checklist item as `- [x] <text>` / `- [ ] <text>`, indented 2 spaces to nest
  under the parent list item. Strip heading markers from item text (reuse cleaner).
- Ordering of the nested block under a task: **checklist first, then notes callout**, OR
  notes then checklist — pick notes-then-checklist for visual grouping (decide during impl;
  keep consistent).

**Stretch (optional, gated):** bidirectional checklist scoring. If a checklist item is
checked in the sync file but `completed: false` in Habitica, call
`POST /tasks/:taskId/checklist/:itemId/score`. This mirrors the existing task pre-pass in
`SyncManager.sync()` and would need:

- `api-client.ts`: `scoreChecklistItem(taskId, itemId)`.
- `vault-handler.ts`: extend the sync-file scanner to capture nested `- [x]` lines with a
  parent `[id::]` and a checklist-item id.
- This requires emitting the checklist **item id** into the markdown (e.g.
  `[citem:: <id>]`) so it can be matched back. Treat as a separate, clearly-marked
  sub-task; **not** required for the core "extraction" TODO.

**Edge cases:** tasks with empty `checklist: []` (render nothing); items with empty text;
checklist on group tasks (same guard); interaction with the F5 creation path (created tasks
have no checklist initially).

**Verification:** a to-do with 3 checklist items renders 3 nested checkboxes with correct
checked state; `npm run build` clean.

---

### Phase 11 — Per-type Dataview query blocks (F1)

**Goal:** Below each task-type section, emit a fenced ```dataview``` block tailored to that
type so the user gets dynamic organisation without hand-writing queries. Inline fields are
already Dataview-compatible (`[key:: value]`).

**Files:** `src/helpers.ts` (new `buildDataviewBlock(type)` helper), `src/sync-manager.ts`
(`writeSection` calls it).

**Design — one query per type, surfacing that type's fields:**

- **To-Dos:** `TABLE priority, due, completion` sorted by `due` ascending (overdue first).
- **Dailies:** `TABLE priority, due` (next occurrence) — dailies recur, so group/sort by due.
- **Habits:** `TABLE priority` plus direction — habits have no due; surface priority and tags.
- **Rewards:** `TABLE priority` (cost/value) — rewards have neither due nor completion.

**Implementation options (decide during impl):**

1. **`TABLE … FROM "<outputFolder>/habitica-fullsync" WHERE …`** scoped to the sync file,
   filtering by the auto-added type tag (`#daily`, `#habit`, `#reward`, and "no type tag" ⇒
   to-do). Self-referential but Dataview handles same-file queries fine.
2. **`TASK FROM … WHERE … GROUP BY priority`** for a checkbox-style grouped view.

Prefer option 1 (`TABLE`) for the structured per-type fields; the literal task checkboxes
remain above for interaction (checking off / scoring), and the Dataview block is the
"organised view" the TODO asks for.

**Field mapping per type (drives both the columns and F5 creation):**

| Type | Inline fields emitted | Dataview columns |
| ------ | ---------------------- | ------------------ |
| To-Do | `id, priority, due, completion`, `#tags` | priority, due, completion |
| Daily | `id, priority, due`, `#daily`, `#tags` | priority, due |
| Habit | `id, priority`, `#habit`, `#tags` | priority |
| Reward | `id, priority`, `#reward` | priority |

**Edge cases:** empty section (Dataview block still valid, shows nothing — acceptable, or
skip the block when the section is empty); `outputFolder` empty (file at vault root — `FROM`
path is just `"habitica-fullsync"`); Dataview plugin not installed (block renders as a code
fence — harmless, documented in README).

**Verification:** open the file with Dataview enabled; each section's table renders the
right columns; `npm run build` clean. Add a README note that Dataview is an optional
companion plugin.

---

### Phase 12 — Create active tasks from markdown (F5)

**Goal:** Let the user write a brand-new task directly in `habitica-fullsync.md` (an
unchecked `- [ ]` line under a type section, with **no `[id::]`**) and have the next sync
create it in Habitica, then stamp the returned `[id::]` back so it becomes a managed task.

This is the largest phase. It is distinct from the existing creation path, which only fires
for **completed** (`- [x]`) lines without an id (see `SyncManager.sync` L131–142).

**Files:** `src/vault-handler.ts` (new scanner), `src/api-client.ts` (richer create),
`src/sync-manager.ts` (new creation pre-pass + tag resolution), `src/helpers.ts` (line
parser), `src/types.ts` (a `NewTaskInput` type).

**12.1 Scan creatable lines (with section context) — `vault-handler.ts`**

- New method `getCreatableLinesFromFile(filePath): Promise<Array<{ line: string; section: string }>>`.
- Walk the file top-to-bottom, tracking the current `###` heading (`Dailies`, `To-Dos`,
  `Rewards`, `Habits`). For each `- [ ]` line that (a) has **no** `[id::]`, (b) is not the
  placeholder `_No tasks found._`, and (c) is not a nested checklist line (no leading
  indent), record `{ line, section }`.
- Never throw (file may not exist) — return `[]` (mirror `getCheckedTasksFromFile`).

**12.2 Parse a markdown line into a task input — `helpers.ts`**

- New pure helper `parseTaskLine(line, section, normalizeTagIndex): NewTaskInput`:
  + `text`: strip `- [ ]`, then strip everything from the first `[field::` or trailing
    `#tag` cluster — reuse the existing `replace(/^- \[ \]\s*/, '').split(' [')[0]` idea but
    also strip trailing tags.
  + `type`: infer from `section` → `To-Dos`→`todo`, `Dailies`→`daily`, `Habits`→`habit`,
    `Rewards`→`reward`. Default `todo` if section unknown.
  + `priority`: parse `[priority:: high|medium|low|lowest]` → Habitica value `2|1.5|1|0.1`.
  + `due` (todo/daily only): parse `[due:: YYYY-MM-DD]` → Habitica `date`.
  + `tags`: extract `#tag` tokens; resolve each via the **normalized reverse index** from
    Phase 8; collect existing tag ids and a list of **unknown** tag names to create.
  + `notes`: read from a following `> [!note]` callout block if present (the scanner in 12.1
    should also hand the callout lines to the parser, or the parser re-reads them).
- Define `NewTaskInput` in `types.ts`:
  `{ text; type; priority?; date?; tagIds: string[]; newTagNames: string[]; notes?: string }`.

**12.3 Richer task creation — `api-client.ts`**

- Generalize `createTask`: `createTask(input: { text; type; priority?; date?; tags?; notes? }): Promise<HabiticaTask>`.
  + Map `type` straight through (`todo|daily|habit|reward`); habits may need `up/down`
    defaults (`up: true`).
  + Include `priority`, `date`, `tags` (id array), `notes` only when present.
- Add `createTag(name: string): Promise<HabiticaTag>` (`POST /api/v3/tags`) for unknown tags,
  going through `_parseResponse`.
- **Back-compat:** keep the existing single-string call site (completed-task path) working —
  either overload, or update that call site to pass `{ text, type: 'todo' }`.

**12.4 Creation pre-pass in `SyncManager.sync()`**

- After fetching tasks/tags and building `tagLookup`, also build the **normalized reverse
  tag index** (`normalize(name) → id`).
- Gate on `!disableCreating`.
- Call `vaultHandler.getCreatableLinesFromFile(filePath)`. For each:
  1. `parseTaskLine` → `NewTaskInput`.
  2. For each `newTagNames` entry, `createTag`, add returned id to `tagIds` (and to the
     reverse index so duplicates within one run reuse it).
  3. `apiClient.createTask({...})`.
  4. ``` vaultHandler.updateLine(file, line + ` [id:: ${created.id}]`) ``` — uses the Strategy-2
     prefix fallback (no id yet), so the prefix must match exactly; pass the **original**
     line as the match target.
- Per-line `try/catch` (one failure must not abort the sync — matches existing convention).
- **Ordering vs. regeneration:** the sync then regenerates the whole file from Habitica at
  the end, so the newly created task will reappear (now with its id) in the proper section.
  The write-back in step 4 is belt-and-suspenders / useful if regeneration is skipped.

**12.5 Concurrency & idempotency:**

- A line only creates **once** because the next sync regenerates the file with `[id::]`
  present, excluding it from `getCreatableLinesFromFile`.
- Guard against creating from the literal template/placeholder lines.
- Respect the existing `_syncInFlight` guard (already in place).

**Edge cases / risks:**

- **Tag round-trip ambiguity** (Phase 8 lossiness): `#data-engineering` matching Habitica
  `data engineering` relies on normalization; document that two tags differing only by
  separator/case will collide. Acceptable.
- **Type-specific required fields:** habits ignore `due`; rewards ignore `due`/`priority`
  semantics differ (priority is cost). Parser should drop fields that don't apply per type.
- **User writes a malformed line** (no text after stripping): skip with a `console.warn`.
- **`disableCreating` semantics** now cover *active* creation too — update its doc comment
  in `types.ts` (currently says "without a Habitica ID … created"; clarify it governs both
  completed-line and active-line creation).
- **Double creation across two files:** scoped to the sync file only, so safe.

**Verification:** write `- [ ] Test task #focus [priority:: high] [due:: 2026-06-01]` under
`### To-Dos`, run sync → task appears in Habitica as a to-do with that priority/due/tag, and
the line/section gains `[id:: …]` on regeneration. `npm run build` clean.

---

### 8.2 Cross-cutting work

- **README.md:** document each feature — Dataview companion-plugin note, callout notes,
  checklist rendering, tag sanitization behaviour, and the "write a `- [ ]` line to create a
  task" workflow (with the no-`[id::]` rule and the section-implies-type rule).
- **CHANGELOG.md:** add entries under `[Unreleased]` (Added: checklist rendering, Dataview
  blocks, create-from-markdown; Changed: notes now a callout, tags sanitized).
- **Frontmatter:** any new/edited Markdown docs must carry the standard YAML frontmatter
  (`title`, `description`, `created`, `author: [[Lucas Galdino]]`, `tags`, `links`).
- **No new runtime deps; no hand-edits to `main.js`; `obsidian` stays external.**
- **Build/verify after each phase:** `npm run build` must pass; reload plugin in Obsidian.

### 8.3 Open considerations

- Bidirectional **checklist scoring** (Phase 10 stretch) and **score-result feedback**
  (HP/XP/Gold notices) remain optional follow-ups.
- A **dedicated input file/section** for new tasks was considered but the user chose the
  simpler "any no-id `- [ ]` in the sync file" rule — revisit if accidental creation becomes
  a problem.
- **Dataview-only output** (dropping the literal task list) was rejected: the literal
  checkboxes are needed for the existing check-off-to-score workflow.
