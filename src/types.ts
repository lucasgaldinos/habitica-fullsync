/**
 * Persisted configuration for the Habitica Full Sync plugin.
 * Stored via Obsidian's `Plugin.loadData()` / `Plugin.saveData()`.
 */
export interface PluginSettings {
  /** Habitica account user ID (UUID). Found in Habitica → Settings → API. */
  apiUser: string;
  /**
   * Habitica API token.
   * Stored in Obsidian's local data storage. Rendered as a masked password field in the settings UI.
   */
  apiToken: string;
  /**
   * Optional Habitica group (party or guild) ID.
   * When set, group tasks are fetched and included in the sync output.
   * Leave empty to disable group task syncing.
   */
  groupId: string;
  /**
   * Vault-relative folder path where `habitica-fullsync.md` is written.
   * An empty string means the vault root.
   */
  outputFolder: string;
  /** Whether to run an automatic sync on plugin load and on the configured interval. */
  autoSync: boolean;
  /** Which platform(s) should trigger auto-sync: `'desktop'` only, `'mobile'` only, or `'both'`. */
  autoSyncPlatform: 'both' | 'desktop' | 'mobile';
  /** Auto-sync interval in minutes. Only used when `autoSync` is `true`. */
  syncInterval: number;
  /**
   * When `true`, completed vault tasks are NOT scored in Habitica.
   * Enables read-only sync mode: Habitica data is pulled into Obsidian but nothing is written back.
   */
  disableScoring: boolean;
  /**
   * When `true`, no new Habitica tasks are created during sync. This governs **both**
   * creation paths: completed vault tasks without an ID, and hand-written unchecked
   * `- [ ]` lines (without an `[id::]`) in the sync file.
   * Only existing Habitica tasks (identified by `[id:: ...]`) are scored.
   */
  disableCreating: boolean;
}

/** A Habitica tag as returned by `GET /api/v3/tags`. */
export interface HabiticaTag {
  /** UUID of the tag. */
  id: string;
  /** Human-readable display name of the tag. */
  name: string;
}

/**
 * A single checklist (subtask) item attached to a Habitica task.
 * Returned inline on tasks from `GET /api/v3/tasks/user` as the `checklist` array.
 */
export interface HabiticaChecklistItem {
  /** UUID of the checklist item (unique within its parent task). */
  id: string;
  /** Display text of the checklist item. */
  text: string;
  /** Whether the item is checked off in Habitica. */
  completed: boolean;
}

/**
 * A Habitica task as returned by the v3 API (`GET /api/v3/tasks/user`, etc.).
 *
 * @remarks
 * The `tags` array is **not always present** — Habitica omits it for reward tasks and some
 * group tasks. Always guard access with `Array.isArray(task.tags)`.
 */
export interface HabiticaTask {
  /** Server-assigned UUID of the task. */
  id: string;
  /** Task title / display text shown in Habitica and the sync output. */
  text: string;
  /** Task type. Determines which section of the Markdown output the task appears in. */
  type: 'habit' | 'daily' | 'todo' | 'reward';
  /** Whether the task has been completed on the Habitica side. */
  completed: boolean;
  /**
   * Array of tag UUIDs attached to this task.
   * **Optional** — absent for rewards and some group tasks. Always guard with `Array.isArray`.
   */
  tags?: string[];
  /**
   * Checklist (subtask) items attached to this task.
   * **Optional** — absent for tasks without subtasks. Always guard with `Array.isArray`.
   */
  checklist?: HabiticaChecklistItem[];
  /**
   * Task notes / description text.
   * May be `null` (Habitica returns `null` for tasks with no notes).
   * Coerce with `String()` before calling string methods.
   */
  notes?: string | null;
  /**
   * ISO 8601 due date string for to-do tasks.
   * May be absent or contain an invalid date string — always validate.
   */
  date?: string;
  /**
   * ISO 8601 start date for daily tasks. Used by `getNextDailyDueDate` to compute the next
   * valid occurrence. May be absent or invalid — always guard with `isNaN(new Date(...).getTime())`.
   */
  startDate?: string;
  /** Recurrence frequency for daily tasks. */
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /**
   * For `frequency === 'daily'`: the task repeats every N days.
   * Defaults to `1` when absent (every day).
   */
  everyX?: number;
  /**
   * For `frequency === 'weekly'`: a map of weekday keys to their enabled state.
   * Keys: `'su'`, `'m'`, `'t'`, `'w'`, `'th'`, `'f'`, `'s'`.
   */
  repeat?: Record<string, boolean>;
  /**
   * Task difficulty / priority value.
   * - `2` → hard · `1.5` → medium · `1` → easy · `0.1` → trivial
   */
  priority?: number;
  /** For habit tasks: whether the positive (+) scoring direction is enabled. */
  up?: boolean;
  /** For habit tasks: whether the negative (−) scoring direction is enabled. */
  down?: boolean;
}

/**
 * Parsed representation of a hand-written markdown task line to be created in Habitica.
 *
 * Produced by `parseTaskLine` from a `- [ ]` line in the sync file that has no `[id::]`.
 * Tag references are split into already-known `tagIds` and `newTagNames` that must be
 * created via `POST /api/v3/tags` before the task is created.
 */
export interface NewTaskInput {
  /** Task title with all inline fields, tags, and markers stripped. */
  text: string;
  /** Task type inferred from the section heading the line sits under. */
  type: HabiticaTask['type'];
  /** Habitica priority value (`2`/`1.5`/`1`/`0.1`), or `undefined` to use the server default. */
  priority?: number;
  /** Due date for to-dos (`YYYY-MM-DD`), mapped to the Habitica `date` field. */
  date?: string;
  /** Start date for dailies (`YYYY-MM-DD`), mapped to the Habitica `startDate` field. */
  startDate?: string;
  /** Recurrence frequency for created dailies. Defaults to `'daily'`. */
  frequency?: 'daily';
  /** Habitica tag UUIDs resolved from the line's `#tags` via the reverse index. */
  tagIds: string[];
  /** Tag names present on the line that do not yet exist in Habitica and must be created. */
  newTagNames: string[];
  /** Notes parsed from a following `> [!note]` callout, or `undefined`. */
  notes?: string;
  /** Checklist item texts parsed from following nested `  - [ ]` lines. */
  checklistTexts: string[];
}
