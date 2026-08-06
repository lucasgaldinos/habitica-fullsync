/**
 * Markdown task-line parsers — extract fields from hand-written and managed task lines for Habitica creation and update passes.
 */

import {
  ChecklistItemParsed,
  HabiticaTask,
  ManagedTaskFields,
  NewTaskInput,
  ParsedTaskFields,
} from '../types';
import { normalizeTagKey, RESERVED_TYPE_TAGS } from './tags';
import { extractId, parseInlineFields, stripInlineFields, stripScoredMarker } from './inline-fields';
import { FIELD_REGISTRY } from '../field-registry';

/**
 * Extracts a field value from inline fields by delegating to {@link FIELD_REGISTRY}. Looks up the field definition by `inlineKey`, gets the raw value from the parsed fields map, and calls the registry's `parse` function. Returns `undefined` if the field is not in the registry or the raw value is absent.
 */
function parseFieldFromRegistry(fields: Map<string, string>, inlineKey: string): unknown {
  const def = FIELD_REGISTRY.find(f => f.inlineKey === inlineKey);
  if (!def) return undefined;
  return def.parse(fields.get(inlineKey));
}

/**
 * Maps `[priority:: name]` inline-field values to Habitica numeric priorities.
 */
export const PRIORITY_NAME_TO_VALUE: Record<string, number> = {
  high: 2,
  medium: 1.5,
  low: 1,
  lowest: 0.1,
};

/** Reverse lookup: Habitica numeric priority → display name. */
export const PRIORITY_VALUE_TO_NAME: Record<string, string> = {
  '2': 'high',
  '1.5': 'medium',
  '1': 'low',
  '0.1': 'lowest',
};

/**
 * Maps a level-2 section heading from the sync file to a Habitica task type.
 * Returns `undefined` for unrecognised sections — the caller should skip the task and report the unknown section name rather than silently creating to-dos.
 */
export function sectionToType(section: string): HabiticaTask['type'] | undefined {
  switch (section.trim().toLowerCase()) {
    case 'dailies':
      return 'daily';
    case 'habits':
      return 'habit';
    case 'rewards':
      return 'reward';
    case 'to-dos':
    case 'todos':
    case 'to dos':
      return 'todo';
    default:
      return undefined;
  }
}

/**
 * Strictly validates a `YYYY-MM-DD` date string, rejecting impossible dates.
 */
export function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * Normalizes a task title for comparison — strips heading markers, inline fields,
 * tags, and `%%scored%%` markers, then collapses whitespace.
 */
export function cleanTitle(text: string): string {
  return stripScoredMarker(stripInlineFields(text))
    .replace(/^#{1,6}\s+/, '')
    .replace(/#[\p{L}\p{N}_\-/]+/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Shared field extractor for both task-line parsers.
 */
function parseTaskFields(
  rest: string,
  section: string,
  reverseIndex: Record<string, string>,
  dailyDue: boolean,
  completed: boolean,
): ParsedTaskFields {
  const type = sectionToType(section);

  const { fields } = parseInlineFields(rest);

  let priority: number | undefined;
  let date: string | undefined;
  let startDate: string | undefined;
  let frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined;

  // due/date/startDate/frequency are interdependent (contextual on task type and dailyDue flag).
  // They stay as explicit logic; the remaining scalar fields delegate to FIELD_REGISTRY.
  const dueValue = fields.get('due');
  if (dueValue === 'none') {
    date = ''; // sentinel: clear the due date
  } else if (dueValue && isValidDateString(dueValue)) {
    if (type === 'todo') date = dueValue;
    else if (dailyDue && type === 'daily') {
      startDate = dueValue;
      frequency = 'daily';
    }
  } else if (dailyDue && type === 'daily') {
    frequency = 'daily';
  }

  // Phase 13: explicit recurrence tokens override due-based inference
  const explicitFrequency = fields.get('frequency');
  if (explicitFrequency && ['daily', 'weekly', 'monthly', 'yearly'].includes(explicitFrequency.toLowerCase())) {
    frequency = explicitFrequency.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'yearly';
  }

  const explicitStartDate = fields.get('startdate');
  if (explicitStartDate && isValidDateString(explicitStartDate)) {
    startDate = explicitStartDate;
  }

  // Simple scalar fields — delegated to the field registry (F2).
  // Each registry entry declares its own parse logic; the loop extracts
  // the raw inline-field value and assigns to the accumulator.
  let everyX: number | undefined;
  let repeat: Record<string, boolean> | undefined;
  let up: number | undefined;
  let down: number | undefined;
  let streak: number | undefined;
  let attribute: string | undefined;
  const delete_ = fields.has('delete');

  // priority still handled inline for the 'none' sentinel (reset-to-low)
  const priorityName = fields.get('priority');
  if (priorityName === 'none') {
    priority = 1;
  } else if (priorityName && priorityName in PRIORITY_NAME_TO_VALUE) {
    priority = PRIORITY_NAME_TO_VALUE[priorityName.toLowerCase()];
  }

  everyX = parseFieldFromRegistry(fields, 'everyx') as number | undefined;
  repeat = parseFieldFromRegistry(fields, 'repeat') as Record<string, boolean> | undefined;
  up = parseFieldFromRegistry(fields, 'up') as number | undefined;
  down = parseFieldFromRegistry(fields, 'down') as number | undefined;
  streak = parseFieldFromRegistry(fields, 'streak') as number | undefined;
  attribute = parseFieldFromRegistry(fields, 'attribute') as string | undefined;

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

  const text = cleanTitle(rest);

  return {
    type,
    priority,
    date,
    startDate,
    frequency,
    everyX,
    repeat,
    up,
    down,
    streak,
    attribute,
    delete: delete_,
    tagIds,
    newTagNames,
    text,
    completed,
  };
}

/**
 * Parses a hand-written markdown task line (no `[id::]`) into a {@link NewTaskInput}.
 */
export function parseTaskLine(
  line: string,
  section: string,
  reverseIndex: Record<string, string>,
  notes: string,
  checklistItems: ChecklistItemParsed[],
): NewTaskInput {
  const completed = line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]');
  const rest = line.replace(/^- \[[ xX]\]\s*/, '');

  const f = parseTaskFields(rest, section, reverseIndex, true, completed);

  return {
    text: f.text,
    type: f.type,
    priority: f.priority,
    date: f.date,
    startDate: f.startDate,
    frequency: f.frequency,
    everyX: f.everyX,
    tagIds: f.tagIds,
    newTagNames: f.newTagNames,
    completed: f.completed,
    notes: notes.trim() ? notes.trim() : undefined,
    checklistItems,
  };
}

/**
 * Parses a managed task line (has `[id:: ...]`) into a {@link ManagedTaskFields}.
 */
export function parseManagedTaskLine(
  line: string,
  section: string,
  reverseIndex: Record<string, string>,
  notes: string,
  checklistItems: ChecklistItemParsed[],
): ManagedTaskFields {
  const completed = line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]');
  const rest = line.replace(/^- \[[ xX]\]\s*/, '');

  const id = extractId(rest) ?? '';

  const f = parseTaskFields(rest, section, reverseIndex, false, completed);

  return {
    id,
    text: f.text,
    priority: f.priority,
    date: f.date,
    frequency: f.frequency,
    everyX: f.everyX,
    repeat: f.repeat,
    startDate: f.startDate,
    up: f.up,
    down: f.down,
    streak: f.streak,
    attribute: f.attribute,
    delete: f.delete,
    tagIds: f.tagIds,
    newTagNames: f.newTagNames,
    completed: f.completed,
    notes: notes.trim() ? notes.trim() : undefined,
    checklistItems,
  };
}
