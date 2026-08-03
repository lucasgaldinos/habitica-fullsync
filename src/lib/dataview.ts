/**
 * Dataview block builder for the sync output file.
 *
 * Builds fenced `dataview` TABLE query blocks tailored to each task type, enabling dynamic filtered views in Obsidian's Dataview plugin.
 */

import { HabiticaTask } from '../types';

/**
 * Builds a fenced `dataview` TABLE query block tailored to a task type.
 */
export function buildDataviewBlock(
  type: HabiticaTask['type'],
  source: string,
): string {
  const quoted = `"${source}"`;
  const base = ['FROM ' + quoted, 'FLATTEN file.lists AS item'];
  let table: string;
  let where: string;
  let sort = '';
  switch (type) {
    case 'todo':
      table =
        'TABLE WITHOUT ID item.text AS "To-Do", item.priority AS "Priority", item.due AS "Due", item.completion AS "Done"';
      where =
        'WHERE item.id AND !contains(item.tags, "#daily") AND !contains(item.tags, "#habit") AND !contains(item.tags, "#reward")';
      sort = 'SORT item.due ASC';
      break;
    case 'daily':
      table =
        'TABLE WITHOUT ID item.text AS "Daily", item.priority AS "Priority", item.due AS "Next Due"';
      where = 'WHERE item.id AND contains(item.tags, "#daily")';
      sort = 'SORT item.due ASC';
      break;
    case 'habit':
      table =
        'TABLE WITHOUT ID item.text AS "Habit", item.priority AS "Priority"';
      where = 'WHERE item.id AND contains(item.tags, "#habit")';
      break;
    case 'reward':
      table =
        'TABLE WITHOUT ID item.text AS "Reward", item.priority AS "Priority"';
      where = 'WHERE item.id AND contains(item.tags, "#reward")';
      break;
    default:
      return '';
  }
  const lines = ['```dataview', table, ...base, where];
  if (sort) lines.push(sort);
  lines.push('```');
  return lines.join('\n');
}
