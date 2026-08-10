import { Vault, TFile } from 'obsidian';
import { JsonStore } from '../store/json-store';
import { HabiticaApiClient } from '../api/client';
import { ActionQueue } from '../api/queue';
import { DiffEngine } from './diff-engine';
import { ConflictResolver } from '../types/markdown';
import { parseMarkdown } from '../markdown/parser';
import { generateMarkdown } from '../markdown/generator';
import { HabiticaTask } from '../types/habitica';
import { MarkdownState } from '../types/markdown';

export class SyncManager {
    private jsonStore: JsonStore;
    private apiClient: HabiticaApiClient;
    private queue: ActionQueue;
    private diffEngine: DiffEngine;

    constructor(
        private vault: Vault,
        pluginDir: string,
        apiClient: HabiticaApiClient,
        onConflict: ConflictResolver
    ) {
        this.jsonStore = new JsonStore(vault.adapter, pluginDir);
        this.apiClient = apiClient;
        this.queue = new ActionQueue();
        this.diffEngine = new DiffEngine(this.apiClient, this.queue, onConflict);
    }

    /**
     * Executes the full ETL sync process.
     */
    async sync(markdownFile: TFile): Promise<void> {
        // 1. Fetch Remote State
        const remoteTasksList = await this.apiClient.fetchAllTasks();
        const remoteState: Record<string, HabiticaTask> = {};
        for (const task of remoteTasksList) {
            remoteState[task._id || task.id] = task;
        }

        // 2. Fetch Local JSON State
        const localStateObj = await this.jsonStore.loadAll();
        const localState: Record<string, HabiticaTask> = {};
        for (const list of Object.values(localStateObj)) {
            for (const task of list) {
                localState[task._id || task.id] = task;
            }
        }

        // 3. Read & Parse Markdown
        const content = await this.vault.read(markdownFile);
        const parsedMdState = parseMarkdown(content);

        // 4. Resolve states per type
        const resolvedHabits = await this.diffEngine.resolve(
            localState, remoteState, parsedMdState.habits
        );
        const resolvedDailies = await this.diffEngine.resolve(
            localState, remoteState, parsedMdState.dailies
        );
        const resolvedTodos = await this.diffEngine.resolve(
            localState, remoteState, parsedMdState.todos
        );
        const resolvedRewards = await this.diffEngine.resolve(
            localState, remoteState, parsedMdState.rewards
        );

        // 5. Save back to Local JSON
        const updatedLocalJsonObj = {
            habit: Object.values(resolvedHabits.updatedRemoteState).filter(t => t.type === 'habit'),
            daily: Object.values(resolvedDailies.updatedRemoteState).filter(t => t.type === 'daily'),
            todo: Object.values(resolvedTodos.updatedRemoteState).filter(t => t.type === 'todo'),
            reward: Object.values(resolvedRewards.updatedRemoteState).filter(t => t.type === 'reward'),
        };
        await this.jsonStore.saveAll(updatedLocalJsonObj);

        // 6. Generate and Save Markdown
        const finalMdState: MarkdownState = {
            habits: resolvedHabits.finalizedMarkdownTasks,
            dailies: resolvedDailies.finalizedMarkdownTasks,
            todos: resolvedTodos.finalizedMarkdownTasks,
            rewards: resolvedRewards.finalizedMarkdownTasks
        };
        const newMarkdown = generateMarkdown(finalMdState);
        await this.vault.modify(markdownFile, newMarkdown);

        // Sync completed successfully.
    }
}
