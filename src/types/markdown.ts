import { HabiticaTaskType, HabiticaPriority, HabiticaFrequency, HabiticaAttribute } from './habitica';

/**
 * Represents a parsed checklist item from the markdown.
 */
export interface MarkdownChecklistItem {
    /** May be undefined if it's a newly created item in markdown */
    id?: string;
    /** Text content of the checklist item */
    text: string;
    /** Completion status of the item */
    completed: boolean;
}

/**
 * Represents a parsed task from the markdown.
 */
export interface MarkdownTask {
    /** The Habitica ID of the task, if it exists */
    id?: string;
    /** Title of the task */
    text: string;
    /** Completion status */
    completed: boolean;
    /** The kind of task */
    type: HabiticaTaskType;
    /** Array of tag UUIDs */
    tags: string[];
    /** Parsed from `> [!note]` blockquote */
    notes?: string;
    
    /** Embedded checklist items */
    checklist?: MarkdownChecklistItem[];
    
    // Inline fields parsed from the bottom of the block
    /** Difficulty priority for the task */
    priority?: HabiticaPriority;
    /** Attribute associated with this task */
    attribute?: HabiticaAttribute;
    
    // Dailies
    /** Daily frequency */
    frequency?: HabiticaFrequency;
    /** Maps to `date` on Todos (due date) */
    due?: string;
    
    // Habits
    /** Can this habit be clicked up? */
    up?: boolean;
    /** Can this habit be clicked down? */
    down?: boolean;

    // Rewards
    /** The value (gold cost) of the reward */
    value?: number;
    
    /** Catch-all for any other inline fields the user might add manually */
    rawInlineFields: Record<string, string>;
}

/**
 * Represents the entire state parsed from a markdown file.
 */
export interface MarkdownState {
    /** Parsed habits */
    habits: MarkdownTask[];
    /** Parsed dailies */
    dailies: MarkdownTask[];
    /** Parsed todos */
    todos: MarkdownTask[];
    /** Parsed rewards */
    rewards: MarkdownTask[];
}

export type ConflictResolution = 'markdown' | 'api' | 'skip';

export type ConflictResolver = (localTask: MarkdownTask, remoteTask: import('./habitica').HabiticaTask) => Promise<ConflictResolution>;
