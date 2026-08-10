import { DataAdapter } from 'obsidian';
import { HabiticaTask, HabiticaTaskType } from '../types/habitica';

export class JsonStore {
    private adapter: DataAdapter;
    private pluginDir: string;

    constructor(adapter: DataAdapter, pluginDir: string) {
        this.adapter = adapter;
        this.pluginDir = pluginDir;
    }

    private getFilePath(type: HabiticaTaskType): string {
        return `${this.pluginDir}/states/state_${type}s.json`;
    }

    /**
     * Loads the JSON state for a specific task type.
     */
    async loadState(type: HabiticaTaskType): Promise<HabiticaTask[]> {
        const filePath = this.getFilePath(type);
        const exists = await this.adapter.exists(filePath);
        if (!exists) {
            return [];
        }
        
        try {
            const content = await this.adapter.read(filePath);
            return JSON.parse(content) as HabiticaTask[];
        } catch (error) {
            console.error(`[Habitica Fullsync] Failed to load ${type} state:`, error);
            return [];
        }
    }

    /**
     * Saves the JSON state for a specific task type.
     */
    async saveState(type: HabiticaTaskType, tasks: HabiticaTask[]): Promise<void> {
        const filePath = this.getFilePath(type);
        const folderPath = `${this.pluginDir}/states`;
        
        try {
            // Ensure folder exists
            const folderExists = await this.adapter.exists(folderPath);
            if (!folderExists) {
                await this.adapter.mkdir(folderPath);
            }

            const content = JSON.stringify(tasks, null, 2);
            await this.adapter.write(filePath, content);
        } catch (error) {
            console.error(`[Habitica Fullsync] Failed to save ${type} state:`, error);
        }
    }

    /**
     * Loads all states into a single record.
     */
    async loadAll(): Promise<Record<HabiticaTaskType, HabiticaTask[]>> {
        const [habits, dailies, todos, rewards] = await Promise.all([
            this.loadState('habit'),
            this.loadState('daily'),
            this.loadState('todo'),
            this.loadState('reward')
        ]);
        
        return {
            habit: habits,
            daily: dailies,
            todo: todos,
            reward: rewards
        };
    }

    /**
     * Saves all states from a record.
     */
    async saveAll(state: Record<HabiticaTaskType, HabiticaTask[]>): Promise<void> {
        await Promise.all([
            this.saveState('habit', state.habit),
            this.saveState('daily', state.daily),
            this.saveState('todo', state.todo),
            this.saveState('reward', state.reward)
        ]);
    }
}
