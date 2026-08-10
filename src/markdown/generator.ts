import { MarkdownState, MarkdownTask } from '../types/markdown';
import { HabiticaTask } from '../types/habitica';

/**
 * Generates the full markdown string from the parsed state.
 */
export function generateMarkdown(state: MarkdownState): string {
    let output = '';

    output += '## Habits\n\n';
    state.habits.forEach(task => output += generateTaskString(task) + '\n\n');

    output += '## Dailies\n\n';
    state.dailies.forEach(task => output += generateTaskString(task) + '\n\n');

    output += '## To-Dos\n\n';
    state.todos.forEach(task => output += generateTaskString(task) + '\n\n');

    output += '## Rewards\n\n';
    state.rewards.forEach(task => output += generateTaskString(task) + '\n\n');

    return output.trim();
}

/**
 * Converts a HabiticaTask (from API) into a MarkdownTask (for rendering).
 */
export function habiticaTaskToMarkdownTask(apiTask: HabiticaTask): MarkdownTask {
    const mdTask: MarkdownTask = {
        id: apiTask._id || apiTask.id,
        text: apiTask.text,
        completed: apiTask.completed || false,
        type: apiTask.type,
        tags: apiTask.tags || [],
        notes: apiTask.notes,
        rawInlineFields: {}
    };

    if (apiTask.checklist) {
        mdTask.checklist = apiTask.checklist.map(item => ({
            id: item.id,
            text: item.text,
            completed: item.completed
        }));
    }

    if (apiTask.priority) mdTask.priority = apiTask.priority;
    if (apiTask.attribute) mdTask.attribute = apiTask.attribute;
    
    if (apiTask.type === 'daily') {
        if (apiTask.frequency) mdTask.frequency = apiTask.frequency;
    }
    
    if (apiTask.type === 'todo') {
        if (apiTask.date) mdTask.due = apiTask.date;
    }
    
    if (apiTask.type === 'habit') {
        if (apiTask.up !== undefined) mdTask.up = apiTask.up;
        if (apiTask.down !== undefined) mdTask.down = apiTask.down;
    }
    
    if (apiTask.type === 'reward') {
        if (apiTask.value) mdTask.value = apiTask.value;
    }

    return mdTask;
}

function generateTaskString(task: MarkdownTask): string {
    const checkbox = task.completed ? '[x]' : '[ ]';
    
    // Base title
    let text = `- ${checkbox} ${task.text}`;
    
    // Type Tag (always present)
    const allTags = [...task.tags];
    if (!allTags.includes(task.type)) {
        allTags.push(task.type);
    }
    
    // Append tags
    const tagsString = allTags.map(t => `#${t}`).join(' ');
    if (tagsString) {
        text += ` ${tagsString}`;
    }

    let body = '';

    // Notes Blockquote
    if (task.notes && task.notes.trim()) {
        body += `  > [!note]\n`;
        const noteLines = task.notes.split('\n');
        noteLines.forEach(line => {
            body += `  > ${line.trim()}\n`;
        });
    }

    // Checklists
    if (task.checklist && task.checklist.length > 0) {
        task.checklist.forEach(item => {
            const itemCheckbox = item.completed ? '[x]' : '[ ]';
            body += `  + ${itemCheckbox} ${item.text}\n`;
        });
    }

    // Bottom Inline Fields
    let inlineFields = '';
    if (task.id) inlineFields += `[id:: ${task.id}] `;
    
    // Priority logic
    if (task.priority) {
        let priorityStr = 'medium';
        if (task.priority === 0.1) priorityStr = 'trivial';
        if (task.priority === 1) priorityStr = 'low';
        if (task.priority === 1.5) priorityStr = 'medium';
        if (task.priority === 2) priorityStr = 'high';
        inlineFields += `[priority:: ${priorityStr}] `;
    }

    if (task.attribute) inlineFields += `[attribute:: ${task.attribute}] `;
    
    if (task.type === 'daily' && task.frequency) inlineFields += `[frequency:: ${task.frequency}] `;
    if (task.type === 'todo' && task.due) inlineFields += `[due:: ${task.due}] `;
    if (task.type === 'habit') {
        if (task.up !== undefined) inlineFields += `[up:: ${task.up}] `;
        if (task.down !== undefined) inlineFields += `[down:: ${task.down}] `;
    }
    if (task.type === 'reward' && task.value) {
        inlineFields += `[value:: ${task.value}] `;
    }

    if (inlineFields.trim()) {
        body += `\n  ${inlineFields.trim()}\n`;
    }

    if (body) {
        text += '\n' + body;
    }

    return text.trimEnd();
}
