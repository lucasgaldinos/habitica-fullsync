/**
 * Field Registry — single source of truth for all Habitica task fields handled by the plugin.
 *
 * Each field declares how it is parsed from `[key:: value]` inline tokens, rendered back into inline tokens, diffed between parsed Markdown state and Habitica server state, and mapped to the Habitica API body key for `PUT /tasks/:id` and `POST /tasks/user`.
 *
 * Adding a new field requires **one entry** in {@link FIELD_REGISTRY}. Previously this required copy-paste changes across 5 files (~50 lines). After F2–F5 adoption, the registry is consumed by parser, formatter, sync-manager, and api-client.
 *
 * ## Field categories
 *
 * | Category | Fields | Behaviour |
 * |----------|--------|-----------|
 * | **Simple scalar** | `priority`, `up`, `down`, `streak`, `attribute`, `frequency`, `everyX` | Parse → value. Render → `[key:: value]`. Diff → `===`. API → send value. |
 * | **Date** | `date` (due), `startDate` | Parse with `isValidDateString`. Render via `toLocaleDateStringSafe`. Diff: `date` is todo-only. |
 * | **Text** | `text`, `notes` | Parse via `cleanTitle`. Diff with special comparison (trim, cleanTitle). |
 * | **Compound** | `tags`, `repeat` | Parse into array/set/map. Diff with set/map comparison. |
 * | **Sentinel** | `delete` | One-way trigger. Never rendered. Parsed from `[delete::]` presence. Triggers `DELETE` not `PUT`. |
 */

import { HabiticaTask } from './types';
import {
  PRIORITY_NAME_TO_VALUE,
  PRIORITY_VALUE_TO_NAME,
  isValidDateString,
  cleanTitle,
} from './markdown/parser';
import { toLocaleDateStringSafe } from './markdown/formatter';
import { buildInlineField } from './markdown/inline-fields';

// ── Types ─────────────────────────────────────────────────────────────────

/** Allowed value categories for a field — drives type-safe parse/render/diff dispatch. */
export type FieldType =
  | 'string'      // free-text: text, notes, attribute
  | 'number'      // numeric: priority, streak, everyX
  | 'boolean'     // true/false: up, down
  | 'enum'        // constrained string set: frequency, attribute
  | 'date'        // YYYY-MM-DD: date (due), startDate
  | 'stringSet'   // string[] → set comparison: tags
  | 'weekdayMap'  // Record<string,boolean>: repeat
  | 'sentinel';   // presence-only: delete

/**
 * Metadata for a single Habitica task field — parse behaviour, render logic,
 * diff strategy, and API mapping. One entry per field in {@link FIELD_REGISTRY}.
 */
export interface FieldDefinition {
  /** Canonical field name (matches `HabiticaTask` property name). */
  name: string;
  /** Inline-field key as it appears in markdown: `[key:: value]`. Lowercase. */
  inlineKey: string;
  /** Category — drives which helper functions are used for parse/render/diff. */
  type: FieldType;
  /** Habitica API body key for `POST /tasks/user` and `PUT /tasks/:id`. */
  apiKey: string;
  /**
   * Parse an inline-field value string into the field's native type. Receives the raw string from `parseInlineFields()` (may be empty string for sentinel fields like `[delete::]`). Returns `undefined` if the value is absent or invalid (field not set in markdown).
   */
  parse: (rawValue: string | undefined) => unknown;
  /**
   * Render a `HabiticaTask` field value into an inline-field token string like `[key:: value]`. Returns `undefined` if the field should be omitted from rendering (e.g. default value, not applicable for type).
   */
  render: (task: HabiticaTask) => string | undefined;
  /**
   * Compare parsed Markdown value against the Habitica server value. Returns `[apiKey, value]` if the field has changed and should be included in the `PUT /tasks/:id` body. Returns `undefined` if unchanged or not applicable.
   *
   * @param parsed   Value extracted from the Markdown line by {@link parse}.
   * @param habitica Corresponding value from the `HabiticaTask` object.
   * @param context  The full task for context-dependent diff (e.g. `date`
   *                 is only diffed for `todo` type).
   */
  diff: (parsed: unknown, habitica: unknown, context: HabiticaTask) => [string, unknown] | undefined;
  /** For enum types: the set of allowed values. */
  allowedValues?: readonly string[];
  /**
   * Default Habitica value. When the server value equals this, the field is omitted from rendering (e.g. `frequency === 'daily'`, `everyX === 1`).
   */
  defaultValue?: unknown;
}

// ── Parse helpers ─────────────────────────────────────────────────────────

