---
title: "Changelog — habitica-fullsync"
description: "Version history for the habitica-fullsync Obsidian plugin."
created: "2026-05-14"
author: "[[Lucas Galdino]]"
tags: []
links: []
---

## [Unreleased] — v1.8.0

> **This release represents a near-complete rewrite of the plugin internals.** The original 471-line vanilla javascript monolith has been split into 17 typescript modules across 6 domains (`api/`, `lib/`, `markdown/`, `sync/`, `vault/`, root), with strict type-checking, a serialised API request queue, positional line identity, SecretStorage-backed credentials, and 8 test files covering pure-logic modules.

### Added

- **typescript + esbuild toolchain.** Source lives in `src/`; `npm run build` produces `main.js`; `npm run dev` for watch mode. `tsconfig.json` targets ES2022 with `strict: true`.
- **ESLint flat config** (`eslint.config.mjs`) with `eslint-plugin-obsidianmd` recommended rule set. `npm run lint` and `npm run lint:fix` scripts.
- **Test suite** (`npm test`): 8 test files covering tag sanitization, task formatting, markdown parsing, inline-field tokenization, positional line editing, sync-file model parsing, and Dataview block generation.
- **Positional line identity** (`src/vault/line-edit.ts`): `spliceLineByIndex`, `replaceUniqueLine` (whole-line anchored, rejects ambiguity), `findLineIndexById`. Duplicate task titles no longer cause write-targeting errors.
- **Inline-field tokenizer** (`src/markdown/inline-fields.ts`): single-source-of-truth module for all `[key:: value]` parsing and building. Replaces 12+ scattered regex sites.
- **Single-pass sync-file model** (`src/sync/sync-file-model.ts`): `parseSyncFile()` classifies lines as `checked`, `creatable`, or `managed` in one pass. Replaces three formerly duplicated vault-scan loops.
- **TaskRegistry** (`src/sync/task-registry.ts`): in-memory aggregate wrapping personal and group task arrays with `findById()`, `updateChecklist()`, `updateInPlace()`, `remove()`. Eliminates duplicated find-dance across 3 call sites.
- **SyncReport** (`src/sync/sync-report.ts`): owns all sync counters and the summary notice string. Previously inline in the sync coordinator method.
- **Immutable `SyncConfig` snapshot:** per-run settings captured at sync start, fixing the mid-sync settings-change Heisenbug.
- **Serialised API request queue:** all Habitica API calls flow through a promise queue with configurable inter-request spacing (default 2,200ms — matches Habitica's 30 req/min limit). Eliminates unthrottled request bursts.
- **Proactive rate-limit monitoring:** `X-RateLimit-Remaining` and `X-RateLimit-Limit` headers read on every response; queue pauses when remaining quota drops below 10%. Prevents 429s entirely for typical workloads.
- **Dev-build diagnostics:** `debug: true` flag on `HabiticaApiClient` enables per-request timing, sync-summary logging, step-level `console.time`, and low-buffer warnings. Zero output in production builds.
- **MetadataCache-aware vault scan:** `getRecentCompletedTasks` pre-filters files via `metadataCache.getFileCache().listItems`, skipping file reads when no completed items exist.
- **API token stored in SecretStorage** (Obsidian ≥1.11.4): token lives in the OS credential store (Keychain/libsecret/DPAPI), never written to `data.json`. `SecretComponent` in settings UI. No migration needed (no published users).
- **Fail-closed section headings:** unknown `## Section` headings trigger a warning and skip child tasks. Skipped section names surfaced in sync summary.
- **Field-clearing sentinels:** `[due:: none]` clears due date; `[notes::]` (empty value) clears notes; `[priority:: none]` resets to low (1).
- **Auto-sync reschedule:** changing `syncInterval`, `autoSync`, or `autoSyncPlatform` immediately reschedules the timer. No plugin reload needed.
- **Credential misconfiguration notice:** `Notice` shown when API token secret name is unset or token cannot be read, replacing silent 401 failure.
- **Create tasks from markdown (Phase 12/F5):** unchecked `- [ ]` lines with no `[id::]` are created in Habitica. Type inferred from section heading. `text`, `[priority::]`, `[due::]`, `#tags`, notes callout, and checklist items all pushed. Unknown tags created automatically.
- **Checklist (subtask) rendering (Phase 10/F4):** Habitica checklist items rendered as indented nested checkboxes under parent tasks.
- **Checklist bidirectional sync:** new items → `addChecklistItem`; checked items → `scoreChecklistItem`; text edits → `updateChecklistItem`; deleted items → `deleteChecklistItem`. All reported in sync summary.
- **Per-type Dataview query blocks (Phase 11/F1):** each task-type section ends with a ready-made `dataview` TABLE query. Dataview is an optional companion plugin.
- **Task field diffs (Phases 12-14):** `[up::]`, `[down::]`, `[streak::]`, `[attribute::]`, `[frequency::]`, `[everyX::]`, `[repeat::]`, `[startDate::]`, and `[delete::]` DSL tokens. Editing these in markdown pushes changes to Habitica on manual sync.
- **Task deletion (`[delete::]` sentinel):** managed lines with `[delete::]` are deleted from Habitica. Challenge/group tasks skipped with warning (API returns 401).
- **Sync-file bidirectional scoring:** checking off a `todo`/`daily` in `habitica-fullsync.md` scores it in Habitica. Habits/rewards excluded from this path.
- **Sync interval validation:** non-positive values show a notice instead of being silently discarded.
- **Vault scan opt-in** (`enableVaultScan` setting, defaults off) with configurable `completionLookbackDays`.
- **`preSyncDelay` guard:** skips sync if the previous run ended less than 2 minutes ago, preventing rate-limit exhaustion from overlapping auto-sync cycles.
- **Tag sanitization (Phase 8/F2):** multi-word Habitica tags normalized to valid Obsidian single tokens (`#data-engineering`). Emoji preserved. Results cached.
- **Notes as nested callout (Phase 9/F3):** task notes rendered as `> [!note]` callout beneath task line instead of truncated parenthetical.
- **Multi-line checklist items:** items with embedded newlines (created on Habitica mobile) preserve formatting with proper indentation.
- **Obsidian `requestUrl` for HTTP (O1):** replaced `window.fetch` with Obsidian's `requestUrl` which handles CORS, mobile proxies, and has built-in timeout/retry. `_parseResponse` adapted for `RequestUrlResponse` shape.
- **`onLayoutReady` gate (O2):** first auto-sync now waits for `Workspace.onLayoutReady()`, preventing incomplete vault scans when Obsidian opens with many files and the metadata cache is not yet populated.
- **Ribbon icon (O3):** `refresh-cw` icon in the left ribbon for one-click manual sync.
- **Status bar item (O4):** shows 🔄 Ready / ⏳ Syncing… / ✅ Synced just now / ❌ Sync failed. `sync()` returns a status string so the bar doesn't lie when sync is skipped.
- **`normalizePath()` throughout (O5):** all path construction uses Obsidian's `normalizePath()`, preventing cross-platform bugs from backslashes and double slashes.
- **MetadataCache incremental scan (O6):** `recentlyChanged` Set tracks files modified between syncs. `getRecentCompletedTasks` only scans changed files when available; falls back to full scan when the set is empty.
- **`registerEvent`/`registerInterval` cleanup (O7):** removed manual `window.clearInterval` from `onunload` — the framework handles teardown. MetadataCache event registered via `registerEvent` for automatic unsubscription.
- **Field Registry (F1-F7):** single-source-of-truth `FIELD_REGISTRY` with 14 task fields (`src/field-registry.ts`, 364 lines). Each field defines `parse`, `render`, `diff`, and `apiKey` in one place — consumed by parser, formatter, sync-manager, and api-client. Adding a field is now a one-file, ~8-line change instead of 5-file shotgun surgery. Eliminated `OPTIONAL_FIELD_RENDERERS`, `_setIfChanged()`, `TaskMutateFields`, and `FieldRenderer` type. Net reduction: ~200 lines of copy-paste → ~80 lines of configuration.
- **Shared API input types (S1):** `CreateTaskInput` and `UpdateTaskInput` exported interfaces replace formerly duplicated inline parameter types in `createTask`/`updateTask`. Type-safe, single-source-of-truth for API method signatures.
- **`_partitionTasksByType` (S2):** pre-computes all 8 personal/group × type buckets; `_renderAndWrite` uses a `sectionDefs` loop instead of 8 individual `filterActive` calls and destructured variables.
- **Data-driven `renderSummary` (S3):** `SyncReport.renderSummary()` uses a `parts` array with `[count, label, suffix?]` triples + single loop, replacing 7 copy-pasted if-blocks.
- **Unified `updateLine` (S4):** `updateLineInFile` deleted; `updateLine` accepts `TFile | string` with shared `_readContent`/`_writeContent` helpers. `writeFile` also delegates to `_writeContent`.

### Changed

- **Module reorganization:** original `src/api-client.ts`, `src/helpers.ts`, `src/vault-handler.ts`, `src/sync-manager.ts` split into domain directories:
  + `src/api/api-client.ts` — HTTP transport + rate limiting
  + `src/lib/dataview.ts`, `src/lib/platform.ts` — pure helpers
  + `src/markdown/formatter.ts`, `src/markdown/inline-fields.ts`, `src/markdown/parser.ts`, `src/markdown/scanner.ts`, `src/markdown/tags.ts` — rendering + parsing
  + `src/sync/sync-file-model.ts`, `src/sync/sync-manager.ts`, `src/sync/sync-report.ts`, `src/sync/task-registry.ts` — sync orchestration
  + `src/vault/line-edit.ts`, `src/vault/vault-handler.ts` — vault I/O
- **Settings tab rewritten** as data-driven (`SETTING_DEFS` array). Adding a setting now requires one entry instead of a copy-pasted `new Setting(...)` block. Extracted to `src/settings.ts` with `DEFAULT_SETTINGS` constant and `IPluginSettingsHost` interface (Dependency Inversion).
- **`main.ts` streamlined to 130 lines** — orchestration only. `_scheduleAutoSync()` extracted; `registerInterval` for cleanup; `_resolveApiToken()` handles SecretStorage.
- **Notes rendering:** now a nested Obsidian callout (`> [!note]`, one line per segment) beneath the task instead of a truncated parenthetical on the task line.
- **Tag sanitization:** Habitica tag names normalized into valid single tokens, deduplicated, and cached. Emoji preserved via `\p{Extended_Pictographic}`.
- **`HabiticaApiClient` constructor:** accepts optional `{ baseUrl?, minRequestIntervalMs?, debug? }`. `baseUrl` no longer hardcoded. `minRequestIntervalMs` defaults to 2200ms for Habitica's 30 req/min limit. `userId` and `apiToken` are public `readonly`.
- **`shouldAutoSync()`** uses a lookup table instead of if-else ladder. Located in `src/lib/platform.ts`.
- **All vault writes** prefer `vault.process`/`vault.modify` over `adapter.write`, keeping metadata cache and open editors coherent.
- **`sectionToType`** now returns `undefined` for unrecognised sections (was fail-open to `'todo'`).
- **`tsconfig.json` modernized:** target ES2022, lib ES2022+DOM, `esModuleInterop`, `forceConsistentCasingInFileNames`, `resolveJsonModule`, `noImplicitReturns`, `noEmit`.
- **typescript** upgraded 4.7.4 → 5.4.5. **`minAppVersion`** bumped 0.15.0 → 1.11.4 (SecretStorage).
- **Credential-change detection:** `saveSettings()` rebuilds API client only when API User or API Token actually change.
- **Concurrent sync protection:** `_syncInFlight` guard prevents overlapping sync runs. Second invocation silently skipped. `finally` block ensures flag is always released.
- **Helper functions** (`formatTaskLine`, `formatTasks`, `getNextDailyDueDate`, `filterActive`) are module-level exports; no longer re-created on every sync call.
- **`escapeRegExp`** is now private to `src/vault/line-edit.ts`; no longer exported.
- **`PRIORITY_VALUE_TO_NAME`** lives in `src/markdown/parser.ts` alongside `PRIORITY_NAME_TO_VALUE`; inline priority map removed from formatter.
- **`HabiticaApiClient.createTask` input type** and **`updateTask` fields type** now share a `TaskMutateFields` base type.
- **Per-task `try/catch`** around scoring, creation, and checklist mutations — one failed task no longer aborts the entire sync.
- **Rate-limit retry** expanded from 429-only to 429/502/503/504 + network failures. Non-critical mutations (checklist add/score, task update) retry twice; critical (fetch, create, score) retry 3 times.
- **Sync summary** now reports per-action counts (created, updated, deleted, checklist added/scored/updated/deleted, score failures, skipped sections, skipped deletions).
- **Sync output heading** changed from `## Habitica Sync - DATE` to `# Habitica Sync — DATE` (level-1 heading, en-dash). Sections use `##` (level-2). Group tasks use `###` (level-3).
- **Markdown output:** `formatTaskLine` strips heading prefixes from task titles; notes split on real newlines; group-task subsection only rendered when Group ID is configured.
- **Task field rendering:** optional fields (`up`, `down`, `streak`, `attribute`, `frequency`, `everyX`, `repeat`, `startDate`) rendered via data-driven `OPTIONAL_FIELD_RENDERERS` registry instead of copy-pasted if-blocks.
- **`cleanTitle`** normalization now used symmetrically for comparison (strips inline fields, tags, and `%%scored%%`).
- **`scanNestedContent`** uses dynamic indent thresholds based on parent task line instead of hardcoded `{4,}`. Includes `readChecklistItemBlock` for multi-line continuation parsing.

### Fixed

- `TypeError: Cannot read properties of undefined (reading 'map')` crash when Habitica returns tasks with missing `tags` array.
- HTTP errors from Habitica API now throw named errors with status + body instead of silently propagating `undefined`.
- `getNextDailyDueDate` now correctly computes the next occurrence for `everyX > 1` dailies (was always returning start date or today). Now uses local-time arithmetic to avoid DST off-by-one.
- `VaultHandler.updateLine` uses positional line-index identity as primary path, with ID-based and whole-line unique-string fallbacks for legacy data. Prevents mis-targeting of lines with shared text prefixes.
- **Rate-limit bugs fixed:** 429 counter was dead code (never incremented); `X-RateLimit-Reset` header incorrectly treated as seconds-until-reset in one path vs epoch seconds in another. `minInterval` changed from 500ms (4× legal limit) to 2200ms.
- **Tag-diff false positive:** `_createTagsAndRegister` now runs before tag-set comparison, preventing spurious `updateTask` for tags just created this sync cycle.
- **Vault-scanned task titles** now use `cleanTitle()` (strips inline fields, tags, heading markers) before sending to Habitica. Previously leaked `#tag` tokens into created task titles.
- **`updateLineInFile`** now throws on mismatch instead of silently swallowing. Caller catches with duplicate-task warning.
- **Silent `catch {}` blocks** (3 sites in vault-handler) now log errors via `console.error`.
- **35 ESLint issues resolved** across 6 source files (sentence-case UI strings, `fetch` usage documented, empty catch blocks annotated, unused imports, `window.setTimeout`/`clearInterval`, floating promise marked `void`, unsafe `any` from `loadData()` replaced with typed spread, `checklistScoredCountLocal` wired into summary).
- Stale credentials: `saveSettings()` now recreates API client + SyncManager on credential change.
- Double-scoring protection: vault scan skips task IDs already scored by sync-file pre-pass within the same run.
- `_syncManagedTasks` wrong gate removed (was blocking field updates when checklist changed).
- `everyX` added to creation pipeline (was missing from `createTask` body construction).
- Checklist regex now supports `+ [ ]` / `* [ ]` bullet markers in addition to `- [ ]`.
- UTC date ambiguity fixed: `T00:00:00Z` suffix used consistently in `toLocaleDateStringSafe`, `getNextDailyDueDate`, and `getRecentCompletedTasks`.
- Orphaned task on score failure: `[id::]` now written back to vault line immediately after `createTask` succeeds, before `scoreTask`. If scoring fails, the ID is preserved for retry next sync.
- `stripInlineFields` now delegates to shared `FIELD_RE` (same regex as `parseInlineFields`), fixing inconsistency where `[id::abc]` (no space after `::`) was parsed but not stripped.

### Removed

- `crypto` module import — incompatible with mobile WebView; had no usages.
- `machineId` setting — machine binding was not implemented at runtime.
- `#### Personal Tasks` sub-header — tasks listed directly under type sections.
- `VaultHandler.getCheckedTasksFromFile`, `.getCreatableLinesFromFile`, `.getManagedTaskLines` — replaced by `parseSyncFile()` in `sync-file-model.ts`.
- `SyncManager._delay` and its 3 call sites — inter-request pacing handled by `HabiticaApiClient._enqueue`.
- `SyncManager._updateTaskChecklistInMemory` — delegated to `TaskRegistry.updateChecklist`.
- Plaintext `apiToken` field from `PluginSettings` — replaced by `apiTokenSecretName` for SecretStorage.
- `src/helpers.ts` barrel file — all imports now point to domain modules directly.
- `.github/copilot-instructions.md` and `.github/hooks/rtk-rewrite.json` — removed from repo.

## [1.6.5] - 2026-01-08

### Added

- Option to disable scoring tasks in Habitica (read-only sync mode).
- Option to disable creating new tasks in Habitica (only scores existing tasks).
- Configurable sync interval (minutes) for automatic sync.

### Changed

- Exclude tasks just scored from sync output.
- Updated settings UI for new options.
- Renamed from habitica-sync to habitica-fullsync in preperation for public release

## [1.6.4] - 2026-01-03

### Added

- Machine binding feature: restrict sync to a specific device using a hashed machine ID.
- New settings button to bind sync to the current machine.
- Current machine hash displayed in settings for transparency.# Changelog

## [1.6.3] - 2025-12-24

### Added

- Time zone-aware due dates for dailies and weekly tasks using local time.

### Changed

- Updated README to mention time zone handling.
- Version bump to 1.6.3.

## [1.6.2] - 2025-12-24

### Added

- Explicit tags for task types in Obsidian output:
  + Dailies tagged with #daily
  + Habits tagged with #habit
  + Rewards tagged with #reward

### Changed

- Updated README to reflect new tagging behavior.

## [1.6.1] - 2025-12-24

### Removed

- Habitica task link from Obsidian output for cleaner formatting.

### Changed

- Updated README to remove link and clarify notes placement.

## [1.6.0] - 2025-12-24

### Added

- Automatic Sync option:
  + Runs on plugin load and every 30 minutes.
- Folder selection setting for output file.
- Future start date handling for dailies and weekly tasks.
- Notes included in Markdown output (after text, before properties).

### Changed

- Improved error handling and performance.
- Markdown enhancements with summary section.

## [1.5.0] - Initial Release

### Features

- Sync Habitica tasks into Obsidian.
- Score completed tasks from vault (last 4 days).
- Support for group tasks.
- Rate-limited API calls with exponential backoff.
