import { HabiticaApiClient } from './api-client';
import { buildDataviewBlock, buildTagReverseIndex, filterActive, formatTasks, normalizeTagKey, parseTaskLine } from './helpers';
import { PluginSettings, HabiticaTask, HabiticaTag } from './types';
import { VaultHandler } from './vault-handler';

/**
 * Orchestrates the full Habitica ↔ Obsidian sync workflow.
 *
 * Responsibilities:
 * 1. Fetches user and optional group tasks + tags from the Habitica API.
 * 2. Scans the vault for recently completed tasks; scores them in Habitica and
 *    marks them `%%scored%%` in the vault to prevent double-scoring.
 * 3. Creates new Habitica tasks for vault-completed items without an existing ID
 *    (when `disableCreating` is `false`).
 * 4. Builds a Markdown document grouping tasks by type and source.
 * 5. Writes the document to `outputFolder/habitica-fullsync.md`.
 *
 * The `_syncInFlight` boolean flag prevents concurrent sync runs when auto-sync
 * fires while a manual sync is already in progress.
 */
export class SyncManager {
  private apiClient: HabiticaApiClient;
  private vaultHandler: VaultHandler;
  private settings: PluginSettings;
  private noticeFn: (msg: string) => void;
  /** Mutex flag — `true` while a sync is running; prevents concurrent invocations. */
  private _syncInFlight: boolean;

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
   * Runs a full Habitica ↔ Obsidian sync.
   *
   * **Concurrency:** Returns immediately if `_syncInFlight` is already `true`. The flag is
   * reset in `finally` so a thrown error never permanently locks out future syncs.
   *
   * **Sync steps (in order):**
   * 1. Fetch user tasks, tags, and (if configured) group tasks from Habitica.
   * 2. Pre-pass: scan the sync output file for `todo`/`daily` tasks the user checked off
   *    directly in Obsidian. Score those in Habitica and add to `scoredIds`.
   *    (Habits and rewards are skipped here — habits don't become `completed: true` after
   *    scoring, so they would re-score on every sync until the file is regenerated.)
   * 3. General vault scan: find tasks completed in the last 4 days that have a
   *    `[completion:: YYYY-MM-DD]` field and no `%%scored%%` marker. Score them, write
   *    `%%scored%%` back to the vault line. IDs already in `scoredIds` are skipped.
   * 4. For completed tasks without an ID (and `disableCreating === false`): create a new
   *    Habitica to-do, score it, and write the assigned ID back to the vault line.
   * 5. Build a Markdown output document grouped by task type and source.
   * 6. Write the document to `outputFolder/habitica-fullsync.md`.
   * 7. Show a success or failure notice.
   */
  async sync(): Promise<void> {
    if (this._syncInFlight) {
      console.warn('habitica-fullsync SyncManager.sync: sync already in progress, skipping.');
      return;
    }
    this._syncInFlight = true;
    const { groupId, outputFolder, disableScoring, disableCreating } = this.settings;
    const TODAY = new Date().toLocaleDateString('en-CA');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 4);
    const filePath = outputFolder ? `${outputFolder}/habitica-fullsync.md` : 'habitica-fullsync.md';

