---
title: "Usage — habitica-fullsync"
description: "How to use the habitica-fullsync Obsidian plugin — creating, editing, scoring, and deleting tasks via markdown."
created: "2026-08-03"
author: "[Lucas Galdino](../../../../authors/Lucas%20Galdino.md)"
tags: ["usage", "habitica", "obsidian-plugin"]
---

# Usage — habitica-fullsync

- [Usage — habitica-fullsync](#usage--habitica-fullsync)
  + [Quick start](#quick-start)
  + [The sync file](#the-sync-file)
    - [Sections](#sections)
    - [Inline-field DSL](#inline-field-dsl)
      + [Core fields (always rendered)](#core-fields-always-rendered)
      + [Optional fields (rendered when set)](#optional-fields-rendered-when-set)
      + [Control sentinels](#control-sentinels)
    - [Checklist items](#checklist-items)
    - [Notes callout](#notes-callout)
    - [Dataview blocks](#dataview-blocks)
  + [Creating tasks](#creating-tasks)
    - [Rules](#rules)
    - [Example — minimal task](#example--minimal-task)
    - [Example — task with everything](#example--task-with-everything)
  + [Scoring (completing) tasks](#scoring-completing-tasks)
    - [In the sync file](#in-the-sync-file)
    - [In other vault files (opt-in)](#in-other-vault-files-opt-in)
  + [Editing existing tasks](#editing-existing-tasks)
    - [What syncs bidirectionally](#what-syncs-bidirectionally)
    - [Field-clearing sentinels](#field-clearing-sentinels)
  + [Deleting tasks](#deleting-tasks)
  + [Managing checklist items](#managing-checklist-items)
    - [Adding checklist items](#adding-checklist-items)
    - [Scoring (checking off)](#scoring-checking-off)
    - [Editing text](#editing-text)
    - [Deleting](#deleting)
  + [Tags](#tags)
    - [Sanitization](#sanitization)
    - [Type tags](#type-tags)
    - [Creating new tags](#creating-new-tags)
  + [Manual vs automatic sync](#manual-vs-automatic-sync)
    - [allowUpdates gate](#allowupdates-gate)
    - [Sync triggers](#sync-triggers)
    - [Concurrency protection](#concurrency-protection)
  + [Settings reference](#settings-reference)
  + [What does NOT sync back to Habitica](#what-does-not-sync-back-to-habitica)
  + [Troubleshooting](#troubleshooting)

## Quick start

1. **Install** the plugin and configure your Habitica API credentials in Settings.
2. **Run a manual sync** (`Ctrl+P` → **Habitica: Sync both (push then pull)**, or click the ribbon icon).
3. Open the generated `habitica-fullsync.md` file — it contains all your Habitica tasks organized by type.
4. **Check off a task** (`- [x]`) in the file and sync again — it will be scored in Habitica.
5. **Write a new task** (`- [ ]`) under any section with no `[id::]` — it will be created in Habitica on the next manual sync.

## The sync file

The plugin uses an embedded SQLite database normalized to 3NF as its source of truth, and generates a single Markdown file (`habitica-fullsync.md`) in your configured output folder. This file is the **bidirectional bridge** between your vault and Habitica — every change you make to it is read on the next sync and pushed to Habitica via an internal ETL pipeline.

### Sections

Tasks are grouped by type under level-2 headings:

```markdown
# Habitica Sync — 2026-08-03
*112 active tasks: 19 dailies · 51 to-dos · 2 rewards · 40 habits*

## Dailies
...daily tasks...

## To-Dos
...to-do tasks...

## Rewards
...reward tasks...

## Habits
...habit tasks...
```

If a **Group ID** is configured, group tasks appear under a `### Group Tasks` sub-heading within each section. You **cannot** create or delete tasks inside `### Group Tasks` — those are managed by your party/guild in Habitica.

### Inline-field DSL

The plugin uses `[key:: value]` inline-field tokens embedded in task lines. These are Dataview-compatible and parsed by the plugin on every sync.

#### Core fields (always rendered)

| Token | Example | Meaning |
|---|---|---|
| `[id:: uuid]` | `[id:: abc-123]` | Habitica task UUID — the plugin's stable identity marker. **Never add or edit this manually.** |
| `[priority:: level]` | `[priority:: high]` | Task difficulty: `high`, `medium`, `low`, `lowest` |
| `[due:: YYYY-MM-DD]` | `[due:: 2026-06-01]` | Due date (to-dos) or next occurrence (dailies) |
| `[completion:: YYYY-MM-DD]` | `[completion:: 2026-05-14]` | Date the task was completed in Habitica |

#### Optional fields (rendered when set)

| Token | Type | Rendered when |
|---|---|---|
| `[streak:: N]` | number | Non-zero streak counter |
| `[attribute:: str]` | enum | Task attribute set (`str`, `int`, `per`, `con`) |
| `[frequency:: daily\|weekly\|monthly\|yearly]` | enum | Frequency is not `daily` (the default) |
| `[everyX:: N]` | number | Interval > 1 (e.g. every 3 days) |
| `[repeat:: su,m,t,w,th,f,s]` | csv | Weekly repeat days (not all 7 enabled) |
| `[startDate:: YYYY-MM-DD]` | date | Daily task with an explicit start date |
| `[up:: true\|false]` | boolean | Habit positive direction |
| `[down:: true\|false]` | boolean | Habit negative direction |

> [!note]
> Type tags (`#daily`, `#habit`, `#reward`) are appended automatically by the plugin. You never need to add them manually. To-do tasks are identified by the *absence* of a type tag.

#### Control sentinels

| Token | Effect |
|---|---|
| `[delete::]` | Deletes the task from Habitica on next **manual** sync. The line is removed from the regenerated output. Group/challenge tasks are skipped (Habitica returns 401). |
| `[due:: none]` | Clears the due date |
| `[notes::]` (empty value) | Clears the notes |
| `[priority:: none]` | Resets priority to `low` |

### Checklist items

Subtasks (checklist items) render as indented nested checkboxes beneath their parent task:

```markdown
- [ ] Study at least 2 hours #daily [id:: 097a0025-…] [priority:: high]
  - [ ] Organize concepts to study - 15m [subId:: 55ef2327-…]
  - [ ] Write them down as TODOs - 15m [subId:: b0bfe86f-…]
  - [ ] Start the tasks for the day [subId:: c0d8ae18-…]
```

Each item carries a `[subId:: uuid]` for stable identity across syncs. **Do not add or edit the `[subId::]` manually** — the plugin assigns and manages it. See [Managing checklist items](#managing-checklist-items) for the full workflow.

### Notes callout

Task notes render as a nested Obsidian callout `> [!note]` beneath the task line, indented 2 spaces to nest inside the list item:

```markdown
- [ ] Task title #focus [id:: abc-123] [priority:: medium]
  > [!note]
  > First paragraph of notes.
  > Second paragraph with more detail.
```

When you create a task with a `> [!note]` callout, the content is sent to Habitica as the task's notes field.

### Dataview blocks

Each section ends with a fenced `dataview` query block that displays a filtered, sortable table of that type's tasks. These blocks are **read-only** — they are regenerated on every sync and any edits you make to them will be overwritten. The literal task checkboxes above the Dataview block are what you interact with (check off, edit fields, add subtasks).

Dataview is an optional companion plugin. Without it, the blocks render harmlessly as code fences.

## Creating tasks

Write a new unchecked task line (`- [ ]`) under any section heading (`## Dailies`, `## To-Dos`, `## Habits`, `## Rewards`) in the sync file, with **no** `[id::]` field. On the next **manual** sync, the plugin:

1. Reads the line and infers the task **type from the section heading**.
2. Parses `text`, `[priority::]`, `[due::]`, `#tags`, a following `> [!note]` callout, and nested `- [ ]` checklist items.
3. Creates the task in Habitica.
4. Writes the assigned `[id::]` back to the line so it becomes a managed task.
5. Regenerates the file — your task now appears with all server fields.

### Rules

- The line **must not** have `[id::]` — if it does, the plugin treats it as an existing managed task.
- The line **must** be under a recognized section heading. Unrecognized sections are skipped with a warning.
- The line **must not** be the `_No tasks found._` placeholder.
- Lines inside `### Group Tasks` are **skipped** — group-task creation is not supported.
- One failed creation does not abort the sync; the error is logged to the console.

### Example — minimal task

Write this under `## To-Dos`:

```markdown
- [ ] Buy milk
```

Sync → a Habitica to-do named "Buy milk" is created with default priority.

### Example — task with everything

Write this under `## To-Dos`:

```markdown
- [ ] Draft report #focus [priority:: high] [due:: 2026-08-15]
  > [!note]
  > Pull figures from the Q2 dashboard.
  > Include executive summary.
  - [ ] Gather metrics
  - [ ] Write findings
  - [ ] Send for review
```

Sync → a Habitica to-do is created with:
- Title: "Draft report"
- Tag: `focus` (created automatically if it doesn't exist in Habitica yet)
- Priority: high
- Due date: 2026-08-15
- Notes: "Pull figures from the Q2 dashboard.\nInclude executive summary."
- 3 checklist items

## Scoring (completing) tasks

### In the sync file

Check off (`- [x]`) any **managed** `todo` or `daily` (one that already has an `[id::]`) in the sync file. On the next sync (manual or auto), the plugin scores it `up` in Habitica and removes it from the regenerated output.

> [!warning]
> **Habits and rewards are excluded** from sync-file checkbox scoring. Checking off a habit or reward in the sync file has no effect — habits don't become `completed: true` after scoring (they'd re-score on every sync), and rewards are a purchase action, not a completion.

### In other vault files (opt-in)

Enable the **Scan vault for completed tasks** setting to have the plugin scan all Markdown files in your vault for `- [x]` lines with a `[completion:: YYYY-MM-DD]` field and no `%%scored%%` marker. When found, the task is scored in Habitica and the line is annotated with `%%scored%%` to prevent double-scoring.

This path also supports **creating** tasks: if a completed vault line has no `[id::]`, the plugin creates a new to-do in Habitica, writes the `[id::]` back to the vault line, scores it, and marks `%%scored%%`.

## Editing existing tasks

Edit a managed task's inline fields in the sync file and run a **manual** sync. The plugin extracts your edits into staging tables, compares them against the normalized SQLite database, and pushes differences via `PUT /tasks/:id`.

### What syncs bidirectionally

These fields are diffed and pushed to Habitica on manual sync. Edit them in the markdown and the change will appear in Habitica:

- `text` — the task title (text before the first `[field::` token)
- `[priority::]` — `high`, `medium`, `low`, `lowest`
- `[due::]` — `YYYY-MM-DD` (to-dos only)
- `[up::]` / `[down::]` — habit direction (habits only)
- `[streak::]` — daily streak counter
- `[attribute::]` — `str`, `int`, `per`, `con`
- `[frequency::]` — `daily`, `weekly`, `monthly`, `yearly` (dailies only)
- `[everyX::]` — recurrence interval (dailies only)
- `[repeat::]` — comma-separated weekday codes (weekly dailies only)
- `[startDate::]` — `YYYY-MM-DD` (dailies only)
- `#tags` — add or remove tags by editing the `#token` list
- Notes callout — edit the `> [!note]` block content
- Checklist items — add, check off, edit text, or remove (see [Managing checklist items](#managing-checklist-items))

Fields that Habitica manages server-side (e.g., `streak`, `attribute`) can be manually corrected in the markdown.

### Field-clearing sentinels

| Sentinel | Effect |
|---|---|
| `[due:: none]` | Removes the due date |
| `[notes::]` (empty) | Clears all notes |
| `[priority:: none]` | Resets to `low` (1) |

## Deleting tasks

Add `[delete::]` to a managed task line and run a **manual** sync:

```markdown
- [ ] Old task #daily [id:: abc-123] [priority:: low] [delete::]
```

The task is deleted from Habitica and removed from the regenerated output. The sync summary reports the deletion count.

> [!warning]
> - **Group/challenge tasks** cannot be deleted via the plugin — Habitica returns 401. The plugin skips them with a warning and increments the `skipped deletions` counter.
> - **Auto-sync never deletes.** The `[delete::]` sentinel is only processed on manual sync (`allowUpdates: true`).

## Managing checklist items

Each checklist item carries a `[subId:: uuid]` — the plugin's stable identity for that subtask. **Never add or edit `[subId::]` manually.** The plugin assigns it on creation and uses it to match items across syncs.

### Adding checklist items

Add a new indented `- [ ]` line under a managed task:

```markdown
- [ ] Study #daily [id:: abc-123] [priority:: high]
  - [ ] Review notes              ← existing (has subId)
  - [ ] New topic to cover        ← NEW — no subId
```

On manual sync, the plugin detects the new item (no matching `subId` or text), calls `POST /tasks/:id/checklist`, and renders the assigned `[subId::]` on the next regeneration.

### Scoring (checking off)

Change `- [ ]` to `- [x]` on a checklist item:

```markdown
  - [x] Review notes [subId:: abc]   ← checked off
  - [ ] New topic [subId:: def]
```

On the next sync (manual or auto), the plugin scores the item via `POST /tasks/:id/checklist/:itemId/score`. The checked state in the regenerated output reflects the server response.

### Editing text

Edit the text of a checklist item. On manual sync, the plugin detects the text change (matching by `subId`), calls `PUT /tasks/:id/checklist/:itemId` with the new text.

> [!note]
> Checklist items with multi-line text (created on Habitica mobile) preserve their formatting — continuation lines, headings, bullets, and paragraph breaks are rendered with proper indentation.

### Deleting

Remove the entire checklist item line from the markdown. On manual sync, the plugin detects the missing `subId` and calls `DELETE /tasks/:id/checklist/:itemId`. The deletion is idempotent — if the item was already deleted (404), the plugin treats it as success.

## Tags

### Sanitization

Habitica tag names may contain spaces and characters Obsidian disallows in tags (`#data engineering` would render as only `#data`). The plugin normalizes them:

- Spaces → hyphens: `data engineering` → `#data-engineering`
- Disallowed characters stripped
- Emoji preserved: `⭐ important` → `#⭐-important`
- Results cached — the same tag name on many tasks only sanitizes once

### Type tags

The plugin automatically appends type-indicator tags:
- Dailies → `#daily`
- Habits → `#habit`
- Rewards → `#reward`

To-dos carry no type tag — they are identified by the *absence* of these tags in Dataview queries. Do not add type tags manually; they are deduplicated if present.

### Creating new tags

When you write a `#newtag` on a task you're creating, and that tag doesn't exist in your Habitica account yet, the plugin creates it automatically before creating the task. The tag name is reconstructed from the sanitized token (hyphens → spaces).

## Manual vs automatic sync

### allowUpdates gate

| Sync trigger | `allowUpdates` | What happens |
|---|---|---|
| **Manual sync** (command palette, ribbon icon) | `true` | Full bidirectional sync — creates tasks, scores completions, pushes field edits, processes checklist changes and deletions. |
| **Auto-sync** (interval) | `false` | Fetch + render only. Scores sync-file checkbox completions. Does **not** create new tasks, push field edits, process deletions, or sync checklist changes. |

This split prevents auto-sync from mutating your Habitica data without explicit intent. If you write a new `- [ ]` task or edit a field, you must trigger a manual sync for those changes to reach Habitica.

### Sync triggers

- **Command palette:** `Ctrl+P` → **Habitica: Sync both (push then pull)**
- **Ribbon icon:** Click the `refresh-cw` icon in the left ribbon
- **Auto-sync:** Runs on the configured interval (default 30 minutes) when enabled

The status bar shows the current state: 🔄 Ready / ⏳ Syncing… / ✅ Synced just now / ❌ Sync failed.

### Concurrency protection

- If a sync is already running, new sync requests are **silently skipped**.
- If the previous sync ended less than 2 minutes ago, new sync requests are **skipped** (rate-limit cooldown).
- The status bar won't lie — skipped syncs reset to 🔄 Ready rather than showing a false ✅.

## Settings reference

| Setting | Type | Default | Description |
|---|---|---|---|
| API user | text | `""` | Your Habitica User ID (UUID from Settings → API) |
| API token | secret | `""` | Your Habitica API token, stored in the OS credential store |
| Group ID | text | `""` | Optional group/party/guild ID for shared tasks |
| Output folder | text | `""` | Vault folder for `habitica-fullsync.md` (blank = vault root) |
| Automatic sync | toggle | `false` | Enable periodic auto-sync |
| Auto sync platform | dropdown | `both` | Which devices run auto-sync: desktop, mobile, or both |
| Sync interval (minutes) | number | `30` | Minutes between auto-sync runs |
| Disable scoring | toggle | `false` | Read-only mode — never score tasks in Habitica |
| Disable creating new tasks | toggle | `false` | Never create new Habitica tasks from markdown |
| Scan vault for completed tasks | toggle | `false` | Scan all `.md` files for completed tasks (not just the sync file) |
| Completion lookback (days) | number | `4` | How many days back to look for recently completed vault tasks |

## What does NOT sync back to Habitica

These are intentionally one-directional (Habitica → Obsidian) or not yet implemented:

- **Task type changes.** Moving a task from `## To-Dos` to `## Dailies` in the markdown does **not** change its type in Habitica. `type` is intentionally excluded from the update payload to prevent accidental type changes.
- **Checklist items inside `### Group Tasks`.** Group-task checklist changes are not pushed back.
- **Reminders.** The Habitica reminders array is not rendered or editable in the markdown (complex array-of-objects DSL, low user demand).
- **Task order / position.** The plugin does not preserve or modify task sort order in Habitica.
- **Challenge task assignments.** Challenge tasks and their assignments are read-only.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Task created with `[id::]` missing | Write-back of the ID failed (file permission, Vault API error). Check the Obsidian console for errors. | Add the ID manually from the Habitica task URL, or delete the line and recreate. |
| `[subId::]` appears doubled on checklist items | Build predates the 2026-08-03 trim fix — whitespace-only subId values were immortal. | Rebuild the plugin from latest source. The next sync will fix affected lines. |
| Sync file shows `_No tasks found._` | All tasks of that type are completed or scored. | Normal — the Dataview block still shows historical data. |
| Edits to fields not reflected in Habitica | Auto-sync doesn't push field updates. Only manual sync does. | Trigger a manual sync (`Ctrl+P` → **Habitica: Sync both (push then pull)**). |
| "Sync already in progress" warning | A previous sync is still running. | Wait for it to complete. The status bar will update. |
| Rate-limit warnings in console | The plugin is approaching Habitica's 30 req/min limit. | Normal for large task lists. The queue automatically spaces requests and pauses when needed. |
| Unknown section warning | A `## Section` heading doesn't match any recognized type. | Use exactly `## Dailies`, `## To-Dos`, `## Habits`, or `## Rewards`. |
| Group tasks not appearing | Group ID may be unset or invalid. | Verify the Group ID in plugin settings. |
