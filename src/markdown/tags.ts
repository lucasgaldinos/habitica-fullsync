/**
 * Habitica tag sanitization and resolution utilities.
 *
 * Habitica tag names may contain spaces and characters Obsidian disallows in tags. These helpers sanitize tag names for Obsidian rendering, normalize them for comparison, and build reverse-lookup indexes for the creation and update passes.
 */

/** Renderer-only tags appended automatically by the formatter; never resolved/created as Habitica tags. */
export const RESERVED_TYPE_TAGS = new Set(['daily', 'habit', 'reward']);

/** Cache for {@link sanitizeTag} results — pure function, same input always yields same output. */
const sanitizeCache = new Map<string, string>();

/**
 * Sanitizes a Habitica tag name into a valid single-token Obsidian tag (without the leading `#`).
 *
 * Habitica tag names may contain spaces and other characters Obsidian disallows in tags (e.g. `data engineering`), which would render as a broken tag (`#data` + stray text). This collapses whitespace to single hyphens and strips characters Obsidian does not allow in tags, keeping letters (incl. Unicode), digits, `_`, `-`, and `/`. Results are cached — the same tag name on many tasks only sanitizes once.
 *
 * @param name Raw Habitica tag name.
 * @returns A sanitized tag body, or `'unknown'` if nothing valid remains.
 * @example sanitizeTag('data engineering') // → 'data-engineering'
 */
export function sanitizeTag(name: string): string {
  const raw = String(name ?? '');
  const cached = sanitizeCache.get(raw);
  if (cached !== undefined) return cached;
  const sanitized = raw
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\p{Extended_Pictographic}_\-/]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  const result = sanitized.length > 0 ? sanitized : 'unknown';
  sanitizeCache.set(raw, result);
  return result;
}

/**
 * Builds a normalized reverse lookup index mapping a tag's normalized form to its Habitica ID.
 *
 * Tag sanitization is lossy — `data engineering` and `data-engineering` both normalize to the same key — so this index lets a markdown tag (e.g. `#data-engineering`) be matched back to the original Habitica tag (`data engineering`) when creating tasks from markdown.
 *
 * @param tagLookup Map of Habitica tag UUID → tag name.
 * @returns Map of normalized tag name → tag UUID. Later duplicates overwrite earlier ones.
 */
export function buildTagReverseIndex(
  tagLookup: Record<string, string>,
): Record<string, string> {
  const index: Record<string, string> = {};
  for (const [id, name] of Object.entries(tagLookup)) {
    index[normalizeTagKey(name)] = id;
  }
  return index;
}

/**
 * Normalizes a tag name (or sanitized tag) into a comparison key.
 * Lowercases and collapses spaces / hyphens / underscores so separator and case differences do not prevent a match.
 *
 * @param name Raw or sanitized tag text.
 * @returns A normalized key (e.g. `'Data Engineering'` and `'data-engineering'` → `'data engineering'`).
 */
export function normalizeTagKey(name: string): string {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ');
}