    try {
      const rawTasks = await this.apiClient.fetchUserTasks();
      const tasks = Array.isArray(rawTasks) ? rawTasks : [];
      const tags = await this.apiClient.fetchTags();
      const rawTags = Array.isArray(tags) ? tags : [];
      const tagLookup = Object.fromEntries(rawTags.map((tag: HabiticaTag) => [tag.id, tag.name]));
      let groupTasks: HabiticaTask[] = [];
      if (groupId) {
        try {
          const rawGroupTasks = await this.apiClient.fetchGroupTasks(groupId);
          groupTasks = Array.isArray(rawGroupTasks) ? rawGroupTasks : [];
        } catch (err) {
          console.error('habitica-fullsync SyncManager.sync: failed to fetch group tasks:', err);
        }
      }
      const allTasks = [...tasks, ...groupTasks];
      const scoredIds = new Set<string>();

      if (!disableScoring) {
        // Pre-pass: score todo/daily tasks checked off directly in the sync output file.
        // Only todo/daily are included because Habitica marks them completed: true after scoring,
        // providing idempotency on re-sync. Habits/rewards are excluded for safety.
        const syncFileChecked = await this.vaultHandler.getCheckedTasksFromFile(filePath);
        for (const { id } of syncFileChecked) {
          const habiticaTask = allTasks.find(t => t.id === id);
          if (!habiticaTask || habiticaTask.completed) continue;
          if (habiticaTask.type !== 'todo' && habiticaTask.type !== 'daily') continue;
          try {
            await this.apiClient.scoreTask(id, 'up');
            scoredIds.add(id);
          } catch (err) {
            console.error(`habitica-fullsync SyncManager.sync: failed to score sync-file task ${id}:`, err);
          }
        }

        // General vault scan: score recently completed tasks that have [completion::] and no %%scored%%
        const completedTasks = await this.vaultHandler.getRecentCompletedTasks(cutoffDate);
        for (const task of completedTasks) {
          const match = task.line.match(/\[id:: ([^\]]+)\]/);
          if (match) {
            const id = match[1];
            if (scoredIds.has(id)) continue; // already scored in pre-pass
            const habiticaTask = allTasks.find(t => t.id === id);
            if (!habiticaTask || habiticaTask.completed) continue;
            let direction = 'up';
            if (habiticaTask.type === 'habit') {
              direction = habiticaTask.up ? 'up' : habiticaTask.down ? 'down' : 'up';
            }
            try {
              await this.apiClient.scoreTask(id, direction);
              scoredIds.add(id);
              await this.vaultHandler.updateLine(task.file, task.line + ' %%scored%%');
            } catch (err) {
              console.error(`habitica-fullsync SyncManager.sync: failed to score vault task ${id}:`, err);
            }
          } else if (!disableCreating) {
            const text = task.line.replace(/^- \[x\]\s*/, '').split(' [')[0];
            try {
              const newTask = await this.apiClient.createTask({ text, type: 'todo' });
              await this.apiClient.scoreTask(newTask.id, 'up');
              scoredIds.add(newTask.id);
              const newLine = task.line + ` [id:: ${newTask.id}] %%scored%%`;
              await this.vaultHandler.updateLine(task.file, newLine);
            } catch (err) {
              console.error('habitica-fullsync SyncManager.sync: failed to create and score new task:', err);
            }
          }
        }
      }

      // Creation pre-pass: create Habitica tasks from hand-written `- [ ]` lines (no [id::])
      // in the sync file. Type is inferred from the section heading. Created tasks are pushed
      // into `tasks` so they render with their new id in this run's regenerated output, and the
      // id is written back to the source line immediately for crash-safe idempotency.
      let createdCount = 0;
      let createFailures = 0;
      if (!disableCreating) {
        const reverseIndex = buildTagReverseIndex(tagLookup);
        const creatable = await this.vaultHandler.getCreatableLinesFromFile(filePath);
        for (const item of creatable) {
          try {
            const input = parseTaskLine(item.line, item.section, reverseIndex, item.notes, item.checklistTexts);
            if (!input.text) {
              console.warn(`habitica-fullsync SyncManager.sync: skipping creatable line with empty title: ${item.line}`);
              continue;
            }
            // Create any unknown tags first, registering them for reuse within this run
            for (const name of input.newTagNames) {
              try {
                const tag = await this.apiClient.createTag(name);
                tagLookup[tag.id] = tag.name;
                reverseIndex[normalizeTagKey(tag.name)] = tag.id;
                input.tagIds.push(tag.id);
              } catch (err) {
                console.error(`habitica-fullsync SyncManager.sync: failed to create tag "${name}":`, err);
              }
            }
            const created = await this.apiClient.createTask({
              text: input.text,
              type: input.type,
              priority: input.priority,
              date: input.date,
              startDate: input.startDate,
              frequency: input.frequency,
              tags: input.tagIds,
              notes: input.notes,
            });
            // Add checklist items parsed from nested lines so they are not lost on regeneration
            let checklist = Array.isArray(created.checklist) ? created.checklist : [];
            for (const ctext of input.checklistTexts) {
              try {
                const updated = await this.apiClient.addChecklistItem(created.id, ctext);
                if (Array.isArray(updated.checklist)) checklist = updated.checklist;
              } catch (err) {
                console.error(`habitica-fullsync SyncManager.sync: failed to add checklist item to ${created.id}:`, err);
              }
            }
            // Merge submitted fields over the response so all metadata renders even if the
            // create response omits some fields.
            const merged: HabiticaTask = {
              ...created,
              tags: Array.isArray(created.tags) ? created.tags : input.tagIds,
              notes: created.notes ?? input.notes ?? null,
              checklist,
            };
            tasks.push(merged);
            // Crash-safe write-back of the assigned id (regeneration overwrites this later).
            await this.vaultHandler.updateLineInFile(filePath, item.line, `${item.line} [id:: ${created.id}]`);
            createdCount++;
          } catch (err) {
            createFailures++;
            console.error(`habitica-fullsync SyncManager.sync: failed to create task from line "${item.line}":`, err);
          }
        }
      }

