/**
 * Single-pass sync-file model — parses the plugin's output file into a structured array of {@link SyncFileEntry} objects, replacing the three formerly duplicated scan loops in {@link VaultHandler}.
 *
 * The model is pure (no Obsidian imports) and testable with Node's test runner.
 */

import { ChecklistItemParsed } from '../types';
import { extractId, hasScoredMarker } from '../markdown/inline-fields';
import { scanNestedContent } from '../markdown/scanner';

/** Kinds of task lines in the sync output file. */
export type SyncFileEntryKind = 'checked' | 'creatable' | 'managed';

/**
 * A parsed entry from the sync output file. Only task lines (`- [ ]` / `- [x]`) produce entries; heading lines, dataview fences, and blank lines are consumed internally but not emitted.
 */
export interface SyncFileEntry {
  /** 0-based line number in the file. */
  lineNumber: number;
  /** The raw line text, exactly as it appears in the file. */
  raw: string;
  /** Classification of this task line. */
  kind: SyncFileEntryKind;
  /** The current `## ` heading text (section name) at this line's position. */
  section: string;
  /** Whether this line falls inside a `### Group Tasks` subsection. */
  inGroupSubsection: boolean;
  /** Habitica task UUID from `[id:: …]`, or `undefined` if not yet assigned. */
  id?: string;
  /** Notes extracted from following `> [!note]` callout lines. Empty string if none. */
  notes: string;
  /** Checklist items extracted from following indented `- [ ]` / `- [x]` lines. */
  checklistItems: ChecklistItemParsed[];
}

/**
 * Parses the sync output file into a structured array of task-line entries.
 *
 * A single pass over the content:
 * 1. Tracks `## ` heading (section) and `### ` markers (group subsection flag).
 * 2. Classifies each top-level `- [ ]` / `- [x]` line as `checked`, `creatable`, or `managed`.
 * 3. Runs {@link scanNestedContent} for each task line to collect notes and checklist items.
 * 4. Skips `_No tasks found._` placeholders, blank lines, dataview fences, and task lines inside group subsections.
 *
 * @param content The full text content of the sync output file.
 * @returns Array of parsed entries in file order.
 */
export function parseSyncFile(content: string): SyncFileEntry[] {
  const lines = content.split('\n');
  const entries: SyncFileEntry[] = [];
  let section = '';
  let inGroupSubsection = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // Heading detection — ## sets section, ### toggles group subsection
    const h2Match = raw.match(/^## (.+)$/);
    if (h2Match) {
      section = h2Match[1].trim();
      inGroupSubsection = false;
      continue;
    }
    if (/^### /.test(raw)) {
      inGroupSubsection = true;
      continue;
    }

    // Only top-level task lines (no leading whitespace) are classified
    if (!/^- \[[ xX]\] /.test(raw)) continue;

    // Skip placeholder
    if (raw.includes('_No tasks found._')) continue;

    // Classify
    const id = extractId(raw);
    const scored = hasScoredMarker(raw);
    if (scored) continue; // already processed in a prior sync
    const checked = /^- \[[xX]\]/.test(raw);
    const isGroupTask = inGroupSubsection;

    let kind: SyncFileEntryKind;
    if (checked && id) {
      kind = 'checked';
    } else if (!id && !checked && !isGroupTask) {
      kind = 'creatable';
    } else if (id && !isGroupTask) {
      kind = 'managed';
    } else {
      // scored checked line, group-task line, or otherwise not actionable
      continue;
    }

    // Gather nested content via shared scanner
    const nested = scanNestedContent(lines, i + 1);

    entries.push({
      lineNumber: i,
      raw,
      kind,
      section,
      inGroupSubsection: false, // group-task lines are skipped above via isGroupTask — this field is always false in output
      id,
      notes: nested.notes,
      checklistItems: nested.checklistItems,
    });

    i = nested.endIndex - 1; // skip scanned lines
  }

  return entries;
}
