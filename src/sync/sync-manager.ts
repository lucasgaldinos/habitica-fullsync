import { normalizePath } from 'obsidian';
import { HabiticaApiClient } from '../api/api-client';
import { buildDataviewBlock } from '../lib/dataview';
import { buildTagReverseIndex, normalizeTagKey } from '../markdown/tags';
import { cleanTitle, parseManagedTaskLine, parseTaskLine } from '../markdown/parser';
import { extractId } from '../markdown/inline-fields';
import { filterActive, formatTasks } from '../markdown/formatter';
import { HabiticaChecklistItem, HabiticaTask, HabiticaTag, ChecklistItemParsed, PluginSettings, SyncConfig, SyncContext } from '../types';
import { VaultHandler } from '../vault/vault-handler';
import { parseSyncFile } from './sync-file-model';
import { TaskRegistry } from './task-registry';
import { SyncReport } from './sync-report';
import { FIELD_REGISTRY } from '../field-registry';

/**
 * Orchestrates the full Habitica ↔ Obsidian sync workflow.
 *
 * Responsibilities:
 * 1. Fetches user and optional group tasks + tags from the Habitica API.
 * 2. Scans the vault for recently completed tasks; scores them in Habitica and marks them `%%scored%%` in the vault to prevent double-scoring.
 * 3. Creates new Habitica tasks for vault-completed items without an existing ID (when `disableCreating` is `false`).
 * 4. Builds a Markdown document grouping tasks by type and source.
 * 5. Writes the document to `outputFolder/habitica-fullsync.md`.
 *
 * The `_syncInFlight` boolean flag prevents concurrent sync runs — when auto-sync fires while a manual sync (or a previous auto-sync) is still in progress, the new invocation is silently skipped. This is intentional: queuing overlapping syncs would compound rate-limit pressure and risk Heisenbugs from stale snapshots.
 */
export class SyncManager {
  private apiClient: HabiticaApiClient;
  private vaultHandler: VaultHandler;
  private settings: PluginSettings;
  private noticeFn: (msg: string) => void;
  /** Mutex flag — `true` while a sync is running; prevents concurrent invocations. */
  private _syncInFlight: boolean;
  /** Timestamp (ms) of the last sync's completion — used by {@link preSyncDelay} guard. */
  private _lastSyncEndTime: number = 0;

  /**
   * @param apiClient    Configured Habitica API client.
   * @param vaultHandler Vault read/write helper.
   * @param settings     Current plugin settings (read each sync run, reflects live UI changes).
   * @param noticeFn     Callback that displays a user-facing notice (e.g. `msg => new Notice(msg)`).
   */
  constructor(apiClient: HabiticaApiClient, vaultHandler: VaultHandler, settings: PluginSettings, noticeFn: (msg: string) => void) {
    this.apiClient = apiClient;
    this.vaultHandler = vaultHandler;
    this.settings = settings;
    this.noticeFn = noticeFn;
    this._syncInFlight = false;
  }

  /**
   * Runs a full Habitica ↔ Obsidian sync as a sequence of isolated steps. `_fetchFromHabitica` failure aborts the run; the mutation steps (`_scoreCompletedTasks`, `_createNewTasks`, `_syncManagedTasks`) each have their own error boundary so one failure cannot prevent output regeneration.
   *
   * @param options.allowUpdates When `true`, checklist changes and task field changes in the markdown are pushed to Habitica. Defaults to `false` so auto-sync is fetch + render only.
   *
   */
  /** @returns 'completed' when sync ran, 'skipped-in-flight' when another sync is running, 'skipped-cooldown' when within the minimum gap. */
  async sync(options?: { allowUpdates?: boolean }): Promise<string> {
    if (this._syncInFlight) {
      console.warn('habitica-fullsync SyncManager.sync: sync already in progress, skipping.');
      return 'skipped-in-flight';
    }

    // preSyncDelay guard: skip if the previous sync ended less than 2 min ago
    // to avoid firing into a rate-limit quota still depleted from the last run.
    const MIN_SYNC_GAP_MS = 120_000; // 2 min — Habitica's 30 req/min window is 60 s; 2× headroom
    const elapsed = Date.now() - this._lastSyncEndTime;
    if (this._lastSyncEndTime > 0 && elapsed < MIN_SYNC_GAP_MS) {
      console.warn(`habitica-fullsync SyncManager.sync: skipping — last sync ended ${Math.round(elapsed / 1000)}s ago (minimum gap: ${MIN_SYNC_GAP_MS / 1000}s).`);
      return 'skipped-cooldown';
    }

    this._syncInFlight = true;

    // Phase 8 diagnostics: anchor elapsed-time logs and reset per-sync counters.
    const syncWallStart = Date.now();
    this.apiClient.setSyncStartTime();
    this.apiClient.resetSyncStats();

    // Snapshot settings at sync start to prevent mid-sync Heisenbug
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.completionLookbackDays);