function parseNumber(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(raw: string | undefined): boolean | undefined {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

function parseEnum<T extends string>(raw: string | undefined, allowed: readonly T[]): T | undefined {
  if (raw === undefined) return undefined;
  const lower = raw.toLowerCase() as T;
  return allowed.includes(lower) ? lower : undefined;
}

// ── Diff helpers ──────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['su', 'm', 't', 'w', 'th', 'f', 's'] as const;

function diffSimple(parsed: unknown, habitica: unknown): boolean {
  return parsed !== undefined && parsed !== habitica;
}

function diffWeekdayMap(parsed: unknown, habitica: unknown): boolean {
  const p = parsed as Record<string, boolean> | undefined;
  const h = (habitica as Record<string, boolean>) ?? {};
  if (!p) return false;
  return WEEKDAY_KEYS.some(d => (p[d] ?? false) !== (h[d] ?? true));
}

function diffTagSet(parsed: unknown, habitica: unknown): boolean {
  const p = new Set(parsed as string[]);
  const h = new Set<string>(Array.isArray(habitica) ? habitica as string[] : []);
  return p.size !== h.size
    || [...p].some(id => !h.has(id))
    || [...h].some(id => !p.has(id));
}

// ── Render helpers ────────────────────────────────────────────────────────

function renderSimple(key: string, value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  return buildInlineField(key, String(value));
}

function renderPriority(task: HabiticaTask): string | undefined {
  if (task.priority == null) return undefined;
  const name = PRIORITY_VALUE_TO_NAME[String(task.priority)];
  return name ? buildInlineField('priority', name) : undefined;
}

function renderDate(key: string, raw: string | undefined): string | undefined {
  const safe = toLocaleDateStringSafe(raw);
  return safe ? buildInlineField(key, safe) : undefined;
}

function renderFrequency(task: HabiticaTask): string | undefined {
  if (!task.frequency || task.frequency === 'daily') return undefined;
  return buildInlineField('frequency', task.frequency);
}

function renderEveryX(task: HabiticaTask): string | undefined {
  if (task.everyX === undefined || task.everyX === 1 || !Number.isFinite(task.everyX))
    return undefined;
  return buildInlineField('everyX', String(task.everyX));
}

function renderRepeat(task: HabiticaTask): string | undefined {
  if (!task.repeat) return undefined;
  const active = WEEKDAY_KEYS.filter(d => task.repeat![d]);
  if (active.length === 0 || active.length === 7) return undefined;
  return buildInlineField('repeat', active.join(','));
}

function renderStartDate(task: HabiticaTask): string | undefined {
  if (!task.startDate || task.type !== 'daily') return undefined;
  return renderDate('startDate', task.startDate);
}

function renderDelete(_task: HabiticaTask): undefined {
  return undefined; // delete is a one-way sentinel — never rendered
}

// ── The Registry ──────────────────────────────────────────────────────────

/**
 * Single source of truth for every Habitica task field the plugin handles.
 *
 * Consumed by:
 * - {@link parseTaskFields} in `src/markdown/parser.ts` (F2)
 * - {@link formatTaskLine} in `src/markdown/formatter.ts` (F3)
 * - {@link SyncManager._syncManagedTasks} in `src/sync/sync-manager.ts` (F4)
 * - {@link HabiticaApiClient.createTask} / {@link updateTask} in `src/api/api-client.ts` (F5)
 *
 * To add a new field: add one entry here, then verify the consumer loops pick it up automatically. No other file changes needed.
 */
export const FIELD_REGISTRY: FieldDefinition[] = [
  // ── Core identity fields (always rendered) ──
  {
    name: 'text',
    inlineKey: 'text',
    type: 'string',
    apiKey: 'text',
    parse: (raw) => raw ?? undefined,
    render: (_task) => undefined, // text is the title, rendered separately
    diff: (parsed, _habitica, _ctx): [string, unknown] | undefined => {
      const p = (parsed as string | undefined) ?? '';
      const h = cleanTitle((_ctx.text ?? ''));
      return p && p !== h ? ['text', p] : undefined;
    },
  },

  // ── Simple scalar fields ──
  {
    name: 'priority',
    inlineKey: 'priority',
    type: 'number',
    apiKey: 'priority',
    parse: (raw) => {
      if (!raw) return undefined;
      if (raw === 'none') return 1; // sentinel: reset to low
      return PRIORITY_NAME_TO_VALUE[raw.toLowerCase()] ?? undefined;
    },
    render: renderPriority,
    diff: (parsed, habitica) =>
      diffSimple(parsed, habitica) ? ['priority', parsed] : undefined,
  },
  {
    name: 'up',
    inlineKey: 'up',
    type: 'boolean',
    apiKey: 'up',
    parse: parseBoolean,
    render: (t) => renderSimple('up', t.up),
    diff: (p, h) => diffSimple(p, h) ? ['up', p] : undefined,
  },
  {
    name: 'down',
    inlineKey: 'down',
    type: 'boolean',
    apiKey: 'down',
    parse: parseBoolean,
    render: (t) => renderSimple('down', t.down),
    diff: (p, h) => diffSimple(p, h) ? ['down', p] : undefined,
  },
  {
    name: 'streak',
    inlineKey: 'streak',
    type: 'number',
    apiKey: 'streak',
    parse: parseNumber,
    render: (t) => renderSimple('streak', t.streak),
    diff: (p, h) => diffSimple(p, h) ? ['streak', p] : undefined,
  },
  {
    name: 'attribute',
    inlineKey: 'attribute',
    type: 'enum',
    apiKey: 'attribute',
    allowedValues: ['str', 'int', 'per', 'con'],
    parse: (raw) => parseEnum(raw, ['str', 'int', 'per', 'con']),
    render: (t) => t.attribute ? renderSimple('attribute', t.attribute) : undefined,
    diff: (p, h) => diffSimple(p, h) ? ['attribute', p] : undefined,
  },
  {
    name: 'frequency',
    inlineKey: 'frequency',
    type: 'enum',
    apiKey: 'frequency',
    allowedValues: ['daily', 'weekly', 'monthly', 'yearly'],
    parse: (raw) => parseEnum(raw, ['daily', 'weekly', 'monthly', 'yearly']),
    render: renderFrequency,
    diff: (p, h) => diffSimple(p, h) ? ['frequency', p] : undefined,
  },
  {
    name: 'everyX',
    inlineKey: 'everyX',
    type: 'number',
    apiKey: 'everyX',
    parse: parseNumber,
    render: renderEveryX,
    diff: (p, h) => diffSimple(p, h) ? ['everyX', p] : undefined,
  },

  // ── Date fields ──
  {
    name: 'date',
    inlineKey: 'due',
    type: 'date',
    apiKey: 'date',
    parse: (raw) => {
      if (!raw) return undefined;
      if (raw === 'none') return ''; // sentinel: clear due date
      return isValidDateString(raw) ? raw : undefined;
    },
    render: (t) => (t.date ? renderDate('due', t.date) : undefined),
    diff: (parsed, habitica, ctx): [string, unknown] | undefined => {
      // date is only diffed for todo tasks
      if (ctx.type !== 'todo') return undefined;
      const p = parsed as string | undefined;
      if (p === undefined) return undefined;
      const h = (habitica as string) || '';
      return p !== h ? ['date', p] : undefined;
    },
  },
  {
    name: 'startDate',
    inlineKey: 'startDate',
    type: 'date',
    apiKey: 'startDate',
    parse: (raw) => (raw && isValidDateString(raw) ? raw : undefined),
    render: renderStartDate,
    diff: (p, h) => diffSimple(p, h) ? ['startDate', p] : undefined,
  },

  // ── Text fields ──
  {
    name: 'notes',
    inlineKey: 'notes',
    type: 'string',
    apiKey: 'notes',
    parse: (raw) => raw ?? undefined, // notes come from callout scanner, not inline fields
    render: (_task) => undefined,      // notes rendered as callout, not inline field
    diff: (parsed, habitica): [string, unknown] | undefined => {
      const p = ((parsed as string) ?? '').trim();
      const h = ((habitica as string | null) ?? '').trim();
      return p !== h ? ['notes', p || ''] : undefined;
    },
  },

  // ── Compound fields ──
  {
    name: 'tags',
    inlineKey: 'tags',
    type: 'stringSet',
    apiKey: 'tags',
    parse: (_raw) => undefined, // tags parsed from #token not inline fields — handled by parseTaskFields
    render: (_task) => undefined, // tags rendered with # prefix — handled by formatTaskLine
    diff: (parsed, habitica) =>
      diffTagSet(parsed, habitica) ? ['tags', parsed] : undefined,
  },
  {
    name: 'repeat',
    inlineKey: 'repeat',
    type: 'weekdayMap',
    apiKey: 'repeat',
    parse: (raw) => {
      if (!raw) return undefined;
      const validDays = ['su', 'm', 't', 'w', 'th', 'f', 's'];
      const days = raw.toLowerCase().split(',').map(d => d.trim()).filter(d => validDays.includes(d));
      if (days.length === 0) return undefined;
      const map: Record<string, boolean> = {};
      for (const day of validDays) map[day] = days.includes(day);
      return map;
    },
    render: renderRepeat,
    diff: (parsed, habitica) =>
      diffWeekdayMap(parsed, habitica) ? ['repeat', parsed] : undefined,
  },

  // ── Sentinel fields (one-way triggers, never rendered) ──
  {
    name: 'delete',
    inlineKey: 'delete',
    type: 'sentinel',
    apiKey: '', // triggers DELETE /tasks/:id, not PUT
    parse: (_raw) => true, // presence of [delete::] → true
    render: renderDelete,
    diff: (_p, _h): undefined => undefined, // delete triggers a separate API call, not PUT
  },
];

/**
 * Lookup a field definition by name (e.g. `'priority'`) or inline key (e.g. `'due'`). Returns `undefined` for fields not in the registry (e.g. `id`, `completion`, `subId` which are handled separately by the inline-field tokenizer).
 */
export function getField(nameOrKey: string): FieldDefinition | undefined {
  return FIELD_REGISTRY.find(
    f => f.name === nameOrKey || f.inlineKey === nameOrKey,
  );
}
