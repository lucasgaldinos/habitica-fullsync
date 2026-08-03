/**
 * Nested content scanner for the sync output file.
 *
 * Forward-scans an array of lines for nested content belonging to a parent task line — specifically `> [!note]` callout segments and indented checklist items (`  - [ ]` / `  - [x]` / `  + [ ]` / `  * [ ]`). Shared by the creation and update passes.
 */

import { ChecklistItemParsed } from '../types';
import { extractSubId, stripScoredMarker } from './inline-fields';

// -- checklist-item block parser (extracted from the former nested while-loop) --

/** Regex matching an indented checklist item line: `  - [ ] text` or `  * [x] text`. */
const CHECK_RE = /^\s{2,}[+\-*] \[[ xX]\] (.*)$/;

/** Regex matching an indented callout / note line: `  > text`. */
const NOTE_RE = /^\s{2,}> (.*)$/;

/**
 * Reads a single checklist-item block starting at `lineIndex`, including any multi-line continuation text indented deeper than the item itself.
 *
 * Blank lines followed by more continuation text are preserved as line breaks. Scanning stops at the next checklist item, note line, or outdent.
 *
 * @returns The parsed item (or `null` if the line is not a checklist item) and
 *          the index of the first line *after* the block.
 */
function readChecklistItemBlock(
  lines: string[],
  lineIndex: number,
): { item: ChecklistItemParsed | null; endIndex: number } {
  const match = lines[lineIndex].match(CHECK_RE);
  if (!match) return { item: null, endIndex: lineIndex + 1 };

  let text = stripScoredMarker(match[1]).trim();
  const checked = /^\s{2,}[+\-*] \[[xX]\]/.test(lines[lineIndex]);
  const subId = extractSubId(lines[lineIndex]);

  const checklistIndent = lines[lineIndex].match(/^(\s*)/)?.[1].length ?? 0;
  const continuationMin = checklistIndent + 2;

  let peek = lineIndex + 1;
  const continuationLines: string[] = [];

  while (peek < lines.length) {
    const peekLine = lines[peek];
    const peekIndent = peekLine.match(/^(\s*)/)?.[1].length ?? 0;

    // Stop at next checklist item or note line
    if (CHECK_RE.test(peekLine) || NOTE_RE.test(peekLine)) break;

    // Continuation: deeper indent, non-empty
    if (peekIndent >= continuationMin && peekLine.trim() !== '') {
      continuationLines.push(peekLine.slice(continuationMin));
      peek++;
      continue;
    }

    // Blank line: look ahead — if the next non-blank is continuation, keep it
    if (peekLine.trim() === '') {
      let lookahead = peek + 1;
      while (lookahead < lines.length && lines[lookahead].trim() === '')
        lookahead++;
      if (
        lookahead < lines.length &&
        (lines[lookahead].match(/^(\s*)/)?.[1].length ?? 0) >= continuationMin &&
        lines[lookahead].trim() !== ''
      ) {
        continuationLines.push('');
        peek++;
        continue;
      }
      break;
    }

    break; // outdent or unrecognized — block ends
  }

  if (continuationLines.length > 0) {
    text = text + '\n' + continuationLines.join('\n');
  }

  return {
    item: text ? { text, checked, subId } : null,
    endIndex: peek,
  };
}

// -- public API --

/**
 * Forward-scans from `startIndex` for nested content (notes and checklists)
 * belonging to a top-level task line. Scanning stops at the first line with
 * zero indent — nested content must be indented at least 2 spaces.
 *
 * @param lines      The full file content split by `\n`.
 * @param startIndex The line index immediately after the parent task line.
 * @returns The extracted notes string and checklist items, plus the index where scanning stopped.
 */
export function scanNestedContent(
  lines: string[],
  startIndex: number,
): { notes: string; checklistItems: ChecklistItemParsed[]; endIndex: number } {
  const noteSegs: string[] = [];
  const checklistItems: ChecklistItemParsed[] = [];
  let j = startIndex;

  for (; j < lines.length; j++) {
    const currentIndent = lines[j].match(/^(\s*)/)?.[1].length ?? 0;
    if (currentIndent === 0) break; // back to top-level — not our content

    const noteMatch = lines[j].match(NOTE_RE);
    if (noteMatch) {
      const seg = noteMatch[1].trim();
      if (seg && !/^\[!/.test(seg)) noteSegs.push(seg);
      continue;
    }

    if (CHECK_RE.test(lines[j])) {
      const { item, endIndex } = readChecklistItemBlock(lines, j);
      if (item) checklistItems.push(item);
      j = endIndex - 1;
      continue;
    }

    break; // not note, not checklist — done with nested content
  }

  return { notes: noteSegs.join('\n'), checklistItems, endIndex: j };
}
