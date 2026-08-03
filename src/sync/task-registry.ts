/**
 * In-memory task aggregate — wraps personal and group task arrays with a single lookup method, eliminating the formerly duplicated `find` dance across three call sites.
 */

import { HabiticaChecklistItem, HabiticaTask } from '../types';

export class TaskRegistry {
  private _personal: HabiticaTask[] = [];
  private _group: HabiticaTask[] = [];

  // -- setters (called once per sync in _fetchFromHabitica) --

  set personal(tasks: HabiticaTask[]) {
    this._personal = tasks;
  }

  set group(tasks: HabiticaTask[]) {
    this._group = tasks;
  }

  // -- getters (used by _renderAndWrite and callers that need filtered lists) --

  get personal(): HabiticaTask[] {
    return this._personal;
  }

  get group(): HabiticaTask[] {
    return this._group;
  }

  /** Derived view — no stored shallow concat. */
  get all(): HabiticaTask[] {
    return [...this._personal, ...this._group];
  }

  // -- lookup --

  /** Returns both personal and group matches for a task ID. Used internally by findById, updateChecklist, and updateInPlace to avoid the duplicated personal-then-group search pattern. */
  private _findBoth(taskId: string): { personal?: HabiticaTask; group?: HabiticaTask } {
    return {
      personal: this._personal.find(t => t.id === taskId),
      group: this._group.find(t => t.id === taskId),
    };
  }

  /** Finds a task by Habitica UUID, checking personal tasks first, then group. */
  findById(id: string): HabiticaTask | undefined {
    const found = this._findBoth(id);
    return found.personal ?? found.group;
  }

  // -- mutations --

  /** Appends a newly created personal task (used by _createNewTasks). */
  pushCreated(task: HabiticaTask): void {
    this._personal.push(task);
  }

  /** Updates the checklist array for a task in either personal or group. */
  updateChecklist(taskId: string, checklist: HabiticaChecklistItem[]): void {
    const found = this._findBoth(taskId);
    if (found.personal) { found.personal.checklist = checklist; return; }
    if (found.group) found.group.checklist = checklist;
  }

  /**
   * Applies a full API response (`updated`) to the in-memory task, optionally
   * preserving a known-good checklist. Returns `true` if the task was found.
   */
  updateInPlace(taskId: string, updated: HabiticaTask, checklist?: HabiticaChecklistItem[]): boolean {
    const found = this._findBoth(taskId);
    const target = found.personal ?? found.group;
    if (!target) return false;
    Object.assign(target, updated);
    if (checklist) target.checklist = checklist;
    return true;
  }

  /** Removes a task by id from both personal and group arrays. Returns `true` if a task was removed. */
  remove(taskId: string): boolean {
    const personalIdx = this._personal.findIndex(t => t.id === taskId);
    if (personalIdx !== -1) {
      this._personal.splice(personalIdx, 1);
      return true;
    }
    const groupIdx = this._group.findIndex(t => t.id === taskId);
    if (groupIdx !== -1) {
      this._group.splice(groupIdx, 1);
      return true;
    }
    return false;
  }
}
