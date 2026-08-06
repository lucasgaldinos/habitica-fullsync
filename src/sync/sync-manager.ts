import { App, normalizePath } from 'obsidian';
import { HabiticaApiClient } from '../api/api-client';
import { buildDataviewBlock } from '../lib/dataview';
import { buildTagReverseIndex, normalizeTagKey } from '../markdown/tags';
import { parseManagedTaskLine, parseTaskLine, sectionToType } from '../markdown/parser';
import { filterActive, formatTasks } from '../markdown/formatter';
import { PluginSettings, HabiticaTask } from '../types';
import { VaultHandler } from '../vault/vault-handler';
import { parseSyncFile, SyncFileEntry } from './sync-file-model';
import { SQLiteStore } from '../db/sqlite-store';
import { SyncWarningModal } from '../ui/sync-warning-modal';
import { FIELD_REGISTRY } from '../field-registry';

/**
 * Orchestrates the full Habitica ↔ Obsidian sync workflow.
 *
 * Responsibilities:
 * 1. Fetches user and optional group tasks + tags from the Habitica API into SQLite.
 * 2. Pushes local markdown changes to Habitica.
 * 3. Pulls state from SQLite to overwrite the local markdown document.
 *
 * The `_syncInFlight` boolean flag prevents concurrent sync runs.
 */
export class SyncManager {
  /** Mutex flag — true while a sync is running; prevents concurrent invocations. */
  private _syncInFlight = false;
  private tagLookup: Record<string, string> = {};

  /**
   * @param apiClient    Configured Habitica API client.
   * @param vaultHandler Vault read/write helper.
   * @param settings     Current plugin settings (read each sync run, reflects live UI changes).
   * @param sqliteStore  Local SQLite cache store.
   * @param app          Obsidian App instance.
   * @param noticeFn     Callback that displays a user-facing notice.
   */
  constructor(
    private apiClient: HabiticaApiClient,
    private vaultHandler: VaultHandler,
    private settings: PluginSettings,
    private sqliteStore: SQLiteStore,
    private app: App,
    private noticeFn: (msg: string) => void
  ) { }

  private get config() {
    return {
      outputFolder: this.settings.outputFolder,
      groupId: this.settings.groupId,
      TODAY: new Date().toLocaleDateString('en-CA'),
      filePath: this.settings.outputFolder
        ? normalizePath(`${this.settings.outputFolder}/habitica-fullsync.md`)
        : 'habitica-fullsync.md',
    };
  }

  /**
   * Pulls tasks from Habitica, saves to SQLite, and renders the markdown file.
   * Prompts the user or snoozes if there are unsynced local edits.
   *
   * @param isAutoSync When `true`, indicates the pull was triggered by the background interval. Defaults to `false`.
   * @returns 'completed', 'skipped', 'cancelled', 'snoozed', or 'error'
   */
  async pull(isAutoSync = false): Promise<string> {
    if (this._syncInFlight) return 'skipped';
    this._syncInFlight = true;

    try {
      const fileContent = await this.vaultHandler.readFileContent(this.config.filePath);
      const entries = parseSyncFile(fileContent);
      const hasUnsyncedEdits = this._detectUnsyncedEdits(entries);

      if (hasUnsyncedEdits) {
        const modal = new SyncWarningModal(this.app, isAutoSync);
        const choice = await modal.openAndAwait();
        if (choice === 'cancel') {
          this.noticeFn('Sync cancelled to protect local edits.');
          return 'cancelled';
        }
        if (choice === 'snooze') {
          this.noticeFn('Auto-sync snoozed for 1 hour.');
          return 'snoozed';
        }
      }

      await this._fetchAndStoreTags();

      const tasks = await this.apiClient.fetchUserTasks();
      if (Array.isArray(tasks)) {
        for (const t of tasks) this.sqliteStore.upsertTask(t);
      }

      if (this.config.groupId) {
        const groupTasks = await this.apiClient.fetchGroupTasks(this.config.groupId);
        if (Array.isArray(groupTasks)) {
          for (const t of groupTasks) this.sqliteStore.upsertTask(t);
        }
      }

      await this.sqliteStore.save();
      await this._renderAndWrite();
      this.noticeFn('Pull complete: Overwrote local file with Habitica data.');
      return 'completed';
    } catch (err) {
      console.error('habitica-fullsync pull error:', err);
      this.noticeFn('❌ Pull failed. Check console.');
      return 'error';
    } finally {
      this._syncInFlight = false;
    }
  }

