/**
 * Task formatting — renders Habitica tasks as Markdown task lines with inline fields,
 * nested callouts, and checklist items for the sync output file.
 */

import { HabiticaTask } from '../types';
import { sanitizeTag } from './tags';
import { PRIORITY_VALUE_TO_NAME } from './parser';
import { buildInlineField } from './inline-fields';
import { FIELD_REGISTRY } from '../field-registry';

/**
 * Safely parses a date value and returns an `'en-CA'` locale string (`YYYY-MM-DD`).
 * Returns `null` if the input is absent or invalid.
 */
export function toLocaleDateStringSafe(dateInput: unknown): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput as string);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-CA');
}

/**
 * Filters a task list to only active (non-completed, non-scored) tasks of a given type.
 */
export function filterActive(
  list: HabiticaTask[],
  type: HabiticaTask['type'],
  scoredIds: Set<string>,
): HabiticaTask[] {
  return list.filter(
    (task) => task.type === type && !task.completed && !scoredIds.has(task.id),
  );
}

/**
 * Formats a list of Habitica tasks as Markdown task lines.
 */
export function formatTasks(
  taskList: HabiticaTask[],
  tagLookup: Record<string, string>,
  TODAY: string,
): string[] {
  if (!taskList.length) return ['_No tasks found._'];
  return taskList.map((task) => formatTaskLine(task, tagLookup, TODAY));
}

/**
 * Computes the next due date for a Habitica daily task using UTC-normalised arithmetic.
 */
export function getNextDailyDueDate(task: HabiticaTask): string | null {
  try {
    // Parse start as local midnight (no Z suffix) so all math and display stay in the user's local timezone, avoiding DST transition off-by-one.
    const start = new Date((task.startDate ?? '') + 'T00:00:00');
    if (isNaN(start.getTime())) return null;
    const startMs = start.getTime();

    // Local midnight for "today" — avoids UTC rollover when cron runs near midnight UTC.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const freq = task.frequency;
    const everyX = task.everyX || 1;
    const baseDate = startMs > todayMs ? new Date(startMs) : new Date(todayMs);
    if (freq === 'daily') {
      if (todayMs < startMs) {
        return start.toLocaleDateString('en-CA');
      }

      const dayMs = 24 * 60 * 60 * 1000;
      const daysSinceStart = Math.round((todayMs - startMs) / dayMs);
      const remainder = daysSinceStart % everyX;
      const daysUntilNext = remainder === 0 ? 0 : everyX - remainder;
      const nextMs = todayMs + daysUntilNext * dayMs;
      const next = new Date(nextMs);

      return next.toLocaleDateString('en-CA');
    }
    if (freq === 'weekly' && task.repeat) {
      const repeatDays = task.repeat;
      const weekdayKeys = ['su', 'm', 't', 'w', 'th', 'f', 's'];
      const MAX_WEEKLY_LOOKAHEAD_DAYS = 30;
      for (let i = 0; i < MAX_WEEKLY_LOOKAHEAD_DAYS; i++) {
        const check = new Date(baseDate);
        check.setDate(baseDate.getDate() + i);
        const key = weekdayKeys[check.getDay()];
        if (repeatDays[key] && check >= start) {
          return check.toLocaleDateString('en-CA');
        }
      }
    }
    return null;
  } catch (err) {
    console.error(
      'habitica-fullsync formatter.getNextDailyDueDate: error calculating daily due date:',
      err,
    );
    return null;
  }
}

// ── Task-line formatter ──────────────────────────────────────────────────

/**
 * Formats a single Habitica task as a Markdown task line with inline fields,
 * nested `> [!note]` callout for notes, and indented checklist items.
 *
 * Core fields (checkbox, text, #tags, [id::], [priority::], [due::], [completion::]) are rendered explicitly because they have conditional logic (type-gated, completion-gated). Optional fields (up, down, streak, attribute, frequency, everyX, repeat, startDate) are rendered via {@link FIELD_REGISTRY} — adding a new field requires only one entry in the registry, not a copy-pasted if-block here.
 */
