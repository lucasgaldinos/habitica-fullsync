import { MarkdownState, MarkdownTask } from '../types/markdown';
import { HabiticaTaskType, HabiticaPriority, HabiticaFrequency, HabiticaAttribute } from '../types/habitica';

/**
 * Parses the raw content of the Habitica sync markdown file.
 */
export function parseMarkdown(content: string): MarkdownState {
    const state: MarkdownState = {
        habits: [],
        dailies: [],
        todos: [],
        rewards: []
    };

    // Split by newlines followed by "- [ ]" or "- [x]" or "* [ ]" or "* [x]"
    // Prepend a newline to make sure the first item splits correctly if it's at the very start
    const safeContent = '\n' + content.replace(/\r\n/g, '\n');
    const blocks = safeContent.split(/\n(?=(?:-|\*) \[[ xX]\] )/);

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed.startsWith('- [') && !trimmed.startsWith('* [')) continue;

        // The first line is the title, the rest is the body
        const lines = trimmed.split('\n');
        const firstLine = lines.shift()!;
        const bodyLines = lines.join('\n');

        const match = /^(?:-|\*) \[([ xX])\] (.*)$/.exec(firstLine);
        if (!match) continue;

        const completed = match[1].toLowerCase() === 'x';
        const titleLine = match[2];

        // Extract tags and text from title line
        const { text, tags, type } = parseTitleLine(titleLine);
        
        if (!type) continue; // Not a valid habitica task type

        const task = parseTaskBody(text, completed, type, tags, bodyLines);

        switch (type) {
            case 'habit': state.habits.push(task); break;
            case 'daily': state.dailies.push(task); break;
            case 'todo': state.todos.push(task); break;
            case 'reward': state.rewards.push(task); break;
        }
    }

    return state;
}

function parseTitleLine(titleLine: string): { text: string, tags: string[], type: HabiticaTaskType | null } {
    const tagsRegex = /#([\w-]+)/g;
    const tags: string[] = [];
    let type: HabiticaTaskType | null = null;
    
    let match;
    while ((match = tagsRegex.exec(titleLine)) !== null) {
        const tag = match[1].toLowerCase();
        tags.push(tag);
        
        if (['habit', 'daily', 'todo', 'reward'].includes(tag)) {
            type = tag as HabiticaTaskType;
        }
    }

    const text = titleLine.replace(tagsRegex, '').trim();
    return { text, tags, type };
}

function parseTaskBody(text: string, completed: boolean, type: HabiticaTaskType, tags: string[], bodyLines: string): MarkdownTask {
    const task: MarkdownTask = {
        text,
        completed,
        type,
        tags,
        rawInlineFields: {}
    };

    const lines = bodyLines.split('\n');
    let inNote = false;
    let notes: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        
        if (!trimmed) continue;

        // Parse Note Blockquote
        if (trimmed.toLowerCase().startsWith('> [!note]')) {
            inNote = true;
            continue;
        }
        
        if (inNote) {
            if (trimmed.startsWith('>')) {
                notes.push(trimmed.substring(1).trim());
                continue;
            } else {
                inNote = false; // Exited the note block
            }
        }

        // Parse Checklists (usually indented with + [ ] or - [ ])
        const checklistMatch = /^(?:[+\-*]) \[([ xX])\] (.*)$/.exec(trimmed);
        if (checklistMatch) {
            if (!task.checklist) task.checklist = [];
            task.checklist.push({
                completed: checklistMatch[1].toLowerCase() === 'x',
                text: checklistMatch[2].trim()
            });
            continue;
        }

        // Parse Inline Fields [key:: value]
        const inlineFieldRegex = /\[(\w+)::\s*([^\]]+)\]/g;
        let fieldMatch;
        while ((fieldMatch = inlineFieldRegex.exec(line)) !== null) {
            const key = fieldMatch[1];
            const value = fieldMatch[2].trim();
            task.rawInlineFields[key] = value;
            mapInlineFieldToTask(task, key, value);
        }
    }

    if (notes.length > 0) {
        task.notes = notes.join('\n');
    }

    return task;
}

function mapInlineFieldToTask(task: MarkdownTask, key: string, value: string) {
    if (key === 'id') task.id = value;
    if (key === 'priority') {
        const val = value.toLowerCase();
        if (val === 'trivial') task.priority = 0.1;
        else if (val === 'easy' || val === 'low') task.priority = 1;
        else if (val === 'medium') task.priority = 1.5;
        else if (val === 'hard' || val === 'high') task.priority = 2;
        else {
            const num = parseFloat(val);
            if (!isNaN(num)) task.priority = num as HabiticaPriority;
        }
    }
    if (key === 'due' || key === 'date') task.due = value;
    if (key === 'frequency') task.frequency = value as HabiticaFrequency;
    if (key === 'up') task.up = value === 'true';
    if (key === 'down') task.down = value === 'true';
    if (key === 'value') task.value = parseFloat(value);
    if (key === 'attribute') task.attribute = value as HabiticaAttribute;
}