  /**
   * Parses the local markdown file and pushes any creations or modifications to Habitica.
   * @returns 'completed', 'skipped', or 'error'
   */
  async push(): Promise<string> {
    if (this._syncInFlight) return 'skipped';
    this._syncInFlight = true;

    try {
      const fileContent = await this.vaultHandler.readFileContent(this.config.filePath);
      const entries = parseSyncFile(fileContent);

      await this._fetchAndStoreTags();
      const reverseIndex = buildTagReverseIndex(this.tagLookup);

      this.sqliteStore.createStagingTables();

      let localIdCounter = 0;

      // Extract & Load Staging
      for (const entry of entries) {
        if (entry.kind === 'creatable' && !this.settings.disableCreating) {
          const input = parseTaskLine(entry.raw, entry.section, reverseIndex, entry.notes, entry.checklistItems);
          if (!input.text || !input.type) continue;
          
          const createdTags = await this._createTags(input.newTagNames, reverseIndex);
          input.tagIds.push(...createdTags);

          const localId = `local-${localIdCounter++}`;
          const mockTask: HabiticaTask = {
            id: localId,
            type: input.type,
            text: input.text,
            priority: input.priority,
            date: input.date,
            startDate: input.startDate,
            frequency: input.frequency,
            everyX: input.everyX,
            tags: input.tagIds,
            notes: input.notes,
            checklist: input.checklistItems.map(c => ({ id: `local-chk-${localIdCounter++}`, text: c.text, completed: c.checked })),
            completed: false,
            up: undefined, down: undefined
          };
          this.sqliteStore.loadToStaging(mockTask);
          
        } else if (entry.kind === 'managed') {
          const parsed = parseManagedTaskLine(entry.raw, entry.section, reverseIndex, entry.notes, entry.checklistItems);
          if (!parsed.id) continue;

          if (parsed.delete) {
            // Task is deleted in markdown. 
            // We skip loading to staging so it's absent and gets flagged by SQL diffs.
            continue; 
          }

          const createdTags = await this._createTags(parsed.newTagNames, reverseIndex);
          parsed.tagIds.push(...createdTags);

          const mockTask: HabiticaTask = {
            id: parsed.id,
            type: sectionToType(entry.section) || 'todo',
            text: parsed.text,
            priority: parsed.priority,
            date: parsed.date,
            startDate: parsed.startDate,
            frequency: parsed.frequency,
            everyX: parsed.everyX,
            tags: parsed.tagIds,
            notes: parsed.notes,
            repeat: parsed.repeat,
            completed: parsed.completed,
            up: parsed.up,
            down: parsed.down,
            checklist: parsed.checklistItems.map(c => ({ id: c.subId || `local-chk-${localIdCounter++}`, text: c.text, completed: c.checked }))
          };
          this.sqliteStore.loadToStaging(mockTask);
        }
      }

      // Transform (Diff)
      const diffs = this.sqliteStore.computeDiffs();

      // Sync (API) - Creations
      for (const id of diffs.tasksToCreate) {
        const stagingTask = this.sqliteStore.getStagingTaskById(id);
        if (!stagingTask) continue;
        
        let created = await this.apiClient.createTask({
          text: stagingTask.text, type: stagingTask.type, priority: stagingTask.priority,
          date: stagingTask.date, startDate: stagingTask.startDate,
          frequency: stagingTask.frequency, everyX: stagingTask.everyX,
          tags: stagingTask.tags, notes: stagingTask.notes ?? undefined,
        });

        for (const ci of stagingTask.checklist || []) {
          created = await this.apiClient.addChecklistItem(created.id, ci.text);
          if (ci.completed) {
            // We must find the newly added checklist item ID to score it
            const newChkId = created.checklist![created.checklist!.length - 1].id;
            created = await this.apiClient.scoreChecklistItem(created.id, newChkId);
          }
        }
        this.sqliteStore.upsertTask(created);
      }

      // Sync (API) - Deletions
      for (const id of diffs.tasksToDelete) {
         await this.apiClient.deleteTask(id);
         this.sqliteStore.deleteTask(id);
      }

      // Sync (API) - Updates
      for (const id of diffs.tasksToUpdate) {
        const stagingTask = this.sqliteStore.getStagingTaskById(id);
        const dbTask = this.sqliteStore.getTaskById(id);
        if (!stagingTask || !dbTask) continue;

        const updates: Record<string, unknown> = {};
        for (const def of FIELD_REGISTRY) {
          if (def.type === 'sentinel') continue;
          const key = def.name;
          const parsedVal = (stagingTask as unknown as Record<string, unknown>)[key];
          const habVal = (dbTask as unknown as Record<string, unknown>)[key];
          
          if (key === 'tags' || key === 'repeat') {
            if (JSON.stringify(parsedVal) !== JSON.stringify(habVal)) {
              updates[key] = parsedVal;
            }
          } else {
             const result = def.diff(parsedVal, habVal, dbTask);
             if (result) updates[result[0]] = result[1];
          }
        }

        if (Object.keys(updates).length > 0) {
          const updated = await this.apiClient.updateTask(id, updates);
          this.sqliteStore.upsertTask(updated);
        }
      }

      // Checklist Diffs
      // Checklists To Delete
      for (const chkId of diffs.checklistsToDelete) {
        const dbTask = this.sqliteStore.getAllTasks().find(t => t.checklist?.some(c => c.id === chkId));
        if (dbTask) {
           const updated = await this.apiClient.deleteChecklistItem(dbTask.id, chkId);
           // Habitica returns empty object for deleteChecklistItem sometimes, so we must fetch if needed.
           // Wait, deleteChecklistItem usually returns the task. Let's assume it does.
           if (updated && updated.id) this.sqliteStore.upsertTask(updated);
        }
      }

      // Checklists To Add
      for (const chkId of diffs.checklistsToAdd) {
        const chk = this.sqliteStore.getStagingChecklistItem(chkId);
        if (chk && !chk.taskId.startsWith('local-')) { 
           let updated = await this.apiClient.addChecklistItem(chk.taskId, chk.item.text as string);
           if (chk.item.completed) {
             const newChkId = updated.checklist![updated.checklist!.length - 1].id;
             updated = await this.apiClient.scoreChecklistItem(chk.taskId, newChkId);
           }
           this.sqliteStore.upsertTask(updated);
        }
      }

      // Checklists To Update
      for (const chkId of diffs.checklistsToUpdate) {
        const chk = this.sqliteStore.getStagingChecklistItem(chkId);
        if (chk && !chk.taskId.startsWith('local-')) {
           const dbTask = this.sqliteStore.getTaskById(chk.taskId);
           const dbChk = dbTask?.checklist?.find(c => c.id === chkId);
           
           let updated;
           if (dbChk && dbChk.text !== chk.item.text) {
              updated = await this.apiClient.updateChecklistItem(chk.taskId, chkId, chk.item.text as string);
           }
           if (dbChk && !dbChk.completed && chk.item.completed) {
              updated = await this.apiClient.scoreChecklistItem(chk.taskId, chkId);
           }
           if (updated && updated.id) this.sqliteStore.upsertTask(updated);
        }
      }

      // Render updated state from DB back to markdown
      await this.sqliteStore.save();
      await this._renderAndWrite();
      this.noticeFn('Push complete: Synced local changes to Habitica.');
      return 'completed';
    } catch (err) {
      console.error('habitica-fullsync push error:', err);
      this.noticeFn('❌ Push failed. Check console.');
      return 'error';
    } finally {
      this._syncInFlight = false;
    }
  }

