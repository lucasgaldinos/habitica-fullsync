import { App, TFile } from 'obsidian';

/**
 * Escapes all regex metacharacters in a string so it can be safely embedded in a `RegExp` pattern.
 *
 * Without escaping, characters like `.`, `*`, `(`, `)`, `[` etc. would act as regex operators,
 * causing incorrect line matches in {@link VaultHandler.updateLine}.
 *
 * @param string The raw string to escape.
 * @returns A copy with all metacharacters prefixed with `\`.
 * @example escapeRegExp('Buy milk (2L)') // → 'Buy milk \\(2L\\)'
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Provides read/write access to the Obsidian vault for the sync workflow.
 *
 * Wraps the Obsidian `App` vault API to:
 * - Scan Markdown files for recently completed tasks.
 * - Safely update individual task lines (ID-first strategy to avoid collisions).
 * - Create folders and write the sync output file.
 */
export class VaultHandler {
  private app: App;

  /** @param app The Obsidian application instance. Provides vault and file-system access. */
  constructor(app: App) {
    this.app = app;
  }

  /**
   * Scans all Markdown files modified on or after `cutoffDate` for completed tasks not yet scored.
   *
   * A task qualifies if:
   * 1. Its file `mtime` ≥ `cutoffDate`.
   * 2. The line starts with `- [x]`.
   * 3. The line does NOT contain `%%scored%%`.
   * 4. The line has a `[completion:: YYYY-MM-DD]` field with a date ≥ `cutoffDate`.
   *
   * @param cutoffDate Earliest date to consider (tasks and files older than this are skipped).
   * @returns Array of `{ line, file }` pairs for each qualifying task.
   */
  async getRecentCompletedTasks(cutoffDate: Date): Promise<Array<{ line: string; file: TFile }>> {
    const completedTasks: Array<{ line: string; file: TFile }> = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (file.stat.mtime < cutoffDate.getTime()) continue;
      const content = await this.app.vault.read(file);
      for (const line of content.split('\n')) {
        if (!line.startsWith('- [x]')) continue;
        if (line.includes('%%scored%%')) continue;
        const completionMatch = line.match(/\[completion:: (\d{4}-\d{2}-\d{2})\]/);
        if (!completionMatch) continue;
        const completionDate = new Date(completionMatch[1]);
        if (completionDate >= cutoffDate) {
          completedTasks.push({ line, file });
        }
      }
    }
    return completedTasks;
  }

  /**
   * Replaces an existing task line in a vault file with an updated version.
   *
   * Uses a three-strategy cascade to locate the target line:
   *
   * **Strategy 1 — ID match (preferred):** If `newLine` contains `[id:: <id>]`, searches for
   * any line in the file containing the same ID token. Stable and collision-proof.
   *
   * **Strategy 2 — Prefix-regex fallback:** Extracts the text before the first ` [id::` in
   * `newLine` and matches it as a prefix pattern. Used when the ID is not yet in the file.
   *
   * **Strategy 3 — Warning only:** If neither strategy matches, logs a warning without
   * modifying the file. Prevents silent data corruption.
   *
   * @param file    The vault file to update.
   * @param newLine The complete replacement line, including any new annotations like `%%scored%%`.
   */
  async updateLine(file: TFile, newLine: string): Promise<void> {
    const content = await this.app.vault.read(file);

    // Strategy 1: match by task ID (stable, collision-proof)
    const idMatch = newLine.match(/\[id:: ([^\]]+)\]/);
    if (idMatch) {
      const id = idMatch[1];
      const idPattern = new RegExp(`^[^\n]*\\[id:: ${escapeRegExp(id)}\\][^\n]*$`, 'm');
      if (idPattern.test(content)) {
        const updated = content.replace(idPattern, newLine);
        await this.app.vault.modify(file, updated);
        return;
      }
      // ID not found in file yet — fall through to prefix match
    }

    // Strategy 2: prefix-regex fallback (original behaviour)
    const prefix = newLine.split(' [id::')[0];
    const prefixPattern = new RegExp(`^${escapeRegExp(prefix)}.*$`, 'm');
    if (prefixPattern.test(content)) {
      const updated = content.replace(prefixPattern, newLine);
      await this.app.vault.modify(file, updated);
      return;
    }

    // Strategy 3: line not found — warn, do not silently corrupt file
    console.warn(`habitica-fullsync VaultHandler.updateLine: could not locate target line in "${file.path}". Line was:\n${newLine}`);
  }

  /**
   * Scans a single vault file for checked-off task lines with a Habitica ID that have
   * not yet been marked `%%scored%%`. Used to detect tasks the user marks complete
   * directly in the sync output file (`habitica-fullsync.md`).
   *
   * Only `todo` and `daily` task lines are safe to score via this path because:
   * - Habitica marks them `completed: true` after scoring, making them idempotent.
   * - Habits never become `completed: true`, so they would be re-scored on every sync
   *   until the file is regenerated.
   *
   * @param filePath Vault-relative path to the sync output file.
   * @returns Array of `{ id, line }` for each qualifying task, deduplicated by ID.
   */
  async getCheckedTasksFromFile(filePath: string): Promise<Array<{ id: string; line: string }>> {
    try {
      const content = await this.app.vault.adapter.read(filePath);
      const seen = new Set<string>();
      const results: Array<{ id: string; line: string }> = [];
      for (const line of content.split('\n')) {
        if (!line.startsWith('- [x]')) continue;
        if (line.includes('%%scored%%')) continue;
        const idMatch = line.match(/\[id:: ([^\]]+)\]/);
        if (idMatch && !seen.has(idMatch[1])) {
          seen.add(idMatch[1]);
          results.push({ id: idMatch[1], line });
        }
      }
      return results;
    } catch (_) {
      // File may not exist on first sync — silently return empty
      return [];
    }
  }

  /**
   * Scans a single vault file for hand-written task lines eligible to be created in Habitica.
   *
   * A line qualifies if it is a top-level (non-indented) `- [ ]` line that:
   * - has **no** `[id:: ...]` field (not yet a managed task),
   * - is not the `_No tasks found._` placeholder.
   *
   * The current `### ` level-3 heading is tracked as the line's `section` (used to infer task
   * type). Lines inside a `#### Group Tasks` subsection are **skipped** — group-task creation is
   * not supported and would otherwise create a personal task. Any following nested `> [!note]`
   * callout lines and nested `  - [ ]` checklist lines are gathered with the task.
   *
   * @param filePath Vault-relative path to the sync output file.
   * @returns Array of `{ line, section, notes, checklistTexts }`. Never throws — returns `[]`
   *          if the file does not exist yet.
   */
  async getCreatableLinesFromFile(filePath: string): Promise<Array<{ line: string; section: string; notes: string; checklistTexts: string[] }>> {
    try {
      const content = await this.app.vault.adapter.read(filePath);
      const lines = content.split('\n');
      const results: Array<{ line: string; section: string; notes: string; checklistTexts: string[] }> = [];
      let section = '';
      let inGroupSubsection = false;
      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const h3 = raw.match(/^### (.+)$/);
        if (h3) { section = h3[1].trim(); inGroupSubsection = false; continue; }
        if (/^#### /.test(raw)) { inGroupSubsection = true; continue; }
        if (!/^- \[ \] /.test(raw)) continue;
        if (raw.includes('[id::')) continue;
        if (raw.includes('_No tasks found._')) continue;
        if (inGroupSubsection) {
          console.warn(`habitica-fullsync VaultHandler.getCreatableLinesFromFile: skipping creatable line under "#### Group Tasks" (group-task creation unsupported): ${raw}`);
          continue;
        }
        // Gather following nested note callout and checklist lines
        const noteSegs: string[] = [];
        const checklistTexts: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const noteMatch = lines[j].match(/^\s{2,}> (.*)$/);
          const checkMatch = lines[j].match(/^\s{2,}- \[[ xX]\] (.*)$/);
          if (noteMatch) {
            const seg = noteMatch[1].trim();
            if (seg && !/^\[!/.test(seg)) noteSegs.push(seg);
            continue;
          }
          if (checkMatch) {
            const t = checkMatch[1].trim();
            if (t) checklistTexts.push(t);
            continue;
          }
          break;
        }
        results.push({ line: raw, section, notes: noteSegs.join('\n'), checklistTexts });
      }
      return results;
    } catch (_) {
      return [];
    }
  }

  /**
   * Replaces the first exact occurrence of `oldLine` with `newLine` in a file addressed by path.
   *
   * Used for crash-safe write-back of a newly assigned `[id:: ...]` immediately after task
   * creation, so a partial failure later in the sync cannot cause the same line to be created
   * twice on the next run. Uses the path-based adapter (the file is a generated artifact that
   * may not be a tracked `TFile` at this point).
   *
   * @param filePath Vault-relative path to the file.
   * @param oldLine  The exact current line text to replace.
   * @param newLine  The replacement line text.
   */
  async updateLineInFile(filePath: string, oldLine: string, newLine: string): Promise<void> {
    try {
      const content = await this.app.vault.adapter.read(filePath);
      if (!content.includes(oldLine)) {
        console.warn(`habitica-fullsync VaultHandler.updateLineInFile: could not locate line in "${filePath}".`);
        return;
      }
      await this.app.vault.adapter.write(filePath, content.replace(oldLine, newLine));
    } catch (err) {
      console.error(`habitica-fullsync VaultHandler.updateLineInFile: failed to update "${filePath}":`, err);
    }
  }

  /**
   * Ensures a folder exists in the vault, creating it if necessary.
   * Does nothing if `folderPath` is an empty string.
   * @param folderPath Vault-relative path (e.g. `'Habitica/Tasks'`).
   */
  async ensureFolder(folderPath: string): Promise<void> {
    if (!folderPath) return;
    const folderExists = await this.app.vault.adapter.exists(folderPath);
    if (!folderExists) {
      await this.app.vault.createFolder(folderPath);
    }
  }

  /**
   * Writes a string to a vault file, creating or overwriting it.
   * Uses `vault.adapter.write` to allow writing to paths that may or may not already exist.
   * @param filePath Vault-relative path (e.g. `'Habitica/habitica-fullsync.md'`).
   * @param content  The complete string content to write.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    await this.app.vault.adapter.write(filePath, content);
  }
}
