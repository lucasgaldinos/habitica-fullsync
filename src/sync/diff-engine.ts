import { HabiticaTask } from '../types/habitica';
import { MarkdownTask, ConflictResolver } from '../types/markdown';
import { HabiticaApiClient } from '../api/client';
import { ActionQueue } from '../api/queue';

export class DiffEngine {
    constructor(
        private apiClient: HabiticaApiClient,
        private queue: ActionQueue,
        private onConflict: ConflictResolver
    ) {}

    /**
     * Determines if the local markdown task is different from the JSON state task.
     * Checks updatable fields.
     */
    private hasMarkdownChanged(localJson: HabiticaTask, mdTask: MarkdownTask): boolean {
        if (localJson.text !== mdTask.text) return true;
        if (localJson.completed !== mdTask.completed) return true;
        if (localJson.notes !== mdTask.notes) return true;
        if (localJson.priority !== mdTask.priority) return true;
        if (localJson.attribute !== mdTask.attribute) return true;

        if (localJson.type === 'daily') {
            if (localJson.frequency !== mdTask.frequency) return true;
        }

        if (localJson.type === 'todo') {
            if (localJson.date !== mdTask.due) return true;
        }

        if (localJson.type === 'habit') {
            if (localJson.up !== mdTask.up) return true;
            if (localJson.down !== mdTask.down) return true;
        }

        if (localJson.type === 'reward') {
            if (localJson.value !== mdTask.value) return true;
        }

        // Compare checklist items
        if (localJson.checklist && mdTask.checklist) {
            if (localJson.checklist.length !== mdTask.checklist.length) return true;
            for (let i = 0; i < localJson.checklist.length; i++) {
                if (localJson.checklist[i].text !== mdTask.checklist[i].text) return true;
                if (localJson.checklist[i].completed !== mdTask.checklist[i].completed) return true;
            }
        }

        return false;
    }

    /**
     * Resolves differences between Local JSON, Remote API, and Local Markdown.
     * Returns the finalized lists of Markdown Tasks to be written back to the file,
     * and the finalized API tasks to be written back to the JSON state.
     */
    async resolve(
        localState: Record<string, HabiticaTask>, 
        remoteState: Record<string, HabiticaTask>, 
        markdownTasks: MarkdownTask[]
    ): Promise<{ updatedRemoteState: Record<string, HabiticaTask>, finalizedMarkdownTasks: MarkdownTask[] }> {
        
        const updatedRemoteState = { ...remoteState };
        const finalizedMarkdownTasks: MarkdownTask[] = [];

        // 1. Process all tasks found in the Markdown
        for (const mdTask of markdownTasks) {
            const isDeleted = mdTask.rawInlineFields['delete'] === 'true' || mdTask.rawInlineFields['status'] === 'delete';
            
            if (isDeleted && mdTask.id) {
                // User intentionally deleted this task
                if (remoteState[mdTask.id]) {
                    await this.queue.enqueue(() => this.apiClient.deleteTask(mdTask.id!));
                    delete updatedRemoteState[mdTask.id];
                }
                // Skip adding to finalizedMarkdownTasks
                continue;
            }

            if (!mdTask.id) {
                // New task created in Markdown
                const created = await this.queue.enqueue(() => this.apiClient.createTask({
                    text: mdTask.text,
                    type: mdTask.type,
                    notes: mdTask.notes,
                    priority: mdTask.priority,
                    attribute: mdTask.attribute,
                    date: mdTask.due,
                    value: mdTask.value
                }));
                updatedRemoteState[created.id] = created;
                // Add the id to the markdown task so it saves correctly
                mdTask.id = created.id;
                finalizedMarkdownTasks.push(mdTask);
                continue;
            }

            const localJson = localState[mdTask.id];
            const remoteJson = remoteState[mdTask.id];

            if (!localJson && remoteJson) {
                // Edge Case: Task was missing from JSON but exists remotely and in MD.
                // Treat it as out-of-sync local JSON, use remote.
                finalizedMarkdownTasks.push(mdTask);
                continue;
            }

            if (localJson && remoteJson) {
                const apiChanged = localJson.updatedAt !== remoteJson.updatedAt;
                const mdChanged = this.hasMarkdownChanged(localJson, mdTask);

                if (apiChanged && mdChanged) {
                    // Conflict!
                    const resolution = await this.onConflict(mdTask, remoteJson);
                    if (resolution === 'markdown') {
                        await this.pushMarkdownUpdates(mdTask, remoteJson);
                        finalizedMarkdownTasks.push(mdTask);
                        // The next API fetch will get the updated 'updatedAt', we can just leave remoteState as is for now
                        // or optimistically update it. For safety, just let next sync catch it.
                    } else if (resolution === 'api') {
                        finalizedMarkdownTasks.push(this.apiToMarkdown(remoteJson, mdTask));
                    } else {
                        // skip
                        finalizedMarkdownTasks.push(mdTask);
                    }
                } else if (apiChanged && !mdChanged) {
                    // API changed, update Markdown
                    finalizedMarkdownTasks.push(this.apiToMarkdown(remoteJson, mdTask));
                } else if (!apiChanged && mdChanged) {
                    // Markdown changed, push to API
                    await this.pushMarkdownUpdates(mdTask, remoteJson);
                    finalizedMarkdownTasks.push(mdTask);
                } else {
                    // Neither changed
                    finalizedMarkdownTasks.push(mdTask);
                }
            } else if (localJson && !remoteJson) {
                // Task was deleted remotely. Remove from markdown.
                // By not pushing it to `finalizedMarkdownTasks`, we delete it.
            }
        }

        // 2. Process tasks deleted in Markdown
        // (Removed: We now require explicit [delete:: true] to delete tasks on the API)
        const mdTaskIds = new Set(markdownTasks.map(t => t.id).filter(id => id !== undefined));

        // 3. Process remote tasks not present in markdown
        // This includes new tasks from API, AND tasks accidentally deleted from markdown.
        for (const [id, remoteJson] of Object.entries(remoteState)) {
            if (!mdTaskIds.has(id) && updatedRemoteState[id]) { // check updatedRemoteState in case it was explicitly deleted in step 1
                // Recreate in Markdown
                finalizedMarkdownTasks.push(this.apiToMarkdown(remoteJson));
            }
        }

        return { updatedRemoteState, finalizedMarkdownTasks };
    }