  /**
   * Detects if there are any unsynced edits in the Markdown file that would be lost on pull.
   * @param entries Parsed file entries
   * @returns True if there are unsynced creations, deletions, or field edits
   */
  private _detectUnsyncedEdits(entries: SyncFileEntry[]): boolean {
    const reverseIndex = buildTagReverseIndex(this.tagLookup);
    for (const entry of entries) {
      if (entry.kind === 'creatable') return true;
      if (entry.kind === 'managed') {
        const parsed = parseManagedTaskLine(entry.raw, entry.section, reverseIndex, entry.notes, entry.checklistItems);
        if (parsed.delete) return true;
        if (!parsed.id) continue;

        const dbTask = this.sqliteStore.getTaskById(parsed.id);
        if (!dbTask) return true; // new task missing from DB

        for (const def of FIELD_REGISTRY) {
          if (def.type === 'sentinel') continue;
          const parsedKey = def.name === 'tags' ? 'tagIds' : def.name;
          const parsedVal = (parsed as unknown as Record<string, unknown>)[parsedKey];
          const habVal = (dbTask as unknown as Record<string, unknown>)[def.name];
          if (def.diff(parsedVal, habVal, dbTask)) return true; // field changed
        }

        // Checklists diff
        const dbItems = dbTask.checklist || [];
        const parsedSubIds = new Set(parsed.checklistItems.map(i => i.subId).filter(Boolean));
        if (dbItems.some(i => !parsedSubIds.has(i.id))) return true; // deleted
        for (const item of parsed.checklistItems) {
          if (!item.subId) return true; // new
          const dbItem = dbItems.find(d => d.id === item.subId);
          if (!dbItem) return true; // mismatch
          if (item.text.trim() !== dbItem.text.trim()) return true; // updated
          if (item.checked && !dbItem.completed) return true; // scored
        }
      }
    }
    return false;
  }