    const config: SyncConfig = {
      allowUpdates: options?.allowUpdates ?? false,
      disableScoring: this.settings.disableScoring,
      disableCreating: this.settings.disableCreating,
      enableVaultScan: this.settings.enableVaultScan,
      completionLookbackDays: this.settings.completionLookbackDays,
      outputFolder: this.settings.outputFolder,
      groupId: this.settings.groupId,
      TODAY: new Date().toLocaleDateString('en-CA'),
      cutoffDate,
      filePath: this.settings.outputFolder
        ? normalizePath(`${this.settings.outputFolder}/habitica-fullsync.md`)
        : 'habitica-fullsync.md',
    };

    const registry = new TaskRegistry();
    const report = new SyncReport();

    const ctx: SyncContext = {
      config,
      registry,
      report,
      tagLookup: {},
      scoredIds: new Set<string>(),
    };

    try {
      const debug = this.apiClient.isDebugEnabled;

      const syncFileEntries = parseSyncFile(
        await this.vaultHandler.readFileContent(config.filePath),
      );

      await this._timedStep('[hf:step] full-sync', debug, async () => {
        await this._timedStep('[hf:step]  1-fetch', debug, () => this._fetchFromHabitica(ctx));
        await this._timedStep('[hf:step]  2-score-completed', debug, () => this._scoreCompletedTasks(ctx, syncFileEntries));
        await this._timedStep('[hf:step]  3-create-new', debug, () => this._createNewTasks(ctx, syncFileEntries));
        await this._timedStep('[hf:step]  4-sync-managed', debug, () => this._syncManagedTasks(ctx, syncFileEntries));
        await this._timedStep('[hf:step]  5-render-write', debug, () => this._renderAndWrite(ctx));
      });

      this.noticeFn(report.renderSummary(config));
    } catch (err) {
      console.error('habitica-fullsync SyncManager.sync:', err);
      this.noticeFn('❌ Habitica sync failed. Check console for details.');
    } finally {
      if (this.apiClient.isDebugEnabled) {
        this._logSyncSummary(this.apiClient.getSyncStats(), Date.now() - syncWallStart);
      }
      this._syncInFlight = false;
      this._lastSyncEndTime = Date.now();
    }
    return 'completed';
  }

  /** Wraps an async step with console.time/timeEnd when debug is enabled. Uses try/finally so the timer always closes. */
  private async _timedStep<T>(label: string, debug: boolean, fn: () => Promise<T>): Promise<T> {
    if (!debug) return fn();
    console.time(label);
    try { return await fn(); }
    finally { console.timeEnd(label); }
  }

  /** Logs the per-sync API call summary at console.debug level. */
  private _logSyncSummary(stats: import('../api/api-client').SyncStats, wallMs: number): void {
    const syncSec = (wallMs / 1000).toFixed(1);
    const rate = stats.totalCalls > 0
      ? (stats.totalCalls / Math.max(parseFloat(syncSec), 1.0)).toFixed(1)
      : '0.0';
    const breakdown = Object.entries(stats.byOperation)
      .sort(([, a], [, b]) => b - a)
      .map(([op, n]) => `${op}:${n}`)
      .join(' ');
    console.debug(
      `[hf:summary] API calls: ${stats.totalCalls} | 429s: ${stats.rateLimitedCalls} | ` +
      `time: ${syncSec}s | rate: ${rate}/s | ops: { ${breakdown} }`,
    );
  }

  /** Step 1: fetch user tasks, tags, and (if configured) group tasks. */
  private async _fetchFromHabitica(ctx: SyncContext): Promise<void> {
    const rawTasks = await this.apiClient.fetchUserTasks();
    ctx.registry.personal = Array.isArray(rawTasks) ? rawTasks : [];
    const tags = await this.apiClient.fetchTags();
    const rawTags = Array.isArray(tags) ? tags : [];
    ctx.tagLookup = Object.fromEntries(rawTags.map((tag: HabiticaTag) => [tag.id, tag.name]));
    if (ctx.config.groupId) {
      try {
        const rawGroupTasks = await this.apiClient.fetchGroupTasks(ctx.config.groupId);
        ctx.registry.group = Array.isArray(rawGroupTasks) ? rawGroupTasks : [];
      } catch (err) {
        console.error('habitica-fullsync SyncManager._fetchFromHabitica: failed to fetch group tasks:', err);
        this.noticeFn('⚠️ Failed to fetch group tasks — sync continuing without them. Check console for details.');
      }
    }
  }

  /** Step 2: score sync-file checkboxes, then (opt-in) recently completed vault tasks. */
  private async _scoreCompletedTasks(ctx: SyncContext, entries: import('./sync-file-model').SyncFileEntry[]): Promise<void> {
    if (ctx.config.disableScoring) return;
    try {
      const syncFileChecked = entries.filter(e => e.kind === 'checked' && e.id);
      for (const { id } of syncFileChecked) {
        if (!id) continue;
        const habiticaTask = ctx.registry.findById(id);
        if (!habiticaTask || habiticaTask.completed) continue;
        if (habiticaTask.type !== 'todo' && habiticaTask.type !== 'daily') continue;
        try {
          await this.apiClient.scoreTask(id, 'up');
          ctx.scoredIds.add(id);
          habiticaTask.completed = true; // keep registry in sync after scoring
        } catch (err) {
          ctx.report.scoreFailures++;
          console.error(`habitica-fullsync SyncManager._scoreCompletedTasks: failed to score sync-file task ${id}:`, err);
        }
      }

      const completedTasks = ctx.config.enableVaultScan
        ? await this.vaultHandler.getRecentCompletedTasks(ctx.config.cutoffDate, ctx.config.filePath)
        : [];
      for (const task of completedTasks) {
        const id = extractId(task.line);
        if (id) {
          if (ctx.scoredIds.has(id)) continue;
          const habiticaTask = ctx.registry.findById(id);
          if (!habiticaTask || habiticaTask.completed) continue;
          let direction = 'up';
          if (habiticaTask.type === 'habit') {
            // up/down may both be undefined for legacy habit tasks — default to 'up' (positive scoring).
            direction = habiticaTask.up ? 'up' : habiticaTask.down ? 'down' : 'up';
          }
          try {
            await this.apiClient.scoreTask(id, direction);
            ctx.scoredIds.add(id);
            habiticaTask.completed = true; // keep registry in sync after scoring
            await this.vaultHandler.updateLine(task.file, task.lineNumber, task.line, task.line + ' %%scored%%');
          } catch (err) {
            ctx.report.scoreFailures++;
            console.error(`habitica-fullsync SyncManager._scoreCompletedTasks: failed to score vault task ${id}:`, err);
          }
        } else if (!ctx.config.disableCreating) {
          const text = cleanTitle(task.line.replace(/^- \[x\]\s*/, ''));
          try {
            const newTask = await this.apiClient.createTask({ text, type: 'todo' });
            // Write [id::] BEFORE scoring so a score failure doesn't orphan a duplicate
            const lineWithId = task.line + ` [id:: ${newTask.id}]`;
            await this.vaultHandler.updateLine(task.file, task.lineNumber, task.line, lineWithId);
            try {
              await this.apiClient.scoreTask(newTask.id, 'up');
              ctx.scoredIds.add(newTask.id);
              await this.vaultHandler.updateLine(task.file, task.lineNumber, lineWithId, lineWithId + ' %%scored%%');
            } catch (scoreErr) {
              ctx.report.scoreFailures++;
              console.error(`habitica-fullsync SyncManager._scoreCompletedTasks: created task ${newTask.id} but failed to score — id written back, will retry next sync:`, scoreErr);
            }
          } catch (err) {
            ctx.report.scoreFailures++;
            console.error('habitica-fullsync SyncManager._scoreCompletedTasks: failed to create and score new task:', err);
          }
        }
      }
    } catch (err) {
      console.error('habitica-fullsync SyncManager._scoreCompletedTasks:', err);
    }
  }

  /**
   * Step 3: create Habitica tasks from hand-written `- [ ]` lines (no [id::]) in the sync file. Type is inferred from the section heading. Created tasks are pushed into `ctx.tasks` so they render with their new id, and the id is written back to the source line immediately for crash-safe idempotency.
   */
  private async _createNewTasks(ctx: SyncContext, entries: import('./sync-file-model').SyncFileEntry[]): Promise<void> {
    if (ctx.config.disableCreating) return;
    try {
      const reverseIndex = this._buildReverseIndex(ctx);
      const creatable = entries.filter(e => e.kind === 'creatable');
      for (const item of creatable) {
        try {
          const input = parseTaskLine(item.raw, item.section, reverseIndex, item.notes, item.checklistItems);
          if (!input.text) {
            console.warn(`habitica-fullsync SyncManager._createNewTasks: skipping creatable line with empty title (first 80 chars): "${item.raw.slice(0, 80)}${item.raw.length > 80 ? '…' : ''}"`);
            continue;
          }
          if (!input.type) {
            ctx.report.skippedSections.add(item.section);
            console.warn(`habitica-fullsync SyncManager._createNewTasks: skipping creatable line under unknown section "${item.section}" (first 80 chars): "${item.raw.slice(0, 80)}${item.raw.length > 80 ? '…' : ''}"`);
            continue;
          }
          const createdTags = await this._createTagsAndRegister(input.newTagNames, ctx, reverseIndex, '_createNewTasks');
          input.tagIds.push(...createdTags);
          const created = await this.apiClient.createTask({
            text: input.text, type: input.type, priority: input.priority,
            date: input.date, startDate: input.startDate,
            frequency: input.frequency, everyX: input.everyX,
            tags: input.tagIds, notes: input.notes,
          });
          // Newly created Habitica tasks always have an empty checklist array — no need to dedup before adding because there's nothing to dedup against.
          let checklist = Array.isArray(created.checklist) ? created.checklist : [];
          for (const ci of input.checklistItems) {
            try {
              const updated = await this.apiClient.addChecklistItem(created.id, ci.text);
              if (Array.isArray(updated.checklist)) checklist = updated.checklist;
            } catch (err) {
              console.error(`habitica-fullsync SyncManager._createNewTasks: failed to add checklist item to ${created.id}:`, err);
            }
          }
          const merged: HabiticaTask = {
            ...created,
            tags: Array.isArray(created.tags) ? created.tags : input.tagIds,
            notes: created.notes ?? input.notes ?? null,
            checklist,
          };
          ctx.registry.pushCreated(merged);
          try {
            await this.vaultHandler.updateLine(ctx.config.filePath, item.lineNumber, item.raw, `${item.raw} [id:: ${created.id}]`);
          } catch (writeErr) {
            console.error(`habitica-fullsync SyncManager._createNewTasks: created task ${created.id} but failed to write [id::] back to the vault — next sync will DUPLICATE this task unless the id is added manually to: "${item.raw}"`, writeErr);
            ctx.report.createFailures++;
            continue;
          }
          ctx.report.createdCount++;
        } catch (err) {
          ctx.report.createFailures++;
          console.error(`habitica-fullsync SyncManager._createNewTasks: failed to create task from line "${item.raw}":`, err);
        }
      }
    } catch (err) {
      console.error('habitica-fullsync SyncManager._createNewTasks:', err);
    }
  }

  // ── Shared helpers (extracted from _syncManagedTasks and _renderAndWrite) ──

  /** Builds the tag reverse index from ctx.tagLookup — shared by _createNewTasks and _syncManagedTasks. */
  private _buildReverseIndex(ctx: SyncContext): Record<string, string> {
    return buildTagReverseIndex(ctx.tagLookup);
  }

  /**
   * Pure diff of parsed checklist items against the server-side checklist.
   * Returns categorized deltas — no API calls, no side effects. Testable.
   */
  private _diffChecklistItems(
    parsedItems: ChecklistItemParsed[],
    existingChecklist: HabiticaChecklistItem[],
  ): {
    newItems: string[];
    scoreItemIds: string[];
    editItems: { itemId: string; text: string }[];
    deletedItemIds: string[];
  } {
    const newItems: string[] = [];
    const scoreItemIds: string[] = [];
    const editItems: { itemId: string; text: string }[] = [];

    for (const ci of parsedItems) {
      if (!ci.text) continue;
      let habItem: HabiticaChecklistItem | undefined;

      if (ci.subId) {
        habItem = existingChecklist.find(hci => hci.id === ci.subId);
        // Text-edit detection — subId matched but text changed
        if (habItem && ci.text.trim() !== habItem.text.trim()) {
          editItems.push({ itemId: habItem.id, text: ci.text });
          continue;
        }
      }
      if (!habItem) {
        habItem = existingChecklist.find(
          hci => hci.text.trim().toLowerCase() === ci.text.trim().toLowerCase(),
        );
      }
      if (!habItem) {
        newItems.push(ci.text);
      } else if (ci.checked && !habItem.completed) {
        scoreItemIds.push(habItem.id);
      }
    }

    const parsedSubIds = new Set(parsedItems.map(ci => ci.subId).filter(Boolean) as string[]);
    const deletedItemIds = existingChecklist
      .filter(hci => !parsedSubIds.has(hci.id))
      .map(hci => hci.id);

    return { newItems, scoreItemIds, editItems, deletedItemIds };
  }

  /**
   * Partitions registry tasks by type into personal/group buckets.
   * Replaces 8 individual filterActive calls in _renderAndWrite.
   */
  private _partitionTasksByType(
    registry: TaskRegistry,
    scoredIds: Set<string>,
  ): Record<string, { personal: HabiticaTask[]; group: HabiticaTask[] }> {
    const types = ['daily', 'todo', 'reward', 'habit'] as const;
    const result: Record<string, { personal: HabiticaTask[]; group: HabiticaTask[] }> = {};
    for (const type of types) {
      result[type] = {
        personal: filterActive(registry.personal, type as HabiticaTask['type'], scoredIds),
        group: filterActive(registry.group, type as HabiticaTask['type'], scoredIds),
      };
    }
    return result;
  }

  // ── Step 4: managed-task sync ──────────────────────────────────────────

  /**
   * Step 4: single pass over managed task lines. Checklist changes (create/score) and field updates (text, priority, due, notes, tags) are collected in one loop and only fire when `allowUpdates` is `true`. All mutating requests are serialised by {@link HabiticaApiClient}'s internal queue with 2,200 ms spacing (matching Habitica's 30 req/min limit). Auto-sync performs no Habitica mutations here.
   */
  private async _syncManagedTasks(ctx: SyncContext, entries: import('./sync-file-model').SyncFileEntry[]): Promise<void> {
    try {
      const debug = this.apiClient.isDebugEnabled;
      const reverseIndex = this._buildReverseIndex(ctx);
      const managed = entries.filter(e => e.kind === 'managed');

      for (const item of managed) {
        const parsed = parseManagedTaskLine(item.raw, item.section, reverseIndex, item.notes, item.checklistItems);
        if (!parsed.id) continue;

        const habiticaTask = ctx.registry.findById(parsed.id);
        if (!habiticaTask) continue;

        // Phase 14: task deletion — [delete::] sentinel on managed line
        if (parsed.delete) {
          const isGroupTask = ctx.registry.group.some(t => t.id === parsed.id);
          if (isGroupTask) {
            console.warn(`habitica-fullsync SyncManager._syncManagedTasks: skipping deletion of group/challenge task ${parsed.id} — Habitica API returns 401 for these tasks.`);
            ctx.report.skippedDeletions++;
            continue;
          }
          if (!ctx.config.allowUpdates) continue; // auto-sync never deletes
          try {
            await this.apiClient.deleteTask(parsed.id);
            ctx.registry.remove(parsed.id);
            ctx.report.deletedCount++;
            if (debug) console.debug(`[hf:delete] deleted task ${parsed.id}`);
          } catch (err: any) {
            if (err?.message?.includes('401')) {
              console.warn(`habitica-fullsync SyncManager._syncManagedTasks: cannot delete task ${parsed.id} (401 — likely challenge/group task).`);
              ctx.report.skippedDeletions++;
            } else {
              console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to delete task ${parsed.id}:`, err);
            }
          }
          continue; // skip checklist/update processing for deleted tasks
        }

        const existingChecklist = Array.isArray(habiticaTask.checklist) ? habiticaTask.checklist : [];

        // Pure diff — what changed in the checklist?
        const diff = this._diffChecklistItems(parsed.checklistItems, existingChecklist);

        let taskChecklistUpdated = false;
        if (ctx.config.allowUpdates) {
          for (const text of diff.newItems) {
            try {
              const updated = await this.apiClient.addChecklistItem(parsed.id, text);
              if (Array.isArray(updated.checklist)) {
                ctx.registry.updateChecklist(parsed.id, updated.checklist);
                taskChecklistUpdated = true;
              }
              ctx.report.checklistAddedCount++;
            } catch (err) {
              console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to add checklist item to ${parsed.id}:`, err);
            }
          }
          for (const itemId of diff.scoreItemIds) {
            try {
              const updated = await this.apiClient.scoreChecklistItem(parsed.id, itemId);
              if (Array.isArray(updated.checklist)) {
                ctx.registry.updateChecklist(parsed.id, updated.checklist);
                taskChecklistUpdated = true;
              }
              ctx.report.checklistScoredCount++;
            } catch (err) {
              console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to score checklist item ${itemId} on task ${parsed.id}:`, err);
            }
          }
          for (const { itemId, text } of diff.editItems) {
            try {
              const updated = await this.apiClient.updateChecklistItem(parsed.id, itemId, text);
              if (updated && Array.isArray(updated.checklist)) {
                ctx.registry.updateChecklist(parsed.id, updated.checklist);
                taskChecklistUpdated = true;
              }
              ctx.report.checklistUpdatedCount++;
            } catch (err) {
              console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to update checklist item ${itemId} on task ${parsed.id}:`, err);
            }
          }
          for (const itemId of diff.deletedItemIds) {
            try {
              const updated = await this.apiClient.deleteChecklistItem(parsed.id, itemId);
              if (updated && Array.isArray(updated.checklist)) {
                ctx.registry.updateChecklist(parsed.id, updated.checklist);
                taskChecklistUpdated = true;
              } else {
                // null = already deleted (404), update registry optimistically
                const filtered = existingChecklist.filter(hci => hci.id !== itemId);
                ctx.registry.updateChecklist(parsed.id, filtered);
                taskChecklistUpdated = true;
              }
              ctx.report.checklistDeletedCount++;
            } catch (err) {
              console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to delete checklist item ${itemId} on task ${parsed.id}:`, err);
            }
          }
        }

        const currentChecklist = taskChecklistUpdated
          ? (ctx.registry.findById(parsed.id)?.checklist ?? existingChecklist)
          : existingChecklist;

        if (!ctx.config.allowUpdates) continue;

        // Tag diff — create any unknown tags before comparing sets
        const updateTagIds = await this._createTagsAndRegister(parsed.newTagNames, ctx, reverseIndex, '_syncManagedTasks');
        parsed.tagIds.push(...updateTagIds);

        const updates: Record<string, unknown> = {};

        // Field diff — delegated to FIELD_REGISTRY (F4).
        // Each registry entry declares its own diff logic; the loop compares
        // the parsed Markdown value against the Habitica server value and
        // returns [apiKey, value] if changed. Sentinel fields (delete) are
        // skipped — they trigger DELETE, not PUT.
        for (const def of FIELD_REGISTRY) {
          if (def.type === 'sentinel') continue;
          // Map registry name to parsed field name ('tags' → 'tagIds' on ManagedTaskFields)
          const parsedKey = def.name === 'tags' ? 'tagIds' : def.name;
          const parsedVal = (parsed as any)[parsedKey];
          const habVal = (habiticaTask as any)[def.name];
          const result = def.diff(parsedVal, habVal, habiticaTask);
          if (result) updates[result[0]] = result[1];
        }

        if (Object.keys(updates).length > 0) {
          try {
            const updated = await this.apiClient.updateTask(parsed.id, updates);
            ctx.registry.updateInPlace(parsed.id, updated, currentChecklist.length > 0 ? currentChecklist : undefined);
            ctx.report.updatedCount++;
          } catch (err) {
            console.error(`habitica-fullsync SyncManager._syncManagedTasks: failed to update task ${parsed.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('habitica-fullsync SyncManager._syncManagedTasks:', err);
    }
  }

  /** Step 5: filter active tasks, render the grouped Markdown document, write the output file. */
  private async _renderAndWrite(ctx: SyncContext): Promise<void> {
    const { groupId, outputFolder } = ctx.config;
    const grouped = this._partitionTasksByType(ctx.registry, ctx.scoredIds);

    // Section definitions — iterate instead of destructuring 8 variables (S2).
    const sectionDefs: Array<{ title: string; type: HabiticaTask['type'] }> = [
      { title: 'Dailies', type: 'daily' },
      { title: 'To-Dos', type: 'todo' },
      { title: 'Rewards', type: 'reward' },
      { title: 'Habits', type: 'habit' },
    ];

    let totalRendered = 0;
    const breakdownParts: string[] = [];

    const output = [
      `# Habitica Sync — ${ctx.config.TODAY}`,
      // placeholder — replaced after the loop
      ``,
      ``,
    ];

    const dataviewSource = outputFolder ? normalizePath(`${outputFolder}/habitica-fullsync`) : 'habitica-fullsync';

    for (const { title, type } of sectionDefs) {
      const personal = grouped[type].personal;
      const group = grouped[type].group;
      const count = personal.length + group.length;
      totalRendered += count;
      breakdownParts.push(`${count} ${title.toLowerCase()}`);

      output.push(`## ${title}`);
      output.push(...formatTasks(personal, ctx.tagLookup, ctx.config.TODAY));
      if (groupId) {
        output.push('');
        output.push('### Group Tasks');
        output.push(...formatTasks(group, ctx.tagLookup, ctx.config.TODAY));
      }
      output.push('');
      output.push(buildDataviewBlock(type, dataviewSource));
      output.push('');
    }

    output[1] = `*${totalRendered} active tasks: ${breakdownParts.join(' · ')}*`;

    await this.vaultHandler.ensureFolder(outputFolder);
    await this.vaultHandler.writeFile(ctx.config.filePath, output.join('\n'));
  }

  /**
   * Creates any unknown Habitica tags and registers them in the lookup maps. Returns the array of newly created tag ids so callers can push them onto their own tag-id list. Extracted from the verbatim duplication in `_createNewTasks` and `_syncManagedTasks`.
   */
  private async _createTagsAndRegister(
    newTagNames: string[],
    ctx: SyncContext,
    reverseIndex: Record<string, string>,
    callerName: string,
  ): Promise<string[]> {
    const createdIds: string[] = [];
    for (const name of newTagNames) {
      try {
        const tag = await this.apiClient.createTag(name);
        ctx.tagLookup[tag.id] = tag.name;
        reverseIndex[normalizeTagKey(tag.name)] = tag.id;
        createdIds.push(tag.id);
      } catch (err) {
        console.error(`habitica-fullsync SyncManager.${callerName}: failed to create tag:`, err);
      }
    }
    return createdIds;
  }
}
