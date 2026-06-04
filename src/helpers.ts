import { HabiticaTask, NewTaskInput } from './types';
import { escapeRegExp } from './vault-handler';

export { escapeRegExp };

/** Renderer-only tags appended automatically by the formatter; never resolved/created as Habitica tags. */
const RESERVED_TYPE_TAGS = new Set(['daily', 'habit', 'reward']);

/**
 * Detects whether the plugin is running on an Obsidian mobile platform.
 * Checks for `window.isMobile` (set by Obsidian mobile) and `window.cordova`.
 * @returns `true` if running on mobile; `false` on desktop (Electron) or in tests.
 */
export function isMobilePlatform(): boolean {
  const win = window as Window & { isMobile?: boolean; cordova?: unknown };
  return !!win?.isMobile || !!win?.cordova;
}

/**
 * Sanitizes a Habitica tag name into a valid single-token Obsidian tag (without the leading `#`).
 *
 * Habitica tag names may contain spaces and other characters Obsidian disallows in tags
 * (e.g. `data engineering`), which would render as a broken tag (`#data` + stray text).
 * This collapses whitespace to single hyphens and strips characters Obsidian does not allow
 * in tags, keeping letters (incl. Unicode), digits, `_`, `-`, and `/`.
 *
 * @param name Raw Habitica tag name.
 * @returns A sanitized tag body, or `'unknown'` if nothing valid remains.
 * @example sanitizeTag('data engineering') // → 'data-engineering'
 */
export function sanitizeTag(name: string): string {
  const sanitized = String(name ?? '')
    .trim()
    .replace(/\s+/g, '-')
    // Drop characters Obsidian disallows in tags. Keep letters (Unicode), digits, _ - /
    .replace(/[^\p{L}\p{N}_\-/]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized.length > 0 ? sanitized : 'unknown';
}

/**
 * Builds a normalized reverse lookup index mapping a tag's normalized form to its Habitica ID.
 *
 * Tag sanitization is lossy — `data engineering` and `data-engineering` both normalize to the
 * same key — so this index lets a markdown tag (e.g. `#data-engineering`) be matched back to the
 * original Habitica tag (`data engineering`) when creating tasks from markdown (Phase 12).
 * Normalization lowercases and treats spaces, hyphens, and underscores as equivalent.
 *
 * @param tagLookup Map of Habitica tag UUID → tag name.
 * @returns Map of normalized tag name → tag UUID. Later duplicates overwrite earlier ones.
 */
export function buildTagReverseIndex(tagLookup: Record<string, string>): Record<string, string> {
  const index: Record<string, string> = {};
  for (const [id, name] of Object.entries(tagLookup)) {
    index[normalizeTagKey(name)] = id;
  }
  return index;
}

/**
 * Normalizes a tag name (or sanitized tag) into a comparison key.
 * Lowercases and collapses spaces / hyphens / underscores so separator and case differences
 * do not prevent a match. Used by {@link buildTagReverseIndex} and the Phase 12 line parser.
 * @param name Raw or sanitized tag text.
 * @returns A normalized key (e.g. `'Data Engineering'` and `'data-engineering'` → `'data engineering'`).
 */
export function normalizeTagKey(name: string): string {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ');
}

/**
 * Builds a fenced `dataview` TABLE query block tailored to a task type.
 *
 * The literal task checkboxes remain above (needed for the check-off-to-score workflow);
 * this block is the dynamic "organised view" requested in the TODOs. Each task type surfaces
 * only its relevant inline fields. Filtering is tag-based so it captures both personal and
 * group tasks: dailies/habits/rewards carry an auto-added `#daily`/`#habit`/`#reward` tag,
 * while to-dos are identified by the *absence* of those type tags.
 *
 * @param type   Task type the block should display.
 * @param source Dataview source path (the sync file without extension), e.g. `"Habitica/habitica-fullsync"`.
 * @returns A `\n`-joined string containing a fenced ```dataview``` block.
 */
export function buildDataviewBlock(type: HabiticaTask['type'], source: string): string {
  const quoted = `"${source}"`;
  const base = [
    'FROM ' + quoted,
    'FLATTEN file.lists AS item',
  ];
  let table: string;
  let where: string;
  let sort = '';
  switch (type) {
    case 'todo':
      table = 'TABLE WITHOUT ID item.text AS "To-Do", item.priority AS "Priority", item.due AS "Due", item.completion AS "Done"';
      where = 'WHERE item.id AND !contains(item.tags, "#daily") AND !contains(item.tags, "#habit") AND !contains(item.tags, "#reward")';
      sort = 'SORT item.due ASC';
      break;
    case 'daily':
      table = 'TABLE WITHOUT ID item.text AS "Daily", item.priority AS "Priority", item.due AS "Next Due"';
      where = 'WHERE item.id AND contains(item.tags, "#daily")';
      sort = 'SORT item.due ASC';
      break;
    case 'habit':
      table = 'TABLE WITHOUT ID item.text AS "Habit", item.priority AS "Priority"';
      where = 'WHERE item.id AND contains(item.tags, "#habit")';
      break;
    case 'reward':
      table = 'TABLE WITHOUT ID item.text AS "Reward", item.priority AS "Priority"';
      where = 'WHERE item.id AND contains(item.tags, "#reward")';
      break;
  }
  const lines = ['```dataview', table, ...base, where];
  if (sort) lines.push(sort);
  lines.push('```');
  return lines.join('\n');
}

/**
 * Filters a task list to only active (non-completed, non-scored) tasks of a given type.
 * @param list      Full task array (personal or group tasks).
 * @param type      Task type to retain (`'habit'`, `'daily'`, `'todo'`, or `'reward'`).
 * @param scoredIds Set of Habitica task IDs scored during the current sync run.
 * @returns Filtered array — matching type, not completed, and not in `scoredIds`.
 */
export function filterActive(list: HabiticaTask[], type: HabiticaTask['type'], scoredIds: Set<string>): HabiticaTask[] {
  return list.filter(task => task.type === type && !task.completed && !scoredIds.has(task.id));
}

/**
 * Safely parses a date value and returns an `'en-CA'` locale string (`YYYY-MM-DD`).
 *
 * Guards against absent, `null`, or invalid date strings from the Habitica API.
 * `new Date(undefined)` produces `Invalid Date` whose `toLocaleDateString` returns the
 * literal string `"Invalid Date"` rather than throwing — this function returns `null` instead.
 *
 * @param dateInput Any value from an API payload (valid ISO 8601 string, `null`, `undefined`, etc.).
 * @returns A `YYYY-MM-DD` string, or `null` if the input is absent or invalid.
 */
export function toLocaleDateStringSafe(dateInput: unknown): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput as string);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-CA');
}