    private async pushMarkdownUpdates(mdTask: MarkdownTask, remoteJson: HabiticaTask) {
        // If checkbox was toggled
        if (mdTask.completed !== remoteJson.completed && mdTask.type !== 'reward') {
            await this.queue.enqueue(() => this.apiClient.scoreTask(mdTask.id!, mdTask.completed ? 'up' : 'down'));
        }

        // Push standard fields
        const updates: Partial<HabiticaTask> = {
            text: mdTask.text,
            notes: mdTask.notes,
            priority: mdTask.priority,
            attribute: mdTask.attribute,
        };
        
        if (mdTask.type === 'daily' && mdTask.frequency) updates.frequency = mdTask.frequency;
        if (mdTask.type === 'todo' && mdTask.due) updates.date = mdTask.due;
        if (mdTask.type === 'reward' && mdTask.value) updates.value = mdTask.value;

        await this.queue.enqueue(() => this.apiClient.updateTask(mdTask.id!, updates));
    }

    private apiToMarkdown(apiTask: HabiticaTask, existingMdTask?: MarkdownTask): MarkdownTask {
        const mdTask: MarkdownTask = {
            id: apiTask.id,
            text: apiTask.text,
            completed: apiTask.completed || false,
            type: apiTask.type,
            tags: apiTask.tags || [],
            notes: apiTask.notes,
            rawInlineFields: existingMdTask ? existingMdTask.rawInlineFields : {}
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
        
        if (apiTask.type === 'daily' && apiTask.frequency) mdTask.frequency = apiTask.frequency;
        if (apiTask.type === 'todo' && apiTask.date) mdTask.due = apiTask.date;
        if (apiTask.type === 'habit') {
            if (apiTask.up !== undefined) mdTask.up = apiTask.up;
            if (apiTask.down !== undefined) mdTask.down = apiTask.down;
        }
        if (apiTask.type === 'reward' && apiTask.value) mdTask.value = apiTask.value;

        return mdTask;
    }
}
