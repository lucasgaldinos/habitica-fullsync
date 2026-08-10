import { requestUrl, RequestUrlParam } from 'obsidian';
import { HabiticaTask, HabiticaCredentials, HabiticaResponse } from '../types/habitica';

/**
 * Handles communication with the Habitica API v3.
 */
export class HabiticaApiClient {
    private baseUrl = 'https://habitica.com/api/v3';
    private clientId = 'bfb65555-5517-47b6-acb5-31215b3c3c13-obsidian-habitica-fullsync'; // Required by Habitica API guidelines

    /**
     * Initializes a new instance of the API client.
     * @param credentials The user ID and API token.
     */
    constructor(private credentials: HabiticaCredentials) {}

    /**
     * Generates the required authentication and client headers.
     * @returns A record of HTTP headers.
     */
    private getHeaders(): Record<string, string> {
        return {
            'x-client': this.clientId,
            'x-api-user': this.credentials.userId,
            'x-api-key': this.credentials.apiToken,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Internal method to dispatch requests using Obsidian's requestUrl.
     * @param method The HTTP method.
     * @param endpoint The API endpoint (relative to v3).
     * @param body Optional JSON body.
     * @returns The raw HabiticaResponse.
     */
    private async request<T>(method: string, endpoint: string, body?: unknown): Promise<HabiticaResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const params: RequestUrlParam = {
            url,
            method,
            headers: this.getHeaders()
        };

        if (body) {
            params.body = JSON.stringify(body);
        }

        try {
            const response = await requestUrl(params);
            
            if (response.status >= 400) {
                console.error(`[Habitica API Error] ${method} ${url}`, response.json);
                throw new Error(`Habitica API returned status ${response.status}`);
            }

            return response.json as HabiticaResponse<T>;
        } catch (error) {
            console.error(`[Habitica API Exception]`, error);
            throw error;
        }
    }

    // --- Task Endpoints ---

    /**
     * Fetches all tasks for the authenticated user.
     * @returns An array of HabiticaTask objects.
     */
    async fetchAllTasks(): Promise<HabiticaTask[]> {
        const response = await this.request<HabiticaTask[]>('GET', '/tasks/user');
        return response.data;
    }

    /**
     * Creates a new task in Habitica.
     * @param taskData Partial task payload.
     * @returns The created HabiticaTask.
     */
    async createTask(taskData: Partial<HabiticaTask>): Promise<HabiticaTask> {
        const response = await this.request<HabiticaTask>('POST', '/tasks/user', taskData);
        return response.data;
    }

    /**
     * Updates an existing task in Habitica.
     * @param taskId The UUID of the task.
     * @param updates The fields to update.
     * @returns The updated HabiticaTask.
     */
    async updateTask(taskId: string, updates: Partial<HabiticaTask>): Promise<HabiticaTask> {
        const response = await this.request<HabiticaTask>('PUT', `/tasks/${taskId}`, updates);
        return response.data;
    }

    /**
     * Deletes a task from Habitica.
     * @param taskId The UUID of the task.
     */
    async deleteTask(taskId: string): Promise<void> {
        await this.request<void>('DELETE', `/tasks/${taskId}`);
    }

    /**
     * Scores a task (e.g. checking off a daily, or pressing + on a habit).
     * @param taskId The UUID of the task.
     * @param direction 'up' or 'down'.
     * @returns The updated task state or rewards.
     */
    async scoreTask(taskId: string, direction: 'up' | 'down'): Promise<unknown> {
        const response = await this.request<unknown>('POST', `/tasks/${taskId}/score/${direction}`);
        return response.data;
    }

    // --- Checklist Endpoints ---

    /**
     * Adds a checklist item to an existing task.
     * @param taskId The UUID of the task.
     * @param text The text for the new checklist item.
     * @returns The created checklist item data.
     */
    async addChecklistItem(taskId: string, text: string): Promise<unknown> {
        const response = await this.request<unknown>('POST', `/tasks/${taskId}/checklist`, { text });
        return response.data;
    }

    /**
     * Updates the text of an existing checklist item.
     * @param taskId The UUID of the parent task.
     * @param itemId The UUID of the checklist item.
     * @param text The new text.
     * @returns The updated checklist item data.
     */
    async updateChecklistItem(taskId: string, itemId: string, text: string): Promise<unknown> {
        const response = await this.request<unknown>('PUT', `/tasks/${taskId}/checklist/${itemId}`, { text });
        return response.data;
    }

    /**
     * Scores (toggles) a checklist item.
     * @param taskId The UUID of the parent task.
     * @param itemId The UUID of the checklist item.
     * @returns The updated state of the checklist item.
     */
    async scoreChecklistItem(taskId: string, itemId: string): Promise<unknown> {
        const response = await this.request<unknown>('POST', `/tasks/${taskId}/checklist/${itemId}/score`);
        return response.data;
    }

    /**
     * Deletes a checklist item.
     * @param taskId The UUID of the parent task.
     * @param itemId The UUID of the checklist item.
     */
    async deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
        await this.request<void>('DELETE', `/tasks/${taskId}/checklist/${itemId}`);
    }
}