      const dailiesPersonal = filterActive(tasks, 'daily', scoredIds);
      const todosPersonal = filterActive(tasks, 'todo', scoredIds);
      const rewardsPersonal = filterActive(tasks, 'reward', scoredIds);
      const habitsPersonal = filterActive(tasks, 'habit', scoredIds);
      const dailiesGroup = filterActive(groupTasks, 'daily', scoredIds);
      const todosGroup = filterActive(groupTasks, 'todo', scoredIds);
      const rewardsGroup = filterActive(groupTasks, 'reward', scoredIds);
      const habitsGroup = filterActive(groupTasks, 'habit', scoredIds);

      const totalRendered = dailiesPersonal.length + dailiesGroup.length
        + todosPersonal.length + todosGroup.length
        + rewardsPersonal.length + rewardsGroup.length
        + habitsPersonal.length + habitsGroup.length;

      const breakdown = [
        `${dailiesPersonal.length + dailiesGroup.length} dailies`,
        `${todosPersonal.length + todosGroup.length} to-dos`,
        `${rewardsPersonal.length + rewardsGroup.length} rewards`,
        `${habitsPersonal.length + habitsGroup.length} habits`,
      ].join(' · ');

      const output = [
        `## Habitica Sync — ${TODAY}`,
        `*${totalRendered} active tasks: ${breakdown}*`,
        ``
      ];

      // Dataview source path: the sync file without its .md extension
      const dataviewSource = outputFolder ? `${outputFolder}/habitica-fullsync` : 'habitica-fullsync';

      // Only render Group Tasks subsection when a groupId is configured
      const writeSection = (title: string, type: HabiticaTask['type'], personal: HabiticaTask[], group: HabiticaTask[]) => {
        output.push(`### ${title}`);
        output.push(...formatTasks(personal, tagLookup, TODAY));
        if (groupId) {
          output.push('');
          output.push('#### Group Tasks');
          output.push(...formatTasks(group, tagLookup, TODAY));
        }
        output.push('');
        output.push(buildDataviewBlock(type, dataviewSource));
        output.push('');
      };

      writeSection('Dailies', 'daily', dailiesPersonal, dailiesGroup);
      writeSection('To-Dos', 'todo', todosPersonal, todosGroup);
      writeSection('Rewards', 'reward', rewardsPersonal, rewardsGroup);
      writeSection('Habits', 'habit', habitsPersonal, habitsGroup);

      await this.vaultHandler.ensureFolder(outputFolder);
      await this.vaultHandler.writeFile(filePath, output.join('\n'));

      let createSummary = '';
      if (createdCount > 0) createSummary += ` — created ${createdCount} task${createdCount === 1 ? '' : 's'}`;
      if (createFailures > 0) createSummary += `, ${createFailures} failed (see console)`;
      this.noticeFn(`✅ Habitica sync complete: ${filePath}${createSummary}`);
    } catch (err) {
      console.error('habitica-fullsync SyncManager.sync:', err);
      this.noticeFn('❌ Habitica sync failed. Check console for details.');
    } finally {
      this._syncInFlight = false;
    }
  }
}
