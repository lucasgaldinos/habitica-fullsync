---
title: "Changelog — habitica-fullsync"
description: "Version history for the habitica-fullsync Obsidian plugin."
created: "2026-05-14"
author: "[[Lucas Galdino]]"
tags: []
links: []
---

## [Unreleased]

### Added

- typescript + esbuild build toolchain. Source now lives in `src/`.
  Run `npm run build` to produce `main.js`. Run `npm run dev` for watch mode.
- `src/types.ts` — `PluginSettings`, `HabiticaTask`, `HabiticaTag`, `HabiticaChecklistItem`,
  and `NewTaskInput` interfaces providing end-to-end type safety.
- **Create tasks from markdown:** any unchecked `- [ ]` line in `habitica-fullsync.md`
  that has no `[id:: ...]` is created in Habitica on the next sync. The task **type is
  inferred from its section** (To-Dos → todo, Dailies → daily, Habits → habit,
  Rewards → reward). `text`, `[priority::]`, `[due::]`, `#tags`, a following `> [!note]`
  callout, and nested `- [ ]` checklist items are all pushed to Habitica. Unknown tags
  are created automatically; the assigned `[id::]` is written back immediately. Lines
  under a `#### Group Tasks` subsection are skipped (group-task creation unsupported).
- **Checklist (subtask) rendering:** Habitica checklist items are now fetched and rendered
  as indented nested checkboxes (`- [ ]` / `- [x]`) under their parent task.
- **Per-type Dataview blocks:** each task-type section now ends with a ready-made
  ```` ```dataview ```` `TABLE` query tailored to that type's fields (to-dos surface
  priority/due/completion, dailies priority/due, habits and rewards priority). Dataview is
  an optional companion plugin; without it the block renders harmlessly as a code fence.
- **Test suite:** `npm test` builds a test bundle of the pure helpers and runs Node's
  built-in test runner (`tests/*.test.mjs`) covering tag sanitization, line formatting,
  markdown line parsing, and Dataview block generation.
- **Sync-file bidirectional scoring:** checking off a `todo` or `daily` task directly
  in `habitica-fullsync.md` now scores it in Habitica on the next sync and removes it
  from the regenerated output. Tasks already marked `completed` in Habitica are
  skipped (idempotent). Habits and rewards are excluded from this path — habits are
  scored via the standard `[completion::]` vault mechanism; rewards are not scored via
  checkbox.

### Changed

- **Notes rendering:** task notes are now rendered as a nested Obsidian callout
  (`> [!note]`, one line per segment) beneath the task instead of being crammed into a
  truncated parenthetical on the task line.
- **Tag sanitization:** Habitica tag names containing spaces or other characters
  Obsidian disallows in tags (e.g. `data engineering`) are normalized into valid single
  tokens (`#data-engineering`) and deduplicated.

### Fixed

- `TypeError: Cannot read properties of undefined (reading 'map')` crash when Habitica
  returns tasks with missing `tags` array (rewards, group tasks, new todos).
- HTTP error responses from Habitica API no longer propagate silently as `undefined`;
  they now throw a named error with the HTTP status and message body.
- `getNextDailyDueDate` now correctly computes the next occurrence for dailies with
  `everyX > 1` (previously always returned the start date or today).
- `VaultHandler.updateLine` now uses `[id:: ...]` as primary match key, preventing
  mis-targeting of lines that share a common text prefix.
- Stale credentials bug: `saveSettings()` now recreates `HabiticaApiClient` and
  `SyncManager` so credential changes in the settings UI take effect immediately
  without a plugin reload.
- Double-scoring protection: general vault scan now skips task IDs already scored by
  the sync-file pre-pass within the same sync run.
- Per-task `try/catch` around scoring and task creation in both the pre-pass and the
  vault scan — one failed task no longer aborts the entire sync.

### Changed

- `SyncManager.sync()` is now protected by an in-flight guard; concurrent invocations
  (auto-sync interval + manual command) are serialised — the second call is skipped.
- API Token setting field now renders as a password input (characters masked).
- Helper functions (`formatTaskLine`, `formatTasks`, `getNextDailyDueDate`, `filterActive`)
  are now module-level exports in `src/helpers.ts`; no longer re-created on every sync call.
- `formatTaskLine` now strips Markdown heading prefixes (`##`, `#`, etc.) from task
  titles — Habitica allows them in task text but they break Obsidian list rendering.
- Task notes are now split on real newlines (instead of collapsed with `;`), cleaned
  of heading markers per segment, and truncated to ~150 characters at a word boundary.
- The "Group Tasks" subsection in the sync output is now rendered only when a Group ID
  is configured, reducing noise for users without group tasks.
- Sync output summary changed from `**Summary:** N tasks synced.` to a per-type
  breakdown: `*N active tasks: X dailies · X to-dos · X rewards · X habits*`.
- Section heading separator changed from `##  Habitica Sync - DATE` to `## Habitica Sync — DATE` (en-dash).

### Removed

- `crypto` module import — incompatible with mobile WebView; had no usages.
- `machineId` setting — machine binding was not implemented at runtime; removed to
  eliminate dead code. May be revisited in a future release.
- `#### Personal Tasks` sub-header in each section — tasks are now listed directly
  under `### Dailies`, `### To-Dos`, etc., keeping the structure flat when no group ID
  is configured.

## [1.8.0] - 2026-01-08

### Added

- Option to disable scoring tasks in Habitica (read-only sync mode).
- Option to disable creating new tasks in Habitica (only scores existing tasks).
- Configurable sync interval (minutes) for automatic sync.

### Changed

- Exclude tasks just scored from sync output.
- Updated settings UI for new options.
- Renamed from habitica-sync to habitica-fullsync in preperation for public release

## [1.7.0] - 2026-01-03

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
