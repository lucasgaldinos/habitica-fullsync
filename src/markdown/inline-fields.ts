/**
 * Inline-field tokenizer — parses and builds the plugin's `[key:: value]` DSL tokens embedded in Markdown task lines.
 * Single source of truth for all inline-field regex patterns. Previously these were scattered across 12+ sites in 4 files.
 */

/** Matches an inline field token: `[key:: value]` or `[key::]`. Space after `::` is optional. */
const FIELD_RE = /\[([a-zA-Z]+):: ?([^\]]*)\]/g;

/** Return type for {@link parseInlineFields}. */
export interface InlineFields {
  /** Map of field key → value. Keys are always lowercase strings (e.g. `'id'`, `'priority'`, `'due'`). */
  fields: Map<string, string>;
  /** The input text with all inline-field tokens removed and whitespace collapsed. */
  text: string;
}

/**
 * Parses all `[key:: value]` inline fields from a task line, returning a map of lowercased keys to their values and the cleaned text.
 *
 * @example
 * parseInlineFields('- [ ] Buy milk [priority:: high] [due:: 2026-06-01]')
 * → { fields: Map { 'priority' → 'high', 'due' → '2026-06-01' },
 *     text: '- [ ] Buy milk' }
 */
export function parseInlineFields(text: string): InlineFields {
  const fields = new Map<string, string>();
  const cleaned = text.replace(FIELD_RE, (_match, key: string, value: string) => {
    fields.set(key.toLowerCase(), value.trimEnd());
    return '';
  });
  return { fields, text: collapseWhitespace(cleaned) };
}

/**
 * Extracts the Habitica task ID from `[id:: …]` if present.
 */
export function extractId(text: string): string | undefined {
  const match = text.match(/\[id:: ?([^\]]*)\]/);
  return match ? match[1] || undefined : undefined;
}

/**
 * Extracts a completion date from `[completion:: YYYY-MM-DD]` if present.
 */
export function extractCompletionDate(text: string): string | undefined {
  const match = text.match(/\[completion:: ?(\d{4}-\d{2}-\d{2})\]/);
  return match ? match[1] : undefined;
}

/**
 * Extracts a checklist item sub-ID from `[subId:: …]` if present.
 */
export function extractSubId(text: string): string | undefined {
  const match = text.match(/\[subId:: ?([^\]]*)\]/);
  if (!match) return undefined;
  const trimmed = match[1].trim();
  return trimmed || undefined;
}

/**
 * Strips ALL inline-field tokens from text and collapses whitespace. Uses {@link FIELD_RE} (the same regex as {@link parseInlineFields}) to ensure consistency — no space after `::` is also handled.
 */
export function stripInlineFields(text: string): string {
  return collapseWhitespace(text.replace(FIELD_RE, ''));
}

/**
 * Returns `true` if the text contains the `%%scored%%` sentinel.
 */
export function hasScoredMarker(text: string): boolean {
  return text.includes('%%scored%%');
}

/**
 * Removes all `%%scored%%` markers from the text.
 */
export function stripScoredMarker(text: string): string {
  return text.split('%%scored%%').join('');
}

/**
 * Builds an inline-field token string: `[key:: value]`.
 *
 * Escapes literal `]` in values as `\]` to prevent premature token closure. Values containing `]` are rare (task titles with brackets) but would otherwise produce broken Markdown that the parser cannot recover.
 *
 * @example buildInlineField('id', 'abc-123') // → '[id:: abc-123]'
 */
export function buildInlineField(key: string, value: string): string {
  return `[${key}:: ${value.replace(/\]/g, '\\]')}]`;
}

// ---- internal ----

function collapseWhitespace(text: string): string {
  return text.replace(/\s{2,}/g, ' ').trim();
}