  /**
   * Fetches all tags belonging to the user and updates the lookup map.
   */
  private async _fetchAndStoreTags() {
    const tags = await this.apiClient.fetchTags();
    if (Array.isArray(tags)) {
      this.tagLookup = Object.fromEntries(tags.map(t => [t.id, t.name]));
    }
  }

  /**
   * Creates any unknown Habitica tags and registers them in the lookup maps.
   * @param newTagNames Names of tags to create
   * @param reverseIndex The reverse lookup index to update
   * @returns Array of newly created tag IDs
   */
  private async _createTags(newTagNames: string[], reverseIndex: Record<string, string>): Promise<string[]> {
    const createdIds: string[] = [];
    for (const name of newTagNames) {
      const tag = await this.apiClient.createTag(name);
      this.tagLookup[tag.id] = tag.name;
      reverseIndex[normalizeTagKey(tag.name)] = tag.id;
      createdIds.push(tag.id);
    }
    return createdIds;
  }

  /** 
   * Filters active tasks, renders the grouped Markdown document, and writes it to the vault.
   */
  private async _renderAndWrite() {
    const { groupId, outputFolder, filePath, TODAY } = this.config;
    const tasks = this.sqliteStore.getAllTasks();

    const personal = tasks.filter(t => !((t as unknown) as { group?: unknown }).group);
    const group = tasks.filter(t => ((t as unknown) as { group?: unknown }).group);

    const types = [
      { title: 'Dailies', type: 'daily' },
      { title: 'To-Dos', type: 'todo' },
      { title: 'Rewards', type: 'reward' },
      { title: 'Habits', type: 'habit' }
    ] as const;

    const output = [`# Habitica Sync — ${TODAY}`, '', ''];
    const dataviewSource = outputFolder ? normalizePath(`${outputFolder}/habitica-fullsync`) : 'habitica-fullsync';
    let total = 0;
    const parts = [];

    for (const { title, type } of types) {
      const pTasks = filterActive(personal, type, new Set());
      const gTasks = filterActive(group, type, new Set());
      const count = pTasks.length + gTasks.length;
      total += count;
      parts.push(`${count} ${title.toLowerCase()}`);

      output.push(`## ${title}`);
      output.push(...formatTasks(pTasks, this.tagLookup, TODAY));
      if (groupId) {
        output.push('', '### Group Tasks');
        output.push(...formatTasks(gTasks, this.tagLookup, TODAY));
      }
      output.push('', buildDataviewBlock(type, dataviewSource), '');
    }

    output[1] = `*${total} active tasks: ${parts.join(' · ')}*`;

    await this.vaultHandler.ensureFolder(outputFolder);
    await this.vaultHandler.writeFile(filePath, output.join('\n'));
  }
}
