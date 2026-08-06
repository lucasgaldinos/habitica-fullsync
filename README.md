---
title: "Habitica Full Sync — Obsidian Plugin"
description: "Sync Habitica tasks into your Obsidian vault with scoring, group task support, and automatic sync."
created: "2026-05-14"
author: "[[Lucas Galdino]]"
tags:
  - "habitica/extensions/obsidian-sync"
  - "habitica/add-ons"
links:
  - "[[README]]"
  - "[[plan]]"
---

# Habitica Full Sync Plugin for Obsidian

- [Habitica Full Sync Plugin for Obsidian](#habitica-full-sync-plugin-for-obsidian)
  + [Features](#features)
  + [Installation](#installation)
    - [Easy Way](#easy-way)
    - [Building from Source](#building-from-source)
    - [Local Development (testing without publishing)](#local-development-testing-without-publishing)
      + [Iterating on the code](#iterating-on-the-code)
  + [Settings](#settings)
  + [Usage](#usage)
    - [Sync Mechanism](#sync-mechanism)
    - [Manual Sync](#manual-sync)
    - [Automatic Sync](#automatic-sync)
    - [Concurrent Sync Protection](#concurrent-sync-protection)
    - [Credential Changes](#credential-changes)
    - [Scoring Tasks](#scoring-tasks)
    - [Creating Tasks](#creating-tasks)
    - [Read-Only Mode](#read-only-mode)
  + [Markdown Output](#markdown-output)
    - [Creating tasks from markdown](#creating-tasks-from-markdown)
  + [Advanced](#advanced)
  + [Security](#security)
    - [`data.json` Configuration](#datajson-configuration)
  + [Changelog](#changelog)
  + [License](#license)

Sync your Habitica tasks with your Obsidian vault. This plugin pulls your personal and group tasks from Habitica, formats them in Markdown for review and tracking, and scores completed vault tasks back to Habitica automatically.

---

## Features

- **Sync Habitica tasks into Obsidian:**
  Pulls your personal and group tasks from Habitica and formats them in Markdown for easy review and tracking.

- **Score completed tasks from your vault:**
  Automatically scores Habitica tasks that you’ve marked as completed in Obsidian (with support for last 4 days).

- **Score tasks directly from the sync file:**
  Check off any `todo` or `daily` in `habitica-fullsync.md` and it will be scored in Habitica on the next sync. The task is then removed from the regenerated output.

- **Create tasks from markdown:**
  Write a new unchecked task (`- [ ]`) under any section in `habitica-fullsync.md` with **no** `[id::]` and it is created in Habitica on the next sync. The task **type is inferred from the section** it sits under (To-Dos → todo, Dailies → daily, Habits → habit, Rewards → reward). `text`, `[priority::]`, `[due::]`, `#tags`, a `> [!note]` callout, and nested `- [ ]` checklist items are all sent to Habitica; unknown tags are created automatically.

- **Per-type Dataview views:**
  Each task-type section ends with a ready-made `dataview` query tailored to that type. Requires the optional [Dataview](https://github.com/blacksmithgu/obsidian-dataview) community plugin; without it the block renders harmlessly as a code fence.

- **Support for group tasks:**
  Syncs tasks from your Habitica party or guild.

- **Rate-limited API calls:**
  Handles Habitica API rate limits gracefully with exponential backoff.

- **Configurable automatic sync interval:**
  Set how often the plugin syncs with Habitica (in minutes).

- **Disable scoring option:**
  Enable read-only sync mode to prevent scoring tasks in Habitica.

- **Disable creating new tasks option:**
  Prevents the plugin from creating new Habitica tasks — both for completed vault tasks and for hand-written `- [ ]` lines in the sync file — that don’t already exist in Habitica.

- **Folder selection for output file:**
  Choose where the `habitica-fullsync.md` file is saved in your vault.

- **Platform-aware auto-sync:**
  Choose whether auto-sync runs on desktop, mobile, or both.

- **Concurrent sync protection:**
  An in-flight guard prevents overlapping sync runs when auto-sync and manual sync fire simultaneously.

- **Time zone–aware due dates:**
  Dailies use UTC-normalised arithmetic for accurate `everyX`-day cycle computation.

- **Sanitized tags for valid Obsidian links:**
  Multi-word Habitica tag names (e.g. `data engineering`) are normalized to valid single tokens (`#data-engineering`). Dailies, habits, and rewards also receive an explicit type tag.

- **Notes and checklists in Markdown output:**
  Task notes are rendered as a nested `> [!note]` callout; Habitica checklist (subtask) items are rendered as indented nested checkboxes under the parent task.

- **Summary section in Markdown output:**
  Each sync includes a summary of the number of tasks synced.

- **Ribbon icon + status bar:**
  Left-ribbon `refresh-cw` icon for one-click manual sync. Status bar shows 🔄 Ready / ⏳ Syncing… / ✅ Synced just now / ❌ Sync failed. Won't lie — silently skipped syncs (already in progress, within cooldown) reset to Ready.

- **Incremental vault scanning:**
  Subscribes to Obsidian's `MetadataCache` to track recently changed files. Only scans modified files between syncs instead of every `.md` file every time. Full scan runs when no changes are detected.

- **Obsidian-native HTTP (`requestUrl`):**
  Uses Obsidian's built-in `requestUrl` instead of raw `fetch` for API calls — handles CORS, mobile network proxies, and provides platform-native timeout/retry behavior.

- **Cross-platform path safety (`normalizePath`):**
  All path construction uses Obsidian's `normalizePath()`, preventing bugs from Windows backslashes or double slashes.

- **SecretStorage-backed API token:**
  API token stored via Obsidian's native `SecretStorage` API (macOS Keychain, Linux libsecret, Windows DPAPI). Never written to `data.json`. Only the secret *name* is persisted.

- **Dual-Layer Architecture**: Uses a local SQLite database (`state.sqlite`) normalized to 3NF as the robust source of truth, while the Markdown file serves as the interactive presentation layer. Pushing local edits utilizes an ETL pipeline with computed SQL diffs.
- **Field Registry architecture:**
  Single-source-of-truth `FIELD_REGISTRY` defines every task field's parse, render, diff, and API mapping in one place. Adding a field is a one-file change. Consumed by parser, formatter, sync-manager, and API client.



---

## Installation

### Easy Way

1. Download the latest release (`main.js`, `manifest.json`, and `styles.css` if present) from the repository.
   >[!Note]
   >You do not need the full repository source code for installation.
2. Create a folder named `habitica-fullsync` inside your vault's `.obsidian/plugins/` directory.
3. Place the downloaded files into that new folder.
4. Enable the plugin in Obsidian’s settings (under Community Plugins).
5. Enter your Habitica API credentials and configure options as desired.

---

### Building from Source

This plugin uses typescript + esbuild. The source lives in `src/`; `main.js` is the bundled output.

```bash
npm install
npm run build    # production build → main.js
npm run dev      # watch mode for development
npm run lint     # ESLint (obsidianmd plugin rules)
npm run lint:fix # ESLint with auto-fix
npm test         # build the helper test bundle and run the Node test suite
```

Do not edit `main.js` directly — it is overwritten on every build.

---

### Local Development (testing without publishing)

Obsidian loads plugins from `<vault>/.obsidian/plugins/<plugin-id>/`. The easiest dev workflow
is a **symlink** so every build is instantly visible in Obsidian without copying files.

1. Create the symlink

    ```bash
    # Replace <vault> with the absolute path to your vault root
    ln -s "$(pwd)" "<vault>/.obsidian/plugins/habitica-fullsync"
    ```

    Example:

    ```bash
    ln -s \
      "/path/to/your/projects/habitica-fullsync" \
      "/path/to/your/vault/.obsidian/plugins/habitica-fullsync"
    ```

    Obsidian reads `manifest.json` and `main.js` from the symlinked directory. Every
    `npm run build` is live immediately.

2. Enable Community Plugins in Obsidian

    ```ascii
    Settings → Community plugins → Turn off Restricted mode
    ```

    Obsidian ships with community plugins disabled. This must be done once.

3. Enable this plugin

    ```ascii
    Settings → Community plugins → Installed plugins → **Habitica Full Sync** → toggle ON
    ```

    If the plugin doesn't appear, click **Reload plugins** (the circular arrow icon).

4. Configure credentials

    ```ascii
    Settings → Community plugins → Habitica Full Sync → gear icon
    ```

    Fill in **API User** and **API Token** (found in Habitica → User Settings → API).

5. Run a sync

    ```ascii
    Open the command palette (`Ctrl+P` / `Cmd+P`) → **Sync Habitica Tasks**.
    ```

    The output file `habitica-fullsync.md` will be written to your configured output folder (or vault root if left blank).

#### Iterating on the code

```bash
npm run dev   # starts esbuild in watch mode — rebuilds on every file save
```

Then in Obsidian:

```ascii
disable → re-enable the plugin (or use the
```

[Hot-Reload](https://github.com/pjeby/hot-reload) community plugin for automatic reloads).

---

## Settings

<!-- prettier-ignore -->
| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| **API User** | text | `""` | Your Habitica API User ID (UUID). Found in Habitica → Settings → API. |
| **API Token** | secret | `""` | Your Habitica API token, stored securely via Obsidian SecretStorage (OS credential store). |
| **Group ID** | text | `""` | Your Habitica Group ID (Party or Guild) for shared tasks. Leave empty to disable group syncing. |
| **Output Folder** | text | `""` | Vault-relative folder where `habitica-fullsync.md` is saved. Leave blank for vault root. |
| **Automatic Sync** | toggle | `false` | Enable automatic sync on plugin load and on the configured interval. |
| **Auto Sync Platform** | dropdown | `both` | Which devices should run auto-sync: desktop, mobile, or both. |
| **Sync Interval (minutes)** | number | `30` | How often to run auto-sync when enabled. Must be a positive integer. |
| **Disable Scoring** | toggle | `false` | Enable read-only sync mode — prevents scoring tasks in Habitica. |
| **Disable Creating New Tasks** | toggle | `false` | Prevents creating new Habitica tasks from both completed vault tasks and hand-written sync-file lines. |
| **Scan vault for completed tasks** | toggle | `false` | Scan ALL Markdown files for checked-off tasks with a `[completion::]` field and score them. When off, only the sync file is checked. |
| **Completion lookback (days)** | number | `4` | How many days back to look for recently completed vault tasks. Covers a typical weekend gap. |

---

## Usage

> [!note]
> For a comprehensive guide covering task creation, editing, scoring, checklist management, tags, and troubleshooting, see **[docs/USAGE.md](docs/USAGE.md)**.

### Sync Mechanism

The plugin now separates sync into explicit **Push** and **Pull** commands to safely manage the dual-layer state (SQLite cache + Markdown UI):

### Pull from Habitica
1. **Fetch** all tasks and tags from Habitica (personal + optional group).
2. **Pre-pass:** scan `habitica-fullsync.md` for checked-off `todo`/`daily` tasks → score them in Habitica. Habits and rewards are excluded from this path (habits are scored via the standard vault completion mechanism).
3. **Vault scan (opt-in):** if **Scan vault for completed tasks** is enabled, the plugin iterates every `.md` file in the vault. For each file, it checks the file's `mtime` (last-modified timestamp) against a 4-day cutoff. If the file was modified recently, it reads the file and searches for lines matching ALL of:
   + Starts with `- [x]` (checked checkbox)
   + Does NOT contain `%%scored%%` (not already processed)
   + Has a `[completion:: YYYY-MM-DD]` field with a date ≥ the 4-day cutoff

   Matching tasks are scored in Habitica and the vault line is updated with `%%scored%%` to prevent double-scoring. **Disabled by default** — most users only need sync-file scoring (step 2).
4. **Creation:** for completed vault tasks without an existing Habitica ID (and `disableCreating = false`), create a new Habitica to-do, score it, and write the assigned ID back.
5. **Markdown creation:** create new Habitica tasks from hand-written `- [ ]` lines in the sync file (see [Creating tasks from markdown](#creating-tasks-from-markdown)).
### Push to Habitica
1. **Managed-task sync:** for every task line in the sync file that has an `[id::]`:
   + **Checklist sync:** new checklist items written in the file (indented `- [ ]`) are added to Habitica. Items checked off (`- [x]`) are scored. The sync summary reports both counts (e.g., `— added 2 checklist items — scored 1 checklist item`).
   + **Field updates (manual sync only):** if you edit a task's text, priority, due date, or tags in the Markdown file, those changes are pushed to Habitica. Auto-sync skips field updates — it only does scoring + creation.
7. **Render** the output document grouped by type (Dailies, To-Dos, Rewards, Habits) with per-type `dataview` query blocks.
8. **Write** `habitica-fullsync.md` to the configured output folder.

### Manual Sync

Use the command palette (`Ctrl+P`) and select **Habitica: Sync both (push then pull)**, **Habitica: Pull from remote**, or **Habitica: Push local changes**.

Manual syncs pass `allowUpdates = true` to the sync engine. This means **field edits** you make in the Markdown file (fixing a typo, changing priority, adjusting a due date, adding/removing tags) are pushed back to Habitica. Checklist items you check off in the file are also scored.

### Automatic Sync

If enabled in settings, sync runs once on plugin load and then every N minutes (configurable via **Sync Interval**). You can restrict auto-sync to desktop only, mobile only, or both platforms via **Auto Sync Platform**.

Auto-syncs pass `allowUpdates = false` — field edits in the Markdown file are **not** pushed to Habitica. Only scoring (checkboxes) and task creation run. This prevents auto-sync from overwriting manual edits you haven't finished yet.

The `shouldAutoSync()` function (in `src/lib/platform.ts`) is a pure lookup-table matcher — no if-else ladder. Adding a new platform option requires only a new key.

### Concurrent Sync Protection

An in-flight guard (`_syncInFlight`) prevents overlapping sync runs. If a manual sync is triggered while auto-sync is running (or vice versa), the second invocation is silently skipped with a console warning. The guard is released in a `finally` block so a thrown error never permanently locks out future syncs.

### Credential Changes

Changing your API User or API Token in settings takes effect immediately — no plugi reload required. The plugin detects the change and rebuilds the API client + syn manager. Changing non-credential settings (output folder, toggles, interval) doe **not** trigger a rebuild — only the relevant value is updated.

### Scoring Tasks

- **From the vault:** completed tasks (`- [x]`) with an `[id:: ...]` field are scored in Habitica. The line is updated with `%%scored%%` to prevent double-scoring on subsequent syncs.
- **From the sync file:** mark any `todo` or `daily` in `habitica-fullsync.md` as `- [x]` and trigger a sync. The plugin scores it in Habitica and removes it from the regenerated output. No `[completion::]` field is needed — the sync file is handled automatically.
- **Checklist items:** checklist items you check off in the sync file are scored in Habitica. The sync summary notice reports both added and scored checklist items (e.g., `— added 2 checklist items — scored 1 checklist item`).

> [!note]
> Habits and rewards are excluded from sync-file checkbox scoring. Score habits via the standard `[completion::]` mechanism in other vault files.

### Creating Tasks

- **From completed vault tasks:** a completed task with no `[id::]` triggers creation of a new Habitica to-do with the task text as title. The assigned ID is written back to the vault line.
- **From the sync file:** write a new `- [ ]` line (see [Creating tasks from markdown](#creating-tasks-from-markdown)).

Enable **Disable Creating New Tasks** to prevent both creation paths.

### Read-Only Mode

- Enable **Disable Scoring** to prevent any scoring actions in Habitica.
- Enable **Disable Creating New Tasks** to prevent new Habitica tasks from being created for completed vault tasks or hand-written lines.

---

## Markdown Output

Tasks are grouped by type (Dailies, To-Dos, Rewards, Habits). When a Group ID is configured, a "Group Tasks" subsection is added under each type. Without a Group ID, the structure is flat — no empty subsections are rendered.

Each task line includes: completion status, task title (heading markers stripped), sanitized type and Habitica tags, priority, due date, Habitica ID, and completion date for scored tasks. Notes are rendered as a nested `> [!note]` callout and checklist items as indented nested checkboxes beneath the task. Each section ends with a per-type `dataview` query block (requires the optional Dataview plugin).

Example (no Group ID configured):

```markdown
## Habitica Sync — 2026-05-14
*42 active tasks: 18 dailies · 16 to-dos · 0 rewards · 8 habits*

### Dailies
- [ ] Drink Water #daily [id:: abc123] [priority:: medium] [due:: 2026-05-14]
- [ ] Exercise #fitness #daily [id:: def456] [priority:: high] [due:: 2026-05-14]

​```dataview
TABLE WITHOUT ID item.text AS "Daily", item.priority AS "Priority", item.due AS "Next Due"
FROM "habitica-fullsync"
FLATTEN file.lists AS item
WHERE item.id AND contains(item.tags, "#daily")
SORT item.due ASC
​```

### To-Dos
- [ ] Read chapter 3 #reading [id:: ghi789] [priority:: low]
  > [!note]
  > Notes from book club.
  - [x] Read pages 40–55
  - [ ] Summarise key points
```

Example (Group ID configured):

```markdown
### Dailies
- [ ] Drink Water #daily [id:: abc123] [priority:: medium] [due:: 2026-05-14]

#### Group Tasks
- [ ] Party Quest Check-in #daily [id:: xyz999] [priority:: high]
```

### Creating tasks from markdown

To create a brand-new Habitica task, add an unchecked line **without** an `[id::]` under the relevant section, then sync:

```markdown
### To-Dos
- [ ] Draft the quarterly report #focus [priority:: high] [due:: 2026-06-01]
  > [!note]
  > Pull figures from the analytics dashboard.
  - [ ] Gather metrics
  - [ ] Write summary
```

On the next sync the task is created in Habitica (type inferred from the `### To-Dos` section), tags are resolved or created, checklist items and notes are pushed, and the assigned`[id::]` is written back. Lines under a `#### Group Tasks` subsection are skipped. Set **Disable Creating New Tasks** to turn this off.

---

## Advanced

- **Rate Limiting:** The plugin automatically handles Habitica API rate limits (HTTP 429). Rate-limited requests are retried with exponential backoff. If you hit the limit, sync will pause and retry after the server-specified delay.

- **Error Handling:** Habitica API errors (non-2xx HTTP responses or `success: false` in the response envelope) throw descriptive errors that include the HTTP status and up to 200 characters of the response body. Errors are logged to the Obsidian console with the module+method prefix (e.g., `habitica-fullsync SyncManager.sync:`) and surfaced as user-facing notices.

- **Concurrent Sync Protection:** A `_syncInFlight` guard ensures that if a manual sync is triggered while an auto-sync is running (or vice versa), the second invocation is silently skipped with a console warning. The guard is released in a `finally` block — a thrown error never permanently locks out future syncs.

- **Credential-change Detection:** Changing API credentials in settings triggers an immediate rebuild of the HTTP client and sync manager. Changing non-credential settings (output folder, toggles, interval) updates only the stored value — no unnecessary object churn.

- **Sync Interval Validation:** The Sync Interval input rejects non-positive values (0, negative, non-numeric) with an in-app notice. Only valid positive integers are accepted and persisted.

- **Source Architecture:** The codebase follows SOLID principles across 6 domains in `src/`:
  + `src/main.ts` — plugin lifecycle + orchestration (~130 lines)
  + `src/settings.ts` — data-driven settings tab with `DEFAULT_SETTINGS` + `IPluginSettingsHost` (DIP)
  + `src/types.ts` — 11 TypeScript interfaces (zero logic, zero Obsidian imports)
  + `src/api/api-client.ts` — Habitica HTTP transport, serialised request queue, rate limiting (~445 lines)
  + `src/lib/` — pure helpers: `dataview.ts` (query block builder), `platform.ts` (mobile detection + auto-sync gate)
  + `src/markdown/` — rendering + parsing: `formatter.ts`, `inline-fields.ts` (tokenizer), `parser.ts`, `scanner.ts`, `tags.ts`
  + `src/sync/` — sync orchestration: `sync-manager.ts`, `sync-file-model.ts` (single-pass parser), `task-registry.ts`, `sync-report.ts`
  + `src/vault/` — vault I/O: `vault-handler.ts`, `line-edit.ts` (positional line splicing)

  Run `npm run lint` to validate against Obsidian plugin best practices. Only `main.ts`, `settings.ts`, and `vault/vault-handler.ts` import from `'obsidian'` — all other modules are pure TypeScript, testable without Obsidian.

- **Customization:** All sync and scoring behaviors can be customized via the settings tab.

---

## Security

### `data.json` Configuration

Your plugin settings are stored in an auto-generated `data.json` file in the plugin directory.

- **API Token Security:** Your Habitica API token is stored in Obsidian's **SecretStorage** — the OS-level credential store (macOS Keychain, Linux libsecret, Windows DPAPI). It is **never** written to `data.json`. Only the secret *name* (`apiTokenSecretName`) is stored in the plugin's data file. The settings UI uses Obsidian's `SecretComponent` for input.
- Do not commit `data.json` to public repositories. It is already in `.gitignore` by default.
- If you previously stored a plaintext token in `data.json` (pre-v1.8.0), rotate your Habitica API token and delete the `apiToken` key from the file.

---

## Changelog

See `CHANGELOG.md` for a full history of features, changes, and fixes.

---

## License

MIT

---

If you need further customization or want to contribute, please open an issue or pull request!
