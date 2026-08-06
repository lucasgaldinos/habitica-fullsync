import { App } from 'obsidian';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import sqlWasmBase64 from 'sql.js/dist/sql-wasm.wasm';
import { HabiticaTask } from '../types';
import { schema } from './schema';

interface TaskRow {
  id: string;
  type: string;
  text: string;
  priority: number;
  position: number | null;
  completed: number;
  notes: string | null;
  due: string | null;
  up: number;
  down: number;
  streak: number | null;
  attribute: string | null;
  frequency: string | null;
  everyX: number | null;
  startDate: string | null;
  isGroup: number;
}

interface ChecklistRow {
  id: string;
  text: string;
  completed: number;
}

/**
 * Wrapper for sql.js Database instance. Handles persistence to the Obsidian vault configuration folder.
 */
export class SQLiteStore {
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  private get dbPath(): string {
    return `${this.app.vault.configDir}/plugins/habitica-fullsync/state.sqlite`;
  }

  /**
   * Initializes the SQLite store.
   * Loads the database from disk if it exists, otherwise creates a new one.
   */
  async init(): Promise<void> {
    if (!this.SQL) {
      const binaryString = atob(sqlWasmBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      this.SQL = await initSqlJs({ wasmBinary: bytes.buffer });
    }
    const adapter = this.app.vault.adapter;
    if (await adapter.exists(this.dbPath)) {
      const buffer = await adapter.readBinary(this.dbPath);
      this.db = new this.SQL.Database(new Uint8Array(buffer));
    } else {
      this.db = new this.SQL.Database();
      this.db.run(schema);
      await this.save();
    }
  }

  /**
   * Saves the SQLite database to the vault's configuration directory.
   */
  async save(): Promise<void> {
    if (!this.db) return;
    const data = this.db.export();
    const adapter = this.app.vault.adapter;
    
    // Ensure plugin directory exists before writing
    const dir = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'));
    if (!(await adapter.exists(dir))) {
      await adapter.mkdir(dir);
    }
    // @ts-ignore -- ArrayBuffer types conflict
    await adapter.writeBinary(this.dbPath, data.buffer);
  }

  /**
   * Inserts or updates a task in the database.
   * @param task The task to upsert
   */
  upsertTask(task: HabiticaTask): void {
    if (!this.db) return;
    
    // Replace old record
    const insertTaskStmt = this.db.prepare(`
      REPLACE INTO tasks (
        id, type, text, priority, position, due, notes, up, down, streak,
        attribute, frequency, everyX, startDate, completed, isGroup
      ) VALUES (
        $id, $type, $text, $priority, $position, $due, $notes, $up, $down, $streak,
        $attribute, $frequency, $everyX, $startDate, $completed, $isGroup
      )
    `);

    insertTaskStmt.run({
      $id: task.id,
      $type: task.type,
      $text: task.text,
      $priority: task.priority ?? 1,
      $position: task.position ?? null,
      $due: task.date ?? null,
      $notes: task.notes ?? null,
      $up: task.up ? 1 : 0,
      $down: task.down ? 1 : 0,
      $streak: task.streak ?? null,
      $attribute: task.attribute ?? null,
      $frequency: task.frequency ?? null,
      $everyX: task.everyX ?? null,
      $startDate: task.startDate ?? null,
      $completed: task.completed ? 1 : 0,
      $isGroup: task.group?.id ? 1 : 0
    });
    insertTaskStmt.free();

    // Checklists
    if (Array.isArray(task.checklist)) {
      const delStmt = this.db.prepare('DELETE FROM checklists WHERE task_id = $taskId');
      delStmt.run({ $taskId: task.id });
      delStmt.free();

      const insStmt = this.db.prepare(`
        INSERT INTO checklists (id, task_id, text, completed, position)
        VALUES ($id, $taskId, $text, $completed, $position)
      `);
      
      task.checklist.forEach((item, index) => {
        insStmt.run({
          $id: item.id,
          $taskId: task.id,
          $text: item.text,
          $completed: item.completed ? 1 : 0,
          $position: index
        });
      });
      insStmt.free();
    }

    // Tags
    if (Array.isArray(task.tags)) {
      const delTagsStmt = this.db.prepare('DELETE FROM task_tags WHERE task_id = $taskId');
      delTagsStmt.run({ $taskId: task.id });
      delTagsStmt.free();

      const insTagStmt = this.db.prepare('INSERT OR IGNORE INTO tags (id, name) VALUES ($id, $name)');
      const insTaskTagStmt = this.db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES ($taskId, $tagId)');
      
      task.tags.forEach(tagId => {
        insTagStmt.run({ $id: tagId, $name: tagId }); // Habitica only returns UUID array on task object
        insTaskTagStmt.run({ $taskId: task.id, $tagId: tagId });
      });
      insTagStmt.free();
      insTaskTagStmt.free();
    }

    // Repeat (Dailies)
    if (task.repeat) {
      const delRepStmt = this.db.prepare('DELETE FROM task_repeats WHERE task_id = $taskId');
      delRepStmt.run({ $taskId: task.id });
      delRepStmt.free();

      const insRepStmt = this.db.prepare('INSERT INTO task_repeats (task_id, day, active) VALUES ($taskId, $day, $active)');
      Object.entries(task.repeat).forEach(([day, active]) => {
        insRepStmt.run({ $taskId: task.id, $day: day, $active: active ? 1 : 0 });
      });
      insRepStmt.free();
    }
  }

  /**
   * Deletes a task from the database by ID.
   * @param id The ID of the task to delete
   */
  deleteTask(id: string): void {
    if (!this.db) return;
    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
  }

  /**
   * Retrieves all tasks of a specific type.
   * @param type The type of task (e.g., 'habit', 'daily', 'todo', 'reward')
   * @returns Array of tasks matching the type
   */
  getTasksByType(type: string): HabiticaTask[] {
    if (!this.db) return [];
    
    const tasks: HabiticaTask[] = [];
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE type = $type');
    stmt.bind({ $type: type });
    
    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as TaskRow;
      tasks.push(this.rowToTask(row));
    }
    stmt.free();
    
    return tasks;
  }
  
