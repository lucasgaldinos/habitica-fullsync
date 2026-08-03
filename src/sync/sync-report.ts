/**
 * Sync-report accumulator — owns the counters and summary-rendering that were previously inline in {@link SyncManager.sync}.
 *
 * Each step mutates the report; at the end `renderSummary()` produces the user-facing notice string.
 */

import { SyncConfig } from '../types';

export class SyncReport {
  createdCount = 0;
  createFailures = 0;
  updatedCount = 0;
  checklistAddedCount = 0;
  checklistScoredCount = 0;
  checklistUpdatedCount = 0;
  checklistDeletedCount = 0;
  deletedCount = 0;
  skippedDeletions = 0;
  scoreFailures = 0;
  skippedSections = new Set<string>();

  /** Builds the one-line summary notice shown after sync. */
  renderSummary(config: SyncConfig): string {
    const p = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

    // Data-driven — [count, label, suffix?] (S3).
    const parts: Array<[number, string, string?]> = [
      [this.createdCount, 'created task'],
      [this.createFailures, 'create failure', ' (see console)'],
      [this.updatedCount, 'updated task'],
      [this.checklistAddedCount, 'added checklist item'],
      [this.checklistScoredCount, 'scored checklist item'],
      [this.checklistUpdatedCount, 'updated checklist item'],
      [this.checklistDeletedCount, 'deleted checklist item'],
      [this.deletedCount, 'deleted task'],
      [this.skippedDeletions, 'skipped deletion', ' (challenge/group tasks)'],
      [this.scoreFailures, 'scoring failure', ' (see console)'],
    ];

    const fragments: string[] = [];
    for (const [count, label, suffix] of parts) {
      if (count <= 0) continue;
      fragments.push(`${p(count, label)}${suffix ?? ''}`);
    }

    let result = fragments.join(' — ');

    // Skipped sections (non-count, size-based)
    if (this.skippedSections.size > 0) {
      const names = [...this.skippedSections].join(', ');
      result += `${result ? ' — ' : ''}skipped unknown section${this.skippedSections.size === 1 ? '' : 's'}: ${names}`;
    }

    return `✅ Habitica sync complete: ${config.filePath}${result ? ` — ${result}` : ''}`;
  }
}
