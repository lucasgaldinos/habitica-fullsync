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

- [Habitica Full Sync Plugin for Obsidian](#habitica-full-sync-plugin-for-obsidian)
  - [Features](#features)
  - [Installation](#installation)
    - [Easy Way](#easy-way)
    - [Building from Source](#building-from-source)
    - [Local Development (testing without publishing)](#local-development-testing-without-publishing)
      - [Iterating on the code](#iterating-on-the-code)
  - [Settings](#settings)
  - [Usage](#usage)
  - [Markdown Output](#markdown-output)
    - [Creating tasks from markdown](#creating-tasks-from-markdown)
  - [Advanced](#advanced)
  - [Security](#security)
  - [Changelog](#changelog)
  - [License](#license)

# Habitica Full Sync Plugin for Obsidian

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

---

## Installation

### Easy Way

1. Download the latest release (`main.js`, `manifest.json`, and `styles.css` if present) from the repository. Note: You do not need the full repository source code for installation.
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
| Setting | Description |
| --- | --- |
| **API User** | Your Habitica API User ID. |
| **API Token** | Your Habitica API Token (masked password field; stored in Obsidian local data storage). |
| **Group ID** | Your Habitica Group ID (Party or Guild). |
| **Output Folder** | Folder where `habitica-fullsync.md` will be saved (leave blank for vault root). |
| **Automatic Sync** | Enable automatic sync on load and every X minutes. |
| **Sync Interval (minutes)** | How often to run auto-sync when enabled. |
| **Auto Sync Platform** | Choose which devices should run auto sync (desktop, mobile, or both). |
| **Disable Scoring** | Enable this to prevent scoring tasks in Habitica (read-only sync). |
| **Disable Creating New Tasks** | Enable this to prevent creating new tasks in Habitica (only scores existing tasks). |

---

## Usage

- **Manual Sync:**
  Use the command palette (`Ctrl+P`) and select “Sync Habitica Tasks” to run a sync manually.

- **Automatic Sync:**
  If enabled, sync runs on plugin load and at the interval you specify.

- **Scoring Tasks:**
  When scoring is enabled, completed tasks in your vault (marked `- [x] ...`) will be scored in Habitica if they have a Habitica ID.
  If a completed vault task does not have a Habitica ID and creating is enabled, a new Habitica task will be created and scored.

- **Scoring directly from the sync file:**
  Mark any `todo` or `daily` in `habitica-fullsync.md` as `- [x]` and trigger a sync. The plugin will score it in Habitica and remove it from the regenerated output. No `[completion::]` field is needed — the sync file is handled automatically.

  >[!note]
  >Habits and rewards are excluded from sync-file checkbox scoring. Score habits via the standard `[completion::]` mechanism in other vault files.

- **Read-Only Mode:**

  Enable "Disable Scoring" to prevent any scoring actions in Habitica.

  Enable "Disable Creating New Tasks" to prevent new Habitica tasks from being created for completed vault tasks.

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

To create a brand-new Habitica task, add an unchecked line **without** an `[id::]` under
the relevant section, then sync:

```markdown
### To-Dos
- [ ] Draft the quarterly report #focus [priority:: high] [due:: 2026-06-01]
  > [!note]
  > Pull figures from the analytics dashboard.
  - [ ] Gather metrics
  - [ ] Write summary
```

On the next sync the task is created in Habitica (type inferred from the `### To-Dos`
section), tags are resolved or created, checklist items and notes are pushed, and the
assigned `[id::]` is written back. Lines under a `#### Group Tasks` subsection are skipped.
Set **Disable Creating New Tasks** to turn this off.

---

## Advanced

- **Rate Limiting:**
  The plugin automatically handles Habitica API rate limits. If you hit the limit, sync will retry after a delay.

- **Error Handling:**
  Habitica API errors (non-2xx HTTP responses or `success: false` in the response envelope) throw descriptive errors that include the HTTP status and message body. Errors are logged to the Obsidian console and surfaced as notices.

- **Concurrent Sync Protection:**
  A `_syncInFlight` guard ensures that if a manual sync is triggered while an auto-sync is running (or vice versa), the second invocation is silently skipped with a console warning.

- **Customization:** All sync and scoring behaviors can be customized via the settings tab.

---

## Security

### `data.json` Configuration

Your Habitica API token and plugin configurations are stored in an auto-generated `data.json` file in the plugin directory.

- **Security Note:** This file contains your API User and Token in plain text. The settings UI renders the token field as a masked password input (characters are hidden), but the file itself is not encrypted. Do not commit this file to public repositories or share your plugin directory with untrusted parties.
- If you're developing or working with the repository, ensure `data.json` remains in `.gitignore` (as set up by default) so you don't accidentally push your credentials.

---

## Changelog

See `CHANGELOG.md` for a full history of features, changes, and fixes.

---

## License

MIT

---

If you need further customization or want to contribute, please open an issue or pull request!
