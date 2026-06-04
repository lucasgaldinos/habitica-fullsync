import { HabiticaTag, HabiticaTask } from './types';

/**
 * Thin HTTP client for the Habitica v3 REST API.
 *
 * Responsibilities:
 * - Attaches required authentication headers (`x-api-user`, `x-api-key`, `x-client`).
 * - Handles HTTP 429 (rate limited) responses with exponential backoff via {@link rateLimitedFetch}.
 * - Validates every response via {@link _parseResponse} — checks `res.ok`, JSON parseability,
 *   and the Habitica-specific `json.success` flag — before returning `json.data`.
 */
export class HabiticaApiClient {
  private apiUser: string;
  private apiToken: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  /**
   * @param apiUser  Habitica account user ID (UUID). Sent as `x-api-user` header.
   * @param apiToken Habitica API token. Sent as `x-api-key` header.
   */
  constructor(apiUser: string, apiToken: string) {
    this.apiUser = apiUser;
    this.apiToken = apiToken;
    this.baseUrl = 'https://habitica.com/api/v3';
    this.headers = {
      'x-api-user': apiUser,
      'x-api-key': apiToken,
      'x-client': 'habitica-fullsync-js',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Wraps `fetch` with automatic retry on HTTP 429 (rate limited) using exponential backoff.
   *
   * On a 429 response, reads the `X-RateLimit-Reset` header (seconds until reset) and waits
   * that long before retrying. If the header is absent, falls back to the current `delay`.
   * `delay` doubles after each 429.
   *
   * @param url     Absolute URL to request.
   * @param options Standard `RequestInit` options forwarded to `fetch`.
   * @param retries Maximum total attempts before giving up. Defaults to `3`.
   * @param delay   Initial backoff in milliseconds, doubles on each 429. Defaults to `1000`.
   * @returns The raw `Response` for the first non-429 reply.
   * @throws {Error} When all retries are exhausted.
   */
  async rateLimitedFetch(url: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      const res = await fetch(url, options);
      if (res.status === 429) {
        const resetHeader = res.headers.get('X-RateLimit-Reset');
        const resetParsed = resetHeader ? parseInt(resetHeader, 10) : NaN;
        const reset = Number.isFinite(resetParsed) ? resetParsed : Math.ceil(delay / 1000);
        await new Promise(resolve => setTimeout(resolve, reset * 1000));
        delay *= 2;
        continue;
      }
      return res;
    }
    throw new Error('Max retries reached for ' + url);
  }

  /**
   * Validates an API `Response` and extracts the `data` payload from the Habitica envelope.
   *
   * Checks in order:
   * 1. `res.ok` — throws on any non-2xx HTTP status, including up to 200 chars of the body.
   * 2. JSON parseability — throws if `res.json()` rejects.
   * 3. `json.success === false` — throws with `json.message` on application-level errors.
   *
   * @param res     The raw `Response` from {@link rateLimitedFetch}.
   * @param context Human-readable label in error messages (e.g. `'fetchUserTasks'`).
   * @returns `json.data` cast to `T`.
   * @throws {Error} On HTTP error, parse failure, or Habitica application error.
   */
  private async _parseResponse<T>(res: Response, context: string): Promise<T> {
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch (_) {}
      throw new Error(`Habitica API error [${context}]: HTTP ${res.status} — ${body.slice(0, 200)}`);
    }
    let json: { success: boolean; data: T; message?: string };
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`Habitica API error [${context}]: invalid JSON response`);
    }
    if (json.success === false) {
      throw new Error(`Habitica API error [${context}]: ${json.message || 'unknown error'}`);
    }
    return json.data;
  }

  /**
   * Fetches all tasks belonging to the authenticated user.
   * Calls `GET /api/v3/tasks/user`.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchUserTasks(): Promise<HabiticaTask[]> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/user`, { headers: this.headers });
    return this._parseResponse<HabiticaTask[]>(res, 'fetchUserTasks');
  }

  /**
   * Fetches all tags belonging to the authenticated user.
   * Calls `GET /api/v3/tags`. Used to build a tag-lookup map (`id → name`) for task formatting.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchTags(): Promise<HabiticaTag[]> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tags`, { headers: this.headers });
    return this._parseResponse<HabiticaTag[]>(res, 'fetchTags');
  }

  /**
   * Fetches all tasks belonging to a Habitica group (party or guild).
   * Calls `GET /api/v3/tasks/group/:groupId`.
   * @param groupId UUID of the Habitica group.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchGroupTasks(groupId: string): Promise<HabiticaTask[]> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/group/${groupId}`, { headers: this.headers });
    return this._parseResponse<HabiticaTask[]>(res, 'fetchGroupTasks');
  }

  /**
   * Creates a new task in Habitica.
   * Calls `POST /api/v3/tasks/user`. Only fields present in `input` are sent.
   *
   * @param input Task fields. `text` and `type` are required; `priority`, `date`,
   *              `startDate`, `frequency`, `tags`, and `notes` are optional. Habits default
   *              to `up: true` / `down: false`.
   * @returns The newly created task, including the server-assigned `id`.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async createTask(input: {
    text: string;
    type: HabiticaTask['type'];
    priority?: number;
    date?: string;
    startDate?: string;
    frequency?: 'daily';
    tags?: string[];
    notes?: string;
  }): Promise<HabiticaTask> {
    const body: Record<string, unknown> = { text: input.text, type: input.type };
    if (input.notes) body.notes = input.notes;
    else body.notes = 'Created from Obsidian';
    if (typeof input.priority === 'number') body.priority = input.priority;
    if (input.date) body.date = input.date;
    if (input.startDate) body.startDate = input.startDate;
    if (input.frequency) body.frequency = input.frequency;
    if (Array.isArray(input.tags) && input.tags.length) body.tags = input.tags;
    if (input.type === 'habit') { body.up = true; body.down = false; }
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/user`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });
    return this._parseResponse<HabiticaTask>(res, 'createTask');
  }

  /**
   * Creates a new tag in Habitica.
   * Calls `POST /api/v3/tags`.
   * @param name Display name of the tag.
   * @returns The newly created tag, including the server-assigned `id`.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async createTag(name: string): Promise<HabiticaTag> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tags`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name })
    });
    return this._parseResponse<HabiticaTag>(res, 'createTag');
  }

  /**
   * Adds a checklist (subtask) item to an existing task.
   * Calls `POST /api/v3/tasks/:taskId/checklist`.
   * @param taskId UUID of the parent task.
   * @param text   Display text of the checklist item.
   * @returns The updated parent task, including the full `checklist` array.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async addChecklistItem(taskId: string, text: string): Promise<HabiticaTask> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}/checklist`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ text })
    });
    return this._parseResponse<HabiticaTask>(res, `addChecklistItem/${taskId}`);
  }

  /**
   * Scores (completes or increments) a task in Habitica.
   * Calls `POST /api/v3/tasks/:id/score/:direction`.
   * @param id        UUID of the task to score.
   * @param direction `'up'` for positive scoring; `'down'` for negative (habits only).
   * @returns The raw score delta response (HP/XP/gold changes). Typed as `unknown` because
   *          the shape varies by task type and is not consumed by the plugin.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async scoreTask(id: string, direction: string): Promise<unknown> {
    const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${id}/score/${direction}`, {
      method: 'POST',
      headers: this.headers
    });
    return this._parseResponse<unknown>(res, `scoreTask/${id}`);
  }
}