/**
 * Formats a list of Habitica tasks as Markdown task lines.
 * @param taskList  Tasks to format. Empty array produces a placeholder line.
 * @param tagLookup Map of Habitica tag UUID → tag name.
 * @param TODAY     Current date as `YYYY-MM-DD` string, used for `[completion::]` fields.
 * @returns Array of Markdown strings, one per task, or `['_No tasks found._']` if empty.
 */
export function formatTasks(taskList: HabiticaTask[], tagLookup: Record<string, string>, TODAY: string): string[] {
  if (!taskList.length) return ['_No tasks found._'];
  return taskList.map(task => formatTaskLine(task, tagLookup, TODAY));
}

/**
 * Formats a single Habitica task as a Markdown task line with inline fields.
 *
 * Output: `- [x/ ] <text> (<notes>) #<tags> [id:: <id>] [priority:: <level>] [due:: <date>] [completion:: <date>]`
 *
 * - **text**: Markdown heading prefixes (`##`, `#`, etc.) are stripped from the task title
 *   because Habitica permits them in task names but they break Obsidian list rendering.
 * - **notes**: Split on real newlines, heading markers stripped per segment, joined with ` · `.
 *   Truncated to 150 characters at a word boundary to keep lines readable.
 * - **tags**: Resolved from `tagLookup`; unknown IDs render as `#unknown`. Type tags (`#daily`,
 *   `#habit`, `#reward`) are appended automatically.
 * - **priority**: `2`→`high`, `1.5`→`medium`, `1`→`low`, `0.1`→`lowest`.
 * - **due**: For to-dos from `task.date`; for dailies via {@link getNextDailyDueDate}.
 * - **completion**: Added only for completed non-habit tasks, using `TODAY`.
 * - **notes**: Rendered as a nested Obsidian callout (`> [!note]`) on the lines beneath the
 *   task, one `> ` line per cleaned segment. Omitted entirely when there are no notes.
 * - **checklist**: Each item rendered as an indented nested checkbox (`  - [ ]`/`  - [x]`)
 *   beneath the task, after the notes callout.
 *
 * @param task      The Habitica task to format.
 * @param tagLookup Map of tag UUID → name for resolving `task.tags`.
 * @param TODAY     Current date string (`YYYY-MM-DD`) for the `[completion::]` field.
 * @returns A Markdown string: the task line, optionally followed by `\n`-joined nested
 *          callout and checklist lines.
 */
