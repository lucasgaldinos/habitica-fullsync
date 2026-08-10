/** The type of a Habitica task */
export type HabiticaTaskType = 'habit' | 'daily' | 'todo' | 'reward';
/** An attribute that a task can be associated with for stat gains */
export type HabiticaAttribute = 'str' | 'int' | 'per' | 'con';
/** How often a daily task repeats */
export type HabiticaFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
/** Difficulty priority for a task */
export type HabiticaPriority = 0.1 | 1 | 1.5 | 2;

/** Which platforms run auto-sync */
export type AutoSyncPlatform = 'both' | 'desktop' | 'mobile';

/**
 * Global settings for the Habitica Full Sync plugin.
 */
export interface HabiticaSyncSettings {
    /** The Habitica API User ID */
    userId: string;
    /** The Obsidian SecretStorage key where the token is securely stored */
    apiTokenSecretName: string;
    /** The markdown file where tasks will be synced. */
    syncFilePath: string;
    /** Optional group ID for shared tasks */
    groupId?: string;
    /** Enable periodic automatic sync */
    autoSync?: boolean;
    /** Which devices run auto-sync */
    autoSyncPlatform?: AutoSyncPlatform;
    /** Auto-sync interval in minutes */
    syncInterval?: number;
    /** Whether to disable scoring tasks (read-only mode) */
    disableScoring?: boolean;
    /** Whether to disable creating new tasks from markdown */
    disableCreating?: boolean;
    /** Scan all markdown files for completed tasks */
    enableVaultScan?: boolean;
    /** How many days back to look for recently completed tasks */
    completionLookbackDays?: number;
}

export const DEFAULT_SETTINGS: HabiticaSyncSettings = {
    userId: '',
    apiTokenSecretName: '',
    syncFilePath: 'Habitica/Sync.md',
    groupId: '',
    autoSync: false,
    autoSyncPlatform: 'both',
    syncInterval: 30,
    disableScoring: false,
    disableCreating: false,
    enableVaultScan: false,
    completionLookbackDays: 4
};

export interface IPluginSettingsHost {
    pluginSettings: HabiticaSyncSettings;
    saveSettings(): Promise<void>;
}

/** Represents an item within a task checklist */
export interface HabiticaChecklistItem {
    /** UUID of the checklist item */
    id: string;
    /** Text content */
    text: string;
    /** Completion status */
    completed: boolean;
}

/** Represents a full task object from the Habitica API */
export interface HabiticaTask {
    /** UUID of the task (from Habitica API) */
    _id: string;
    /** Alias for _id used by Habitica */
    id: string;
    /** Title of the task */
    text: string;
    /** The kind of task */
    type: HabiticaTaskType;
    /** Markdown notes associated with the task */
    notes?: string;
    /** Array of tag UUIDs */
    tags?: string[];
    /** The value (gold cost/reward or internal counter) */
    value?: number;
    /** Task difficulty (trivial, easy, medium, hard) */
    priority?: HabiticaPriority;
    /** Attribute associated with this task */
    attribute?: HabiticaAttribute;
    
    // Checklist
    /** Array of checklist items */
    checklist?: HabiticaChecklistItem[];
    /** Whether the checklist is collapsed in the UI */
    collapseChecklist?: boolean;
    
    // Dates/Tracking
    /** ISO date string of creation */
    createdAt?: string;
    /** ISO date string of last update */
    updatedAt?: string;
    /** For todos: whether it is completed */
    completed?: boolean;

    // Daily Specific
    /** Daily frequency */
    frequency?: HabiticaFrequency;
    /** Days to repeat on */
    repeat?: Record<string, boolean>; // { "su": true, "m": false, ... }
    /** Repeat every X days/weeks/months */
    everyX?: number;
    /** Current streak */
    streak?: number;
    /** Days of month to repeat */
    daysOfMonth?: number[];
    /** Weeks of month to repeat */
    weeksOfMonth?: number[];
    /** ISO date string when daily starts */
    startDate?: string;
    
    // Todo Specific
    /** Due date for a todo */
    date?: string; 

    // Habit Specific
    /** Can this habit be clicked up? */
    up?: boolean;
    /** Can this habit be clicked down? */
    down?: boolean;
    /** Number of up clicks */
    counterUp?: number;
    /** Number of down clicks */
    counterDown?: number;

    // Read-only/Computed
    /** Internal flag used by Habitica */
    byHabitica?: boolean;
    /** Task history */
    history?: unknown[];
}

export interface HabiticaCredentials {
    userId: string;
    apiToken: string;
}

export interface HabiticaResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    message?: string;
}
