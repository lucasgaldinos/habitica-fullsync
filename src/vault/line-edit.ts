/**
 * Positional line-editing helpers — pure functions with no Obsidian dependency, designed for safe line replacement in the sync output file using line-index identity rather than substring matching.
 *
 * All functions operate on the full file content as a string so they compose cleanly with {@link Vault.process} (atomic read-modify-write).
 */

/**
 * Replaces the line at `lineIndex` (0-based) with `newLine`, verifying that the existing line matches `expectedLine`. Throws on mismatch.
 *
 * Use this as the canonical write-back path — the line's index was recorded during the parse pass, guaranteeing we replace the exact occurrence the parser saw.
 *
 * @param content      Full file content.
 * @param lineIndex    0-based line number in the content.
 * @param expectedLine What the current line should be (safety check).
 * @param newLine      Replacement line text.
 * @returns            The modified content.
 * @throws             If `expectedLine` does not match the actual line at `lineIndex`.
 */
export function spliceLineByIndex(
  content: string,
  lineIndex: number,
  expectedLine: string,
  newLine: string,
): string {
  const lines = content.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) {
    throw new Error(
      `line-edit spliceLineByIndex: lineIndex ${lineIndex} out of range (0–${lines.length - 1})`,
    );
  }
  const actual = lines[lineIndex];
  if (actual !== expectedLine) {
    throw new Error(
      `line-edit spliceLineByIndex: mismatch at line ${lineIndex}.\n  expected: ${JSON.stringify(expectedLine)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
  lines[lineIndex] = newLine;
  return lines.join('\n');
}

/**
 * Replaces a single, uniquely occurring whole line (anchored `^…$` by content) with `newLine`. Throws if `oldLine` appears 0 times or more than once.
 *
 * Use this as a fallback when line-number identity is unavailable (e.g. old data migrated from pre-positional plugin versions).
 *
 * @param content Full file content.
 * @param oldLine The exact line text to find (matches whole lines only).
 * @param newLine Replacement line text.
 * @returns       The modified content.
 * @throws        If `oldLine` matches 0 or >1 whole lines.
 */
export function replaceUniqueLine(
  content: string,
  oldLine: string,
  newLine: string,
): string {
  const escaped = escapeRegExp(oldLine);
  const pattern = new RegExp(`^${escaped}$`, 'gm');
  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    throw new Error(
      `line-edit replaceUniqueLine: oldLine not found in content.\n  line: ${JSON.stringify(oldLine)}`,
    );
  }
  if (matches.length > 1) {
    const indices = matches.map(m => {
      const upTo = content.slice(0, m.index);
      return upTo.split('\n').length - 1;
    });
    throw new Error(
      `line-edit replaceUniqueLine: oldLine is ambiguous (${matches.length} occurrences at lines ${indices.join(', ')}). Use spliceLineByIndex instead.\n  line: ${JSON.stringify(oldLine)}`,
    );
  }

  return (
    content.slice(0, matches[0].index) + newLine + content.slice(matches[0].index + oldLine.length)
  );
}

/**
 * Finds the 0-based line index of a line containing the given Habitica task ID (`[id:: <id>]`). Returns `-1` if not found.
 */
export function findLineIndexById(content: string, id: string): number {
  const idToken = `[id:: ${id}]`;
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(idToken)) return i;
  }
  return -1;
}

// ---- internal helpers ----

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