  /**
   * Retrieves a task by its ID.
   * @param id The ID of the task
   * @returns The task if found, otherwise null
   */
  getTaskById(id: string): HabiticaTask | null {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = $id');
    const row = stmt.getAsObject({ $id: id }) as unknown as TaskRow;
    stmt.free();
    
    if (Object.keys(row).length === 0) return null;
    return this.rowToTask(row);
  }

  /**
   * Retrieves all tasks from the database.
   * @returns Array of all tasks
   */
  getAllTasks(): HabiticaTask[] {
    if (!this.db) return [];
    const tasks: HabiticaTask[] = [];
    const stmt = this.db.prepare('SELECT * FROM tasks');
    
    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as TaskRow;
      tasks.push(this.rowToTask(row));
    }
    stmt.free();
    return tasks;
  }

  /**
   * Converts a database row to a HabiticaTask object.
   * @param row The raw database row
   * @returns The constructed HabiticaTask
   */
  private rowToTask(row: TaskRow): HabiticaTask {
    const task: HabiticaTask = {
      id: row.id,
      type: row.type as 'daily' | 'todo' | 'habit' | 'reward',
      text: row.text,
      priority: row.priority,
      completed: row.completed === 1,
      notes: row.notes || undefined,
      date: row.due || undefined,
      up: row.up ?? undefined,
      down: row.down ?? undefined,
      streak: row.streak || undefined,
      attribute: (row.attribute as 'str' | 'int' | 'per' | 'con') || undefined,
      frequency: row.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
      everyX: row.everyX || undefined,
      startDate: row.startDate || undefined,
    };
    ((task as unknown) as Record<string, unknown>).position = row.position;
    
    if (row.isGroup === 1) {
      ((task as unknown) as { group?: { id: string } }).group = { id: 'dummy' }; // To distinguish group tasks
    }
    
    if (this.db) {
      // Checklists
      const chkStmt = this.db.prepare('SELECT * FROM checklists WHERE task_id = $taskId ORDER BY position ASC');
      chkStmt.bind({ $taskId: task.id });
      const checklist = [];
      while (chkStmt.step()) {
        const cRow = chkStmt.getAsObject() as unknown as ChecklistRow;
        checklist.push({
          id: cRow.id,
          text: cRow.text,
          completed: cRow.completed === 1
        });
      }
      chkStmt.free();
      if (checklist.length > 0) {
        task.checklist = checklist;
      }

      // Tags
      const tagStmt = this.db.prepare('SELECT tag_id FROM task_tags WHERE task_id = $taskId');
      tagStmt.bind({ $taskId: task.id });
      const tags: string[] = [];
      while (tagStmt.step()) {
        tags.push(tagStmt.getAsObject().tag_id as string);
      }
      tagStmt.free();
      if (tags.length > 0) {
        task.tags = tags;
      }

      // Repeats
      const repStmt = this.db.prepare('SELECT day, active FROM task_repeats WHERE task_id = $taskId');
      repStmt.bind({ $taskId: task.id });
      const repeat: Record<string, boolean> = {};
      let hasRepeat = false;
      while (repStmt.step()) {
        const rObj = repStmt.getAsObject();
        repeat[rObj.day as string] = rObj.active === 1;
        hasRepeat = true;
      }
      repStmt.free();
      if (hasRepeat) {
        task.repeat = repeat;
      }
    }
    
    return task;
  }
  
  /**
   * Initializes staging tables for the ETL pipeline (parsed_tasks, parsed_checklists, etc).
   * Used during the Sync process to load markdown data for diffing.
   */
  createStagingTables(): void {
    if (!this.db) return;
    this.db.run(`
      DROP TABLE IF EXISTS parsed_tasks;
      DROP TABLE IF EXISTS parsed_checklists;
      DROP TABLE IF EXISTS parsed_task_tags;
      DROP TABLE IF EXISTS parsed_task_repeats;

      CREATE TEMP TABLE parsed_tasks AS SELECT * FROM tasks WHERE 0;
      CREATE TEMP TABLE parsed_checklists AS SELECT * FROM checklists WHERE 0;
      CREATE TEMP TABLE parsed_task_tags AS SELECT * FROM task_tags WHERE 0;
      CREATE TEMP TABLE parsed_task_repeats AS SELECT * FROM task_repeats WHERE 0;
    `);
  }

  /**
   * Loads a parsed HabiticaTask into the staging tables.
   */
  loadToStaging(task: HabiticaTask): void {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT INTO parsed_tasks (
        id, type, text, priority, position, due, notes, up, down, streak,
        attribute, frequency, everyX, startDate, completed, isGroup
      ) VALUES (
        $id, $type, $text, $priority, $position, $due, $notes, $up, $down, $streak,
        $attribute, $frequency, $everyX, $startDate, $completed, $isGroup
      )
    `);

    stmt.run({
      $id: task.id,
      $type: task.type,
      $text: task.text,
      $priority: task.priority ?? 1,
      $position: ((task as unknown) as Record<string, unknown>).position as number ?? null,
      $due: task.date ?? null,
      $notes: task.notes ?? null,
      $up: task.up ? 1 : 0,
      $down: task.down ? 1 : 0,
      $streak: task.streak ?? null,
      $attribute: task.attribute ?? null,
      $frequency: task.frequency ?? null,
      $everyX: task.everyX ?? null,
      $startDate: task.startDate ?? null,
      $completed: task.completed ? 1 : 0,
      $isGroup: ((task as unknown) as { group?: { id: string } }).group?.id ? 1 : 0
    });
    stmt.free();

    // Checklists
    if (Array.isArray(task.checklist)) {
      const insStmt = this.db.prepare(`
        INSERT INTO parsed_checklists (id, task_id, text, completed, position)
        VALUES ($id, $taskId, $text, $completed, $position)
      `);
      task.checklist.forEach((item, index) => {
        insStmt.run({
          $id: item.id,
          $taskId: task.id,
          $text: item.text,
          $completed: item.completed ? 1 : 0,
          $position: index
        });
      });
      insStmt.free();
    }

    // Tags
    if (Array.isArray(task.tags)) {
      const insTaskTagStmt = this.db.prepare('INSERT INTO parsed_task_tags (task_id, tag_id) VALUES ($taskId, $tagId)');
      task.tags.forEach(tagId => {
        insTaskTagStmt.run({ $taskId: task.id, $tagId: tagId });
      });
      insTaskTagStmt.free();
    }

    // Repeats
    if (task.repeat) {
      const insRepStmt = this.db.prepare('INSERT INTO parsed_task_repeats (task_id, day, active) VALUES ($taskId, $day, $active)');
      Object.entries(task.repeat).forEach(([day, active]) => {
        insRepStmt.run({ $taskId: task.id, $day: day, $active: active ? 1 : 0 });
      });
      insRepStmt.free();
    }
  }

  /**
   * Computes the exact diff between staging (markdown) and main (Habitica) tables.
   */
  computeDiffs(): { 
    tasksToUpdate: string[], 
    tasksToCreate: string[],
    tasksToDelete: string[],
    checklistsToUpdate: string[],
    checklistsToAdd: string[],
    checklistsToDelete: string[]
  } {
    if (!this.db) return { tasksToUpdate: [], tasksToCreate: [], tasksToDelete: [], checklistsToUpdate: [], checklistsToAdd: [], checklistsToDelete: [] };

    const tasksToCreate: string[] = [];
    const tasksToUpdate: string[] = [];
    const tasksToDelete: string[] = [];
    
    // New Tasks: In staging, not in main. (Also handles generated local-UUIDs)
    const newTasksStmt = this.db.prepare(`
      SELECT p.id FROM parsed_tasks p
      LEFT JOIN tasks m ON p.id = m.id
      WHERE m.id IS NULL
    `);
    while (newTasksStmt.step()) {
      tasksToCreate.push(newTasksStmt.getAsObject().id as string);
    }
    newTasksStmt.free();

    // Deleted Tasks: In main, not in staging
    const delTasksStmt = this.db.prepare(`
      SELECT m.id FROM tasks m
      LEFT JOIN parsed_tasks p ON m.id = p.id
      WHERE p.id IS NULL
    `);
    while (delTasksStmt.step()) {
      tasksToDelete.push(delTasksStmt.getAsObject().id as string);
    }
    delTasksStmt.free();

    // Modified Tasks: In both, but fields differ (excluding tags/repeats for now)
    const modTasksStmt = this.db.prepare(`
      SELECT p.id FROM parsed_tasks p
      JOIN tasks m ON p.id = m.id
      WHERE p.text != m.text 
         OR p.priority != m.priority 
         OR IFNULL(p.due, '') != IFNULL(m.due, '')
         OR IFNULL(p.notes, '') != IFNULL(m.notes, '')
         OR p.up != m.up
         OR p.down != m.down
         OR p.completed != m.completed
         -- Add other relevant fields for comparison
    `);
    while (modTasksStmt.step()) {
      tasksToUpdate.push(modTasksStmt.getAsObject().id as string);
    }
    modTasksStmt.free();

    // Tag Diffs (Tasks that have tag changes)
    const tagDiffStmt = this.db.prepare(`
      SELECT DISTINCT p.task_id as id FROM parsed_task_tags p
      LEFT JOIN task_tags m ON p.task_id = m.task_id AND p.tag_id = m.tag_id
      WHERE m.tag_id IS NULL
      UNION
      SELECT DISTINCT m.task_id as id FROM task_tags m
      LEFT JOIN parsed_task_tags p ON m.task_id = p.task_id AND m.tag_id = p.tag_id
      WHERE p.tag_id IS NULL
    `);
    while (tagDiffStmt.step()) {
      const id = tagDiffStmt.getAsObject().id as string;
      if (!tasksToUpdate.includes(id) && !tasksToCreate.includes(id)) {
        tasksToUpdate.push(id);
      }
    }
    tagDiffStmt.free();

    // Repeat Diffs (Tasks that have repeat changes)
    const repDiffStmt = this.db.prepare(`
      SELECT DISTINCT p.task_id as id FROM parsed_task_repeats p
      JOIN task_repeats m ON p.task_id = m.task_id AND p.day = m.day
      WHERE p.active != m.active
    `);
    while (repDiffStmt.step()) {
      const id = repDiffStmt.getAsObject().id as string;
      if (!tasksToUpdate.includes(id) && !tasksToCreate.includes(id)) {
        tasksToUpdate.push(id);
      }
    }
    repDiffStmt.free();

    // Checklist Diffs
    const checklistsToAdd: string[] = [];
    const checklistsToUpdate: string[] = [];
    const checklistsToDelete: string[] = [];

    // New Checklist Items (generated UUIDs usually, or marked local-)
    const newChkStmt = this.db.prepare(`
      SELECT p.id FROM parsed_checklists p
      LEFT JOIN checklists m ON p.id = m.id
      WHERE m.id IS NULL
    `);
    while (newChkStmt.step()) {
      checklistsToAdd.push(newChkStmt.getAsObject().id as string);
    }
    newChkStmt.free();

    // Deleted Checklist Items
    const delChkStmt = this.db.prepare(`
      SELECT m.id FROM checklists m
      JOIN tasks mt ON m.task_id = mt.id
      LEFT JOIN parsed_checklists p ON m.id = p.id
      WHERE p.id IS NULL 
        AND mt.id NOT IN (${tasksToDelete.map(id => `'${id}'`).join(',') || "''"}) 
    `);
    while (delChkStmt.step()) {
      checklistsToDelete.push(delChkStmt.getAsObject().id as string);
    }
    delChkStmt.free();

    // Modified Checklist Items
    const modChkStmt = this.db.prepare(`
      SELECT p.id FROM parsed_checklists p
      JOIN checklists m ON p.id = m.id
      WHERE p.text != m.text OR p.completed != m.completed
    `);
    while (modChkStmt.step()) {
      checklistsToUpdate.push(modChkStmt.getAsObject().id as string);
    }
    modChkStmt.free();

    return {
      tasksToCreate,
      tasksToUpdate,
      tasksToDelete,
      checklistsToAdd,
      checklistsToUpdate,
      checklistsToDelete
    };
  }

  /**
   * Retrieves a task from STAGING by its ID.
   * Useful when we want to push the newly constructed state from Markdown.
   */
  getStagingTaskById(id: string): HabiticaTask | null {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM parsed_tasks WHERE id = $id');
    const row = stmt.getAsObject({ $id: id }) as unknown as TaskRow;
    stmt.free();
    
    if (Object.keys(row).length === 0) return null;

    const task: HabiticaTask = {
      id: row.id,
      type: row.type as 'habit' | 'daily' | 'todo' | 'reward',
      text: row.text,
      priority: row.priority,
      completed: row.completed === 1,
      notes: row.notes || undefined,
      date: row.due || undefined,
      up: row.up ?? undefined,
      down: row.down ?? undefined,
      streak: row.streak || undefined,
      attribute: row.attribute as 'str' | 'int' | 'per' | 'con' | undefined,
      frequency: row.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
      everyX: row.everyX || undefined,
      startDate: row.startDate || undefined,
    };
    ((task as unknown) as Record<string, unknown>).position = row.position;
    
    if (row.isGroup === 1) {
      ((task as unknown) as { group?: { id: string } }).group = { id: 'dummy' };
    }
    
    // Checklists
    const chkStmt = this.db.prepare('SELECT * FROM parsed_checklists WHERE task_id = $taskId ORDER BY position ASC');
    chkStmt.bind({ $taskId: task.id });
    const checklist = [];
    while (chkStmt.step()) {
      const cRow = chkStmt.getAsObject() as unknown as ChecklistRow;
      checklist.push({
        id: cRow.id,
        text: cRow.text,
        completed: cRow.completed === 1
      });
    }
    chkStmt.free();
    if (checklist.length > 0) {
      task.checklist = checklist;
    }

    // Tags
    const tagStmt = this.db.prepare('SELECT tag_id FROM parsed_task_tags WHERE task_id = $taskId');
    tagStmt.bind({ $taskId: task.id });
    const tags: string[] = [];
    while (tagStmt.step()) {
      tags.push(tagStmt.getAsObject().tag_id as string);
    }
    tagStmt.free();
    if (tags.length > 0) {
      task.tags = tags;
    }

    // Repeats
    const repStmt = this.db.prepare('SELECT day, active FROM parsed_task_repeats WHERE task_id = $taskId');
    repStmt.bind({ $taskId: task.id });
    const repeat: Record<string, boolean> = {};
    let hasRepeat = false;
    while (repStmt.step()) {
      const rObj = repStmt.getAsObject();
      repeat[rObj.day as string] = rObj.active === 1;
      hasRepeat = true;
    }
    repStmt.free();
    if (hasRepeat) {
      task.repeat = repeat;
    }

    return task;
  }

  /**
   * Retrieves a checklist item from STAGING by its ID.
   */
  getStagingChecklistItem(id: string): { taskId: string, item: Record<string, unknown> } | null {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT * FROM parsed_checklists WHERE id = $id');
    const row = stmt.getAsObject({ $id: id }) as unknown as ChecklistRow & { task_id: string };
    stmt.free();
    
    if (Object.keys(row).length === 0) return null;

    return {
      taskId: row.task_id,
      item: {
        id: row.id,
        text: row.text,
        completed: row.completed === 1
      }
    };
  }

  /**
   * Closes the database connection and saves the current state.
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
    }
  }
}
