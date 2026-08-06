/** Valid values for the auto-sync platform dropdown and persisted setting. */
export type AutoSyncPlatform = 'both' | 'desktop' | 'mobile';

/**
 * Persisted configuration for the Habitica Full Sync plugin. Stored via Obsidian's `Plugin.loadData()` / `Plugin.saveData()`.
 */
export interface PluginSettings {
  /** Habitica account user ID (UUID). Found in Habitica → Settings → API. */
  apiUser: string;
  /**
   * Name (ID) of the Habitica API token secret in Obsidian's {@link SecretStorage}. The actual token value is never stored in `data.json` — it lives in the OS-level credential store (Keychain/libsecret/DPAPI), shared across all plugins. Retrieve at runtime via `app.secretStorage.getSecret(this.apiTokenSecretName)`.
   */
  apiTokenSecretName: string;
  /**
   * Optional Habitica group (party or guild) ID. When set, group tasks are fetched and included in the sync output. Leave empty to disable group task syncing.
   */
  groupId: string;
  /**
   * Vault-relative folder path where `habitica-fullsync.md` is written. An empty string means the vault root.
   */
  outputFolder: string;
  /** Whether to run an automatic sync on plugin load and on the configured interval. */
  autoSync: boolean;
  /** Which platform(s) should trigger auto-sync. */
  autoSyncPlatform: AutoSyncPlatform;
  /** Auto-sync interval in minutes. Only used when `autoSync` is `true`. */
  syncInterval: number;
  /**
   * When `true`, completed vault tasks are NOT scored in Habitica. Enables read-only sync mode: Habitica data is pulled into Obsidian but nothing is written back.
   */
  disableScoring: boolean;
  /**
   * When `true`, no new Habitica tasks are created during sync. This governs **both** creation paths: completed vault tasks without an ID, and hand-written unchecked `- [ ]` lines (without an `[id::]`) in the sync file. Only existing Habitica tasks (identified by `[id:: ...]`) are scored.
   */
  disableCreating: boolean;
  /**
   * When `true`, the vault-wide scanner runs — scans ALL Markdown files for `- [x]` lines with a `[completion:: YYYY-MM-DD]` field and no `%%scored%%` marker, scoring them in Habitica. Defaults to `false` — by default, only the sync file (`habitica-fullsync.md`) is checked for completed tasks.
   */
  enableVaultScan: boolean;
  /**
   * How many days back to look for recently completed vault tasks when scanning for tasks to score.
   * Defaults to `4` — covers a typical weekend gap.
   */
  completionLookbackDays: number;
}

// ── Dependency Inversion (ISP) ────────────────────────────────────────────

/**
 * Minimal contract the settings tab needs from its host plugin. The concrete plugin class satisfies this structurally — no circular import from `main.ts` needed.
 *
 * Used by {@link HabiticaSyncSettingTab} for dependency inversion (DIP): the settings tab depends on this abstraction, not on the concrete `HabiticaSyncFullPlugin` class.
 */
export interface IPluginSettingsHost {
  settings: PluginSettings;
  saveSettings(): Promise<void>;
}

// ── Inline-Field Tokenizer ────────────────────────────────────────────────

/** Return type for {@link import('./markdown/inline-fields').parseInlineFields}. */
export interface InlineFields {
  fields: Map<string, string>;
  text: string;
}

// ── Habitica Data Shapes ──────────────────────────────────────────────────
export interface HabiticaTag {
  /** UUID of the tag. */
  id: string;
  /** Human-readable display name of the tag. */
  name: string;
}

/**
 * A single checklist (subtask) item attached to a Habitica task. Returned inline on tasks from `GET /api/v3/tasks/user` as the `checklist` array.
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
 * The `tags` array is **not always present** — Habitica omits it for reward tasks and some group tasks. Always guard access with `Array.isArray(task.tags)`.
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
   * Array of tag UUIDs attached to this task. **Optional** — absent for rewards and some group tasks. Always guard with `Array.isArray`.
   */
  tags?: string[];
  /**
   * Checklist (subtask) items attached to this task. **Optional** — absent for tasks without subtasks. Always guard with `Array.isArray`.
   */
  checklist?: HabiticaChecklistItem[];
  /**
   * Task notes / description text. May be `null` (Habitica returns `null` for tasks with no notes). Coerce with `String()` before calling string methods.
   */
  notes?: string | null;
  /**
   * ISO 8601 due date string for to-do tasks. May be absent or contain an invalid date string — always validate.
   */
  date?: string;
  /**
   * ISO 8601 start date for daily tasks. Used by `getNextDailyDueDate` to compute the next valid occurrence. May be absent or invalid — always guard with `isNaN(new Date(...).getTime())`.
   */
  startDate?: string;
  /** Recurrence frequency for daily tasks. */
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /**
   * For `frequency === 'daily'`: the task repeats every N days. Defaults to `1` when absent (every day).
   */
  everyX?: number;
  /**
   * For `frequency === 'weekly'`: a map of weekday keys to their enabled state. Keys: `'su'`, `'m'`, `'t'`, `'w'`, `'th'`, `'f'`, `'s'`.
   */
  repeat?: Record<string, boolean>;
  /**
   * Task difficulty / priority value. - `2` → hard · `1.5` → medium · `1` → easy · `0.1` → trivial
   */
  priority?: number;
  /** For habit tasks: whether the positive (+) scoring direction is enabled. */
  up?: number;
  /** For habit tasks: whether the negative (−) scoring direction is enabled. */
  down?: number;
  /** Current streak counter for daily tasks. Server-managed; diff allows manual correction. */
  streak?: number;
  /** Task attribute (str/int/per/con). Controls which stat the task rewards on completion. */
  attribute?: 'str' | 'int' | 'per' | 'con';
  /** The position of the task within its list. */
  position?: number;
  /** Group / party data for group tasks. */
  group?: { id: string };
}

