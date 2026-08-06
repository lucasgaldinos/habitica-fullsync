import { requestUrl, RequestUrlResponse } from 'obsidian';
import { HabiticaTag, HabiticaTask } from '../types';
import { FIELD_REGISTRY } from '../field-registry';

/** Accumulated counters for a single sync run — surfaced by {@link HabiticaApiClient.getSyncStats}. */
export interface SyncStats {
  totalCalls: number;
  rateLimitedCalls: number;
  byOperation: Record<string, number>;
}

/**
 * Thin HTTP client for the Habitica v3 REST API.
 *
 * Responsibilities:
 * - Attaches required authentication headers (`x-api-user`, `x-api-key`, `x-client`).
 * - Handles HTTP 429 (rate limited) responses with exponential backoff via {@link rateLimitedFetch}.
 * - Monitors {@link https://github.com/HabitRPG/habitica/wiki/API-Usage-Guidelines#rate-limiting | Habitica rate-limit headers} (`X-RateLimit-Remaining`, `X-RateLimit-Limit`, `X-RateLimit-Reset`) proactively on every response and pauses the request queue before the 30 req/min quota is exhausted.
 * - Validates every response via {@link _parseResponse} — checks `res.ok`, JSON parseability,
 *   and the Habitica-specific `json.success` flag — before returning `json.data`.
 *
 * Habitica's rate limiter (`RATE_LIMITER_BASE_POINTS=30, BASE_DURATION=60`) allows 30 requests per 60-second window — one request every 2,000 ms minimum. The default `minRequestIntervalMs` is 2,200 ms to leave headroom.
 */
export class HabiticaApiClient {
  readonly userId: string;
  readonly apiToken: string;
  private baseUrl: string;
  private headers: Record<string, string>;
  /** Minimum milliseconds between outgoing requests. Defaults to 2,200 ms to respect Habitica's 30 req/min limit (rateLimiter.js: BASE_POINTS=30, BASE_DURATION=60). */
  private minInterval: number;
  /** Timestamp (ms) of the last request's start — used for inter-request spacing. */
  private lastRequestTime: number = 0;
  /** Promise chain — ensures requests are serialized so spacing applies to ALL calls. */
  private queue: Promise<void> = Promise.resolve();
  /** Proactive rate-limit tracking — values from the most recent response headers. */
  private remaining: number = 30;
  private limit: number = 30;
  private resetEpoch: number = 0;
  /** When `true`, `console.debug` instrumentation is emitted for timing and rate-limit diagnostics. */
  private debug: boolean;
  /** Per-sync counters — reset by {@link resetSyncStats} at the start of each sync run. */
  private syncStats: SyncStats = { totalCalls: 0, rateLimitedCalls: 0, byOperation: {} };
  /** Timestamp (ms) set by {@link setSyncStartTime} at the beginning of a sync; used for elapsed-time logging. */
  private _syncStartTime: number = 0;

  /** Public accessor so {@link SyncManager} can gate its own step-timing on the same flag. */
  get isDebugEnabled(): boolean { return this.debug; }