export function formatTaskLine(
  task: HabiticaTask,
  tagLookup: Record<string, string>,
  TODAY: string,
): string {
  const status = task.completed ? 'x' : ' ';

  const cleanText = task.text.replace(/^#{1,6}\s+/, '').trim();

  const tagBodies = (Array.isArray(task.tags) ? task.tags : []).map((id) =>
    sanitizeTag(tagLookup[id] || 'unknown'),
  );
  const tags = [...new Set(tagBodies)].map((body) => `#${body}`);
  if (task.type === 'daily' && !tags.includes('#daily')) tags.push('#daily');
  if (task.type === 'habit' && !tags.includes('#habit')) tags.push('#habit');
  if (task.type === 'reward' && !tags.includes('#reward')) tags.push('#reward');
  const priorityNum = task.priority;
  const priorityName = priorityNum != null ? PRIORITY_VALUE_TO_NAME[String(priorityNum)] : undefined;
  if (priorityNum != null && !priorityName) {
    console.warn(`habitica-fullsync formatTaskLine: unknown priority value ${priorityNum} for task ${task.id} — rendering as 'Unknown'`);
  }
  const priority = priorityName || 'Unknown';

  let line = `- [${status}] ${cleanText} ${tags.join(' ')} ${buildInlineField('id', task.id)} ${buildInlineField('priority', priority)}`;
  const dueDateStr = toLocaleDateStringSafe(task.date);
  if (task.type === 'todo' && dueDateStr) {
    line += ` ${buildInlineField('due', dueDateStr)}`;
  }
  if (task.type === 'daily') {
    const dueDate = getNextDailyDueDate(task);
    if (dueDate) line += ` ${buildInlineField('due', dueDate)}`;
  }
  if (task.completed && task.type !== 'habit') {
    line += ` ${buildInlineField('completion', TODAY)}`;
  }
  // Optional fields — rendered via FIELD_REGISTRY (F3).
  // Core-rendered keys (id, priority, due, completion, tags, text, notes) are skipped —
  // they have conditional rendering logic above. Sentinel fields (delete) are never rendered.
  const CORE_RENDERED_KEYS = new Set(['id', 'priority', 'due', 'completion']);
  for (const def of FIELD_REGISTRY) {
    if (CORE_RENDERED_KEYS.has(def.inlineKey)) continue;
    if (def.type === 'stringSet' || def.type === 'sentinel') continue;
    const token = def.render(task);
    if (token) line += ` ${token}`;
  }

  const blocks: string[] = [line];

  const notesRaw = task.notes != null ? String(task.notes) : '';
  if (notesRaw.trim()) {
    const segments = notesRaw
      .split(/[\r\n]+/)
      .map((s) => s.replace(/^#{1,6}\s+/, '').trim())
      .filter((s) => s.length > 0);
    if (segments.length > 0) {
      blocks.push('  > [!note]');
      for (const seg of segments) blocks.push(`  > ${seg}`);
    }
  }

  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  for (const item of checklist) {
    const rawText = String(item.text ?? '').trim();
    if (!rawText) continue;

    const lines = rawText.split(/\r?\n/);
    const firstLine = lines[0].replace(/^#{1,6}\s+/, '').trim();
    if (!firstLine) continue;
    const subIdPart = item.id ? ` ${buildInlineField('subId', item.id)}` : '';
    blocks.push(`  - [${item.completed ? 'x' : ' '}] ${firstLine}${subIdPart}`);

    if (lines.length > 1) {
      let lastNonEmpty = lines.length - 1;
      while (lastNonEmpty > 0 && lines[lastNonEmpty].trim() === '')
        lastNonEmpty--;

      if (lastNonEmpty > 0) {
        blocks.push('');
        for (let i = 1; i <= lastNonEmpty; i++) {
          const line = lines[i];
          blocks.push(line.trim() === '' ? '' : `    ${line}`);
        }
      }
    }
  }

  return blocks.join('\n');
}