/**
 * Shared task fields present in both creation ({@link NewTaskInput}) and update ({@link ManagedTaskFields}) paths.
 *
 * Extracted to eliminate the former 12-field duplication across three interfaces — adding a new task field now requires changes in only one place (plus the parser and formatter).
 */
interface BaseTaskFields {
  /** Task title with all inline fields, tags, and markers stripped. */
  text: string;
  /** Habitica priority value (`2`/`1.5`/`1`/`0.1`), or `undefined` to use the server default. */
  priority?: number;
  /** Due date for to-dos (`YYYY-MM-DD`), mapped to the Habitica `date` field. */
  date?: string;
  /** Start date for dailies (`YYYY-MM-DD`), mapped to the Habitica `startDate` field. */
  startDate?: string;
  /** Recurrence frequency. Defaults to `'daily'` for created dailies. */
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Recurrence interval (every N days). Defaults to `1` when absent. */
  everyX?: number;
  /** Weekly repeat days (enabled weekday → `true`). */
  repeat?: Record<string, boolean>;
  /** For habit tasks: whether the positive (+) scoring direction is enabled. */
  up?: number;
  /** For habit tasks: whether the negative (−) scoring direction is enabled. */
  down?: number;
  /** Current streak counter. */
  streak?: number;
  /** Task attribute (str/int/per/con). */
  attribute?: string;
  /** Habitica tag UUIDs resolved from the line's `#tags` via the reverse index. */
  tagIds: string[];
  /** Tag names present on the line that do not yet exist in Habitica and must be created. */
  newTagNames: string[];
  /** Notes parsed from a following `> [!note]` callout, or `undefined`. */
  notes?: string;
  /** Whether the task is checked in markdown */
  completed: boolean;
  /** Checklist items parsed from following nested `  - [ ]` / `  - [x]` lines, with optional `[subId::]` tracking. */
  checklistItems: ChecklistItemParsed[];
}

/**
 * Parsed representation of a hand-written markdown task line to be created in Habitica.
 *
 * Produced by `parseTaskLine` from a `- [ ]` line in the sync file that has no `[id::]`. Tag references are split into already-known `tagIds` and `newTagNames` that must be created via `POST /api/v3/tags` before the task is created.
 */
export interface NewTaskInput extends BaseTaskFields {
  /** Task type inferred from the section heading the line sits under. `undefined` for unknown sections — those tasks should be skipped. */
  type?: HabiticaTask['type'];
}

/**
 * A checklist item parsed from a nested markdown line (`  - [ ]` / `  - [x]`).
 * Used by the shared {@link scanNestedContent} scanner to return structured subtask data.
 */
export interface ChecklistItemParsed {
  /** The checklist item's display text (markers and whitespace stripped). */
  text: string;
  /** Whether the item is checked off in the markdown (`  - [x]`). */
  checked: boolean;
  /** Habitica checklist-item UUID, extracted from `[subId:: uuid]` inline. `undefined` for legacy lines or newly created items not yet written back. */
  subId?: string;
}

/**
 * Parsed representation of a **managed** markdown task line — one that already has an `[id:: ...]` field and therefore maps to an existing Habitica task.
 *
 * Produced by {@link parseManagedTaskLine}. Used by the update pass to diff markdown state against Habitica state and push changes via {@link HabiticaApiClient.updateTask}.
 */
export interface ManagedTaskFields extends BaseTaskFields {
  /** The Habitica task UUID extracted from `[id:: ...]`. */
  id: string;
  /** Whether the task should be deleted from Habitica, parsed from `[delete::]`. */
  delete?: boolean;
}

/**
 * Immutable per-run configuration snapshot. Built once at the start of {@link SyncManager.sync} to prevent mid-sync settings changes from producing inconsistent behavior (the old "Heisenbug").
 */
export interface SyncConfig {
  allowUpdates: boolean;
  disableScoring: boolean;
  disableCreating: boolean;
  enableVaultScan: boolean;
  completionLookbackDays: number;
  outputFolder: string;
  groupId: string;
  TODAY: string;
  cutoffDate: Date;
  filePath: string;
}

/**
 * State threaded through SyncManager's private step methods.
 * Counters live in {@link SyncReport}, task lookups in {@link TaskRegistry},
 * and immutable config in {@link SyncConfig}.
 */
export interface SyncContext {
  config: SyncConfig;
  registry: import('./sync/task-registry').TaskRegistry;
  report: import('./sync/sync-report').SyncReport;
  tagLookup: Record<string, string>;
  scoredIds: Set<string>;
}

/**
 * Shared field-extraction result for {@link parseTaskLine} and {@link parseManagedTaskLine}.
 */
export interface ParsedTaskFields {
  type?: HabiticaTask['type'];
  priority?: number;
  date?: string;
  startDate?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  everyX?: number;
  repeat?: Record<string, boolean>;
  up?: number;
  down?: number;
  streak?: number;
  attribute?: string;
  delete?: boolean;
  completed: boolean;
  tagIds: string[];
  newTagNames: string[];
  text: string;
}