export function formatTaskLine(task: HabiticaTask, tagLookup: Record<string, string>, TODAY: string): string {
  const status = task.completed ? 'x' : ' ';

  // Strip Markdown heading syntax Habitica allows in task titles (e.g. "## My Task")
  const cleanText = task.text.replace(/^#{1,6}\s+/, '').trim();

  const tagBodies = (Array.isArray(task.tags) ? task.tags : []).map(id => sanitizeTag(tagLookup[id] || 'unknown'));
  // Dedupe tags that collapse to the same token after sanitization
  const tags = [...new Set(tagBodies)].map(body => `#${body}`);
  if (task.type === 'daily') tags.push('#daily');
  if (task.type === 'habit') tags.push('#habit');
  if (task.type === 'reward') tags.push('#reward');
  const priorityMap: Record<string, string> = { '2': 'high', '1.5': 'medium', '1': 'low', '0.1': 'lowest' };
  const priority = priorityMap[String(task.priority)] || 'Unknown';

  let line = `- [${status}] ${cleanText} ${tags.join(' ')} [id:: ${task.id}] [priority:: ${priority}]`;
  const dueDateStr = toLocaleDateStringSafe(task.date);
  if (task.type === 'todo' && dueDateStr) {
    line += ` [due:: ${dueDateStr}]`;
  }
  if (task.type === 'daily') {
    const dueDate = getNextDailyDueDate(task);
    if (dueDate) line += ` [due:: ${dueDate}]`;
  }
  if (task.completed && task.type !== 'habit') {
    line += ` [completion:: ${TODAY}]`;
  }

  const blocks: string[] = [line];

  // Notes → nested Obsidian callout, one `> ` line per cleaned segment
  const notesRaw = task.notes != null ? String(task.notes) : '';
  if (notesRaw.trim()) {
    const segments = notesRaw
      .split(/[\r\n]+/)
      .map(s => s.replace(/^#{1,6}\s+/, '').trim())
      .filter(s => s.length > 0);
    if (segments.length > 0) {
      blocks.push('  > [!note]');
      for (const seg of segments) blocks.push(`  > ${seg}`);
    }
  }

  // Checklist (subtasks) → indented nested checkboxes
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  for (const item of checklist) {
    const itemText = String(item.text ?? '').replace(/^#{1,6}\s+/, '').trim();
    if (!itemText) continue;
    blocks.push(`  - [${item.completed ? 'x' : ' '}] ${itemText}`);
  }

  return blocks.join('\n');
}

/**
 * Computes the next due date for a Habitica daily task.
 *
 * **`frequency === 'daily'` (every-N-days):**
 * Uses UTC-normalised arithmetic anchored at `task.startDate` to avoid DST contamination.
 * Algorithm: compute `daysSinceStart % everyX`; if `0`, today is due; otherwise add
 * `everyX - remainder` days from today.
 *
 * **`frequency === 'weekly'`:**
 * Scans the next 30 days from today (or `startDate`, whichever is later) for the first
 * weekday enabled in `task.repeat`. Keys: `'su'`, `'m'`, `'t'`, `'w'`, `'th'`, `'f'`, `'s'`.
 *
 * @param task The daily task. Must have `startDate` and `frequency` set.
 * @returns A `YYYY-MM-DD` string for the next occurrence, or `null` if `startDate` is
 *          invalid, `frequency` is unrecognised, or no weekly day is found within 30 days.
 */
export function getNextDailyDueDate(task: HabiticaTask): string | null {
  try {
    const start = new Date(task.startDate!);
    if (isNaN(start.getTime())) return null;
    const today = new Date();
    const freq = task.frequency;
    const everyX = task.everyX || 1;
    const baseDate = start > today ? new Date(start) : new Date(today);
    if (freq === 'daily') {
      const startMs = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
      const todayMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

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
      for (let i = 0; i < 30; i++) {
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
    console.error('habitica-fullsync helpers.getNextDailyDueDate: error calculating daily due date:', err);
    return null;
  }
}

/**
 * Maps a level-3 section heading from the sync file to a Habitica task type.
 * @param section Heading text (without the `### ` prefix), e.g. `'To-Dos'`.
 * @returns The matching task type; defaults to `'todo'` for unrecognised sections.
 */
export function sectionToType(section: string): HabiticaTask['type'] {
  switch (section.trim().toLowerCase()) {
    case 'dailies': return 'daily';
    case 'habits': return 'habit';
    case 'rewards': return 'reward';
    case 'to-dos':
    case 'todos':
    case 'to dos':
      return 'todo';
    default: return 'todo';
  }
}

/**
 * Strictly validates a `YYYY-MM-DD` date string, rejecting impossible dates (e.g. `2026-02-31`).
 *
 * `new Date('2026-02-31')` silently rolls over to March rather than failing, so this
 * round-trips the parsed value back to a string and requires an exact match.
 *
 * @param s Candidate date string.
 * @returns `true` only if `s` is a real calendar date in `YYYY-MM-DD` form.
 */
export function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * Parses a hand-written markdown task line into a {@link NewTaskInput} for Habitica creation.
 *
 * Extracts the title (stripping inline fields, tags, and markers), infers the type from the
 * section heading, and resolves `[priority::]`, `[due::]`, `#tags`, and notes. The renderer-only
 * type tags (`#daily`, `#habit`, `#reward`) are ignored — they are never created as real tags.
 *
 * @param line         The raw `- [ ]` line (no `[id::]`).
 * @param section      The level-3 section heading the line sits under.
 * @param reverseIndex Normalized-tag-name → tag-UUID map from {@link buildTagReverseIndex}.
 * @param notes        Notes text already extracted from a following `> [!note]` callout (may be empty).
 * @param checklistTexts Checklist item texts already extracted from following nested lines.
 * @returns A populated `NewTaskInput`. `text` may be empty if the line had no title content.
 */
export function parseTaskLine(
  line: string,
  section: string,
  reverseIndex: Record<string, string>,
  notes: string,
  checklistTexts: string[],
): NewTaskInput {
  const type = sectionToType(section);

  // Strip the checkbox prefix
  let rest = line.replace(/^- \[ \]\s*/, '');

  // Priority
  let priority: number | undefined;
  const priorityMatch = rest.match(/\[priority:: (high|medium|low|lowest)\]/i);
  if (priorityMatch) {
    const map: Record<string, number> = { high: 2, medium: 1.5, low: 1, lowest: 0.1 };
    priority = map[priorityMatch[1].toLowerCase()];
  }

  // Due date (only meaningful for todo/daily)
  let date: string | undefined;
  let startDate: string | undefined;
  let frequency: 'daily' | undefined;
  const dueMatch = rest.match(/\[due:: (\d{4}-\d{2}-\d{2})\]/);
  if (dueMatch && isValidDateString(dueMatch[1])) {
    if (type === 'todo') date = dueMatch[1];
    else if (type === 'daily') { startDate = dueMatch[1]; frequency = 'daily'; }
  } else if (type === 'daily') {
    frequency = 'daily';
  }

  // Tags
  const tagIds: string[] = [];
  const newTagNames: string[] = [];
  const seenTagKeys = new Set<string>();
  const tagMatches = rest.match(/#[\p{L}\p{N}_\-/]+/gu) || [];
  for (const tag of tagMatches) {
    const body = tag.slice(1);
    const key = normalizeTagKey(body);
    if (RESERVED_TYPE_TAGS.has(key)) continue;
    if (seenTagKeys.has(key)) continue;
    seenTagKeys.add(key);
    const existingId = reverseIndex[key];
    if (existingId) tagIds.push(existingId);
    else newTagNames.push(body.replace(/-/g, ' '));
  }

  // Title: remove all inline fields, tags, and markers
  const text = rest
    .replace(/\[[a-zA-Z]+:: [^\]]*\]/g, '')
    .replace(/#[\p{L}\p{N}_\-/]+/gu, '')
    .replace(/%%scored%%/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    text,
    type,
    priority,
    date,
    startDate,
    frequency,
    tagIds,
    newTagNames,
    notes: notes.trim() ? notes.trim() : undefined,
    checklistTexts,
  };
}