  /**
   * @param apiUser  Habitica account user ID (UUID).
   * @param apiToken Habitica API token.
   * @param opts.baseUrl              Base URL for the Habitica v3 API. Defaults to `'https://habitica.com/api/v3'`.
   * @param opts.minRequestIntervalMs Minimum pause between outgoing requests, in milliseconds. Defaults to `2200`.
   * @param opts.debug                When `true`, emits `console.debug` instrumentation for request timing and rate-limit diagnostics. Defaults to `false`.
   */
  constructor(apiUser: string, apiToken: string, opts?: { baseUrl?: string; minRequestIntervalMs?: number; debug?: boolean }) {
    this.userId = apiUser;
    this.apiToken = apiToken;
    this.baseUrl = opts?.baseUrl ?? 'https://habitica.com/api/v3';
    this.minInterval = opts?.minRequestIntervalMs ?? 2200;
    this.debug = opts?.debug ?? false;
    this.headers = {
      'x-api-user': apiUser,
      'x-api-key': apiToken,
      'x-client': 'habitica-fullsync-js',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Wraps `fetch` with automatic retry on transient failures using exponential backoff.
   *
   * Retries on HTTP 429 (rate limited), 502/503/504 (transient gateway errors), and network failures (`fetch` throwing, e.g. CORS blocks after repeated failures). On a 429, reads the `X-RateLimit-Reset` header (epoch seconds) and waits the remaining time up to 60 s; otherwise waits the current `delay`. `delay` doubles after each retry.
   *
   * @param url     Absolute URL to request.
   * @param options Standard `RequestInit` options forwarded to `fetch`.
   * @param retries Maximum total attempts before giving up. Defaults to `3`.
   * @param delay   Initial backoff in milliseconds, doubles on each retry. Defaults to `1000`.
   * @returns The raw `RequestUrlResponse` for the first non-retryable reply.
   * @throws {Error} When all retries are exhausted.
   */
  async rateLimitedFetch(url: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<RequestUrlResponse> {
    for (let i = 0; i < retries; i++) {
      let res: RequestUrlResponse;
      try {
        res = await requestUrl({ url, method: options.method, headers: options.headers as Record<string, string>, body: options.body as string | undefined });
      } catch (err) {
        // Network-level failure (offline, DNS, CORS block) — retryable.
        if (i < retries - 1) {
          console.warn(`habitica-fullsync HabiticaApiClient.rateLimitedFetch: network error on ${url} (attempt ${i + 1}/${retries}), retrying in ${delay}ms:`, err);
          await new Promise(resolve => window.setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw new Error('Max retries reached for ' + url);
      }
      if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
        // Count 429s on first encounter — was dead code below the continue.
        if (res.status === 429) this.syncStats.rateLimitedCalls++;
        if (i === retries - 1) break;
        const resetHeader = res.headers['x-ratelimit-reset'];
        const resetParsed = resetHeader ? parseInt(resetHeader, 10) : NaN;
        // Habitica returns epoch seconds (not seconds-until-reset). Compute remaining wait, capped at 60 s. When the computed wait is ≤ 0 (reset epoch already past), fall back to exponential backoff.
        const computedWait = res.status === 429 && Number.isFinite(resetParsed)
          ? resetParsed * 1000 - Date.now()
          : -1;
        const waitMs = computedWait > 0
          ? Math.min(computedWait, 60_000)
          : delay;
        console.warn(`habitica-fullsync HabiticaApiClient.rateLimitedFetch: HTTP ${res.status} on ${url} (attempt ${i + 1}/${retries}), retrying in ${waitMs}ms.`);
        await new Promise(resolve => window.setTimeout(resolve, waitMs));
        delay *= 2;
        continue;
      }
      // Proactive rate-limit tracking — read headers on every successful response.
      const rem = res.headers['x-ratelimit-remaining'];
      const lim = res.headers['x-ratelimit-limit'];
      const rst = res.headers['x-ratelimit-reset'];
      if (rem !== null) { const v = parseInt(rem, 10); if (Number.isFinite(v)) this.remaining = v; }
      if (lim !== null) { const v = parseInt(lim, 10); if (Number.isFinite(v)) this.limit = v; }
      if (rst !== null) { const v = parseInt(rst, 10); if (Number.isFinite(v)) this.resetEpoch = v; }
      if (this.debug) {
        const method = options.method || 'GET';
        const path = url.replace(this.baseUrl, '');
        const elapsedMs = this._syncStartTime > 0 ? Date.now() - this._syncStartTime : 0;
        console.debug(`[hf:req] ${method} ${path} → ${res.status} | remaining: ${this.remaining}/${this.limit} | reset in ${this.resetEpoch}s | +${elapsedMs}ms`);
      }
      const warnThreshold = Math.ceil(this.limit * 0.17); // ~17% of quota
      if (this.remaining <= warnThreshold) {
        console.warn(`habitica-fullsync HabiticaApiClient.rateLimitedFetch: low rate-limit buffer — ${this.remaining}/${this.limit} remaining, reset in ${this.resetEpoch}s`);
      }
      return res;
    }
    throw new Error('Max retries reached for ' + url);
  }

  /**
   * Serialises an async operation so that all API calls are spaced by at least
   * `minInterval` milliseconds. The existing `rateLimitedFetch` retry logic
   * handles individual 429/5xx responses; this queue ensures that rapid-fire
   * call sequences (e.g. scoring then creating tasks) don't burst past the
   * rate limit in the first place.
   */
  private _enqueue<T>(op: () => Promise<T>, operationName?: string): Promise<T> {
    const name = operationName || 'unknown';
    const run = async (): Promise<T> => {
      const now = Date.now();
      // Inter-request spacing: honour minInterval from the last request.
      const wait = Math.max(0, this.lastRequestTime + this.minInterval - now);
      if (wait > 0) {
        await new Promise(resolve => window.setTimeout(resolve, wait));
      }
      // Proactive rate-limit pause: when ≤ 10% of quota remains, wait until the reset window. Checked here (after the inter-request wait) so that rapid enqueues see the most recent remaining value from the preceding request's response headers.
      const pauseThreshold = Math.ceil(this.limit * 0.10); // 10% of quota
      if (this.remaining <= pauseThreshold && this.resetEpoch > 0) {
        const resetWait = this.resetEpoch * 1000 - Date.now();
        // When the reset epoch is already past or within 1 s, fall back to a 60 s pause (the full rate-limit window). Without this, the queue burns through the remaining quota and hits 429.
        const extraWait = Math.min(resetWait > 0 ? resetWait : 60_000, 60_000);
        if (this.debug) {
          console.debug(`[hf:queue] adaptive pause: ${extraWait}ms (remaining=${this.remaining}/${this.limit}, reset in ${Math.round(Math.max(0, resetWait) / 1000)}s)`);
        }
        await new Promise(resolve => window.setTimeout(resolve, extraWait));
      }
      this.syncStats.totalCalls++;
      this.syncStats.byOperation[name] = (this.syncStats.byOperation[name] || 0) + 1;
      // Set lastRequestTime AFTER the operation completes so that retry time (e.g. 429 backoff) is included in the inter-request spacing. The next queued call will wait minInterval from when this request finished.
      const result = await op();
      this.lastRequestTime = Date.now();
      return result;
    };
    // Chain onto the queue so only one operation runs at a time
    const next = this.queue.then(() => run(), () => run());
    this.queue = next.then(() => { });
    // Return a promise that resolves when THIS operation completes (not the whole chain)
    return next;
  }

  /**
   * Validates every Habitica API response before returning data.
   *
   * Checks in order:
   * 1. `res.ok` — throws on any non-2xx HTTP status, including up to 200 chars of the body.
   * 2. JSON parseability — throws if `res.json()` rejects.
   * 3. `json.success === false` — throws with `json.message` on application-level errors.
   *
   * @param res     The raw `RequestUrlResponse` from {@link rateLimitedFetch}.
   * @param context Human-readable label in error messages (e.g. `'fetchUserTasks'`).
   * @returns `json.data` cast to `T`.
   * @throws {Error} On HTTP error, parse failure, or Habitica application error.
   */
  private async _parseResponse<T>(res: RequestUrlResponse, context: string): Promise<T> {
    if (res.status < 200 || res.status >= 300) {
      const body = res.text;
      throw new Error(`Habitica API error [${context}]: HTTP ${res.status} — ${body.slice(0, 200)}`);
    }
    const json = res.json as { success: boolean; data: T; message?: string } | undefined;
    // Runtime type-guard: validate that the parsed JSON actually matches the expected shape
    if (!json || typeof json !== 'object' || typeof json.success !== 'boolean') {
      throw new Error(`Habitica API error [${context}]: unexpected response shape — missing success field`);
    }
    if (json.success === false) {
      throw new Error(`Habitica API error [${context}]: ${json.message || 'unknown error'}`);
    }
    return json.data;
  }

  // ── Sync-stats helpers (Phase 8 diagnostics) ──

  /** Called by {@link SyncManager} at the start of every sync run to anchor elapsed-time logs. */
  setSyncStartTime(): void { this._syncStartTime = Date.now(); }

  /** Returns a snapshot of the per-sync call counters. Called in the sync `finally` block for the summary log. */
  getSyncStats(): SyncStats {
    return {
      totalCalls: this.syncStats.totalCalls,
      rateLimitedCalls: this.syncStats.rateLimitedCalls,
      byOperation: { ...this.syncStats.byOperation },
    };
  }

  /** Zeros out the per-sync counters. Called at the start of every sync run. */
  resetSyncStats(): void {
    this.syncStats = { totalCalls: 0, rateLimitedCalls: 0, byOperation: {} };
  }

  /**
   * Fetches all tasks belonging to the authenticated user. Calls `GET /api/v3/tasks/user`.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchUserTasks(): Promise<HabiticaTask[]> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/user`, { headers: this.headers });
      return this._parseResponse<HabiticaTask[]>(res, 'fetchUserTasks');
    }, 'fetchUserTasks');
  }

  /**
   * Fetches a single task by ID. Calls `GET /api/v3/tasks/:taskId`.
   */
  async getTask(taskId: string): Promise<HabiticaTask> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}`, { headers: this.headers });
      return this._parseResponse<HabiticaTask>(res, 'getTask');
    }, 'getTask');
  }

  /**
   * Fetches all tags belonging to the authenticated user. Calls `GET /api/v3/tags`. Used to build a tag-lookup map (`id → name`) for task formatting.
   *
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchTags(): Promise<HabiticaTag[]> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tags`, { headers: this.headers });
      return this._parseResponse<HabiticaTag[]>(res, 'fetchTags');
    }, 'fetchTags');
  }

  /**
   * Fetches all tasks belonging to a Habitica group (party or guild). Calls `GET /api/v3/tasks/group/:groupId`.
   * @param groupId UUID of the Habitica group.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async fetchGroupTasks(groupId: string): Promise<HabiticaTask[]> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/group/${groupId}`, { headers: this.headers });
      return this._parseResponse<HabiticaTask[]>(res, 'fetchGroupTasks');
    }, 'fetchGroupTasks');
  }

  /**
   * Creates a new task in Habitica.
   * Calls `POST /api/v3/tasks/user`. Only fields present in `input` are sent.
   *
   * @param input Task fields. `text` and `type` are required; `priority`, `date`, `startDate`, `frequency`, `tags`, and `notes` are optional. Habits default to `up: true` / `down: false`.
   * @returns The newly created task, including the server-assigned `id`.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async createTask(input: CreateTaskInput): Promise<HabiticaTask> {
    const body: Record<string, unknown> = { text: input.text, type: input.type };
    if (input.notes) body.notes = input.notes;
    else body.notes = 'Created from Obsidian';
    // Scalar fields — delegated to FIELD_REGISTRY (F5).
    // Skips sentinel, stringSet, text, and notes (handled above).
    for (const def of FIELD_REGISTRY) {
      if (def.type === 'sentinel' || def.type === 'stringSet' || def.name === 'text' || def.name === 'notes') continue;
      const val = (input as unknown as Record<string, unknown>)[def.name];
      if (val !== undefined && val !== null && val !== '') {
        body[def.apiKey] = val;
      }
    }
    if (Array.isArray(input.tags) && input.tags.length) body.tags = input.tags;
    if (input.type === 'habit') { body.up = true; body.down = false; }
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/user`, {
        method: 'POST', headers: this.headers, body: JSON.stringify(body),
      });
      return this._parseResponse<HabiticaTask>(res, 'createTask');
    }, 'createTask');
  }

  /**
   * Creates a new tag in Habitica. Calls `POST /api/v3/tags`.
   * @returns The newly created tag, including the server-assigned `id`.
   */
  async createTag(name: string): Promise<HabiticaTag> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tags`, {
        method: 'POST', headers: this.headers, body: JSON.stringify({ name }),
      });
      return this._parseResponse<HabiticaTag>(res, 'createTag');
    }, 'createTag');
  }

  /**
   * Adds a checklist item to an existing task. Calls `POST /api/v3/tasks/:taskId/checklist`.
   * @returns The updated parent task with the full `checklist` array.
   */
  async addChecklistItem(taskId: string, text: string): Promise<HabiticaTask> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}/checklist`, {
        method: 'POST', headers: this.headers, body: JSON.stringify({ text }),
      }, 2); // idempotent — next sync picks up failures
      return this._parseResponse<HabiticaTask>(res, `addChecklistItem/${taskId}`);
    }, 'addChecklistItem');
  }

  /**
   * Scores a checklist item. Calls `POST /api/v3/tasks/:taskId/checklist/:itemId/score`.
   * @returns The updated parent task with the checklist item marked completed.
   */
  async scoreChecklistItem(taskId: string, itemId: string): Promise<HabiticaTask> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}/checklist/${itemId}/score`, {
        method: 'POST', headers: this.headers,
      }, 2); // idempotent — next sync picks up failures
      return this._parseResponse<HabiticaTask>(res, `scoreChecklistItem/${taskId}/${itemId}`);
    }, 'scoreChecklistItem');
  }

  /**
   * Updates a checklist item's text. Calls `PUT /api/v3/tasks/:taskId/checklist/:itemId`.
   * @returns The updated parent task with the full `checklist` array.
   */
  async updateChecklistItem(taskId: string, itemId: string, text: string): Promise<HabiticaTask> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}/checklist/${itemId}`, {
        method: 'PUT', headers: this.headers, body: JSON.stringify({ text }),
      }, 2);
      return this._parseResponse<HabiticaTask>(res, `updateChecklistItem/${taskId}/${itemId}`);
    }, 'updateChecklistItem');
  }

  /**
   * Deletes a checklist item. Calls `DELETE /api/v3/tasks/:taskId/checklist/:itemId`.
   * Idempotent — 404 on already-deleted items is caught and treated as success.
   * @returns The updated parent task with the full `checklist` array, or `null` if the item was already deleted.
   */
  async deleteChecklistItem(taskId: string, itemId: string): Promise<HabiticaTask | null> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${taskId}/checklist/${itemId}`, {
        method: 'DELETE', headers: this.headers,
      }, 2);
      if (res.status === 404) return null; // already deleted — idempotent
      return this._parseResponse<HabiticaTask>(res, `deleteChecklistItem/${taskId}/${itemId}`);
    }, 'deleteChecklistItem');
  }

  /**
   * Updates an existing Habitica task's fields.
   * Calls `PUT /api/v3/tasks/:id`. Only fields that are present (not `undefined`) are sent — omitted fields are left unchanged on the server.
   *
   * @param id     UUID of the task to update.
   * @param fields Partial task fields to update. `text`, `notes`, `priority`, `date`, and `tags` are supported. `type` is intentionally excluded to prevent accidental type changes.
   * @returns The updated task from the server.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async updateTask(id: string, fields: UpdateTaskInput): Promise<HabiticaTask> {
    const body: Record<string, unknown> = {};
    // Scalar fields — delegated to FIELD_REGISTRY (F5).
    for (const def of FIELD_REGISTRY) {
      if (def.type === 'sentinel' || def.type === 'stringSet' || def.name === 'text') continue;
      const val = (fields as unknown as Record<string, unknown>)[def.name];
      if (val !== undefined) body[def.apiKey] = val;
    }
    // text and tags: explicit (text always sent if present; tags is stringSet handled above)
    if (fields.text !== undefined) body.text = fields.text;
    if (fields.tags !== undefined) body.tags = fields.tags;
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'PUT', headers: this.headers, body: JSON.stringify(body),
      }, 2); // idempotent — next sync picks up failures
      return this._parseResponse<HabiticaTask>(res, `updateTask/${id}`);
    }, 'updateTask');
  }

  /**
   * Scores (completes or increments) a task in Habitica.
   * Calls `POST /api/v3/tasks/:id/score/:direction`.
   * @param id        UUID of the task to score.
   * @param direction `'up'` for positive scoring; `'down'` for negative (habits only).
   * @returns The raw score delta response (HP/XP/gold changes). Typed as `unknown` because the shape varies by task type and is not consumed by the plugin.
   * @throws {Error} On network failure, HTTP error, or Habitica application error.
   */
  async scoreTask(id: string, direction: string): Promise<unknown> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${id}/score/${direction}`, {
        method: 'POST', headers: this.headers,
      });
      return this._parseResponse<unknown>(res, `scoreTask/${id}/${direction}`);
    }, 'scoreTask');
  }

  /**
   * Deletes a task from Habitica. Calls `DELETE /api/v3/tasks/:id`.
   * Idempotent — 404 on already-deleted tasks returns `null`. 401 on challenge/group tasks throws.
   * @returns `null` if the task was already deleted (404), otherwise void.
   * @throws {Error} On 401 (challenge/group task — cannot delete) or other HTTP errors.
   */
  async deleteTask(id: string): Promise<null | void> {
    return this._enqueue(async () => {
      const res = await this.rateLimitedFetch(`${this.baseUrl}/tasks/${id}`, {
        method: 'DELETE', headers: this.headers,
      }, 1); // destructive — don't retry aggressively
      if (res.status === 404) return null; // already deleted — idempotent
      if (res.status < 200 || res.status >= 300) {
        const body = (res.json as unknown) || {};
        throw new Error(`DELETE /tasks/${id} failed: ${res.status} — ${JSON.stringify(body)}`);
      }
      return; // void — successful deletion
    }, 'deleteTask');
  }
}

/** Fields accepted by {@link createTask}. `text` and `type` are required; the remaining fields are optional and mapped to the Habitica API via {@link FIELD_REGISTRY}. */
export interface CreateTaskInput {
  text: string;
  type: HabiticaTask['type'];
  priority?: number;
  date?: string;
  startDate?: string;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  everyX?: number;
  tags?: string[];
  notes?: string;
}

/** Fields accepted by {@link updateTask}. All optional — only present keys are sent to the API. Mapped via {@link FIELD_REGISTRY}. */
export interface UpdateTaskInput {
  text?: string;
  notes?: string;
  priority?: number;
  date?: string;
  tags?: string[];
  up?: boolean;
  down?: boolean;
  streak?: number;
  attribute?: string;
  frequency?: string;
  everyX?: number;
  repeat?: Record<string, boolean>;
  startDate?: string;
}
