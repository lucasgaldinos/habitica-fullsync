import { App, normalizePath, TFile } from 'obsidian';
import { spliceLineByIndex } from './line-edit';
import { extractCompletionDate, hasScoredMarker } from '../markdown/inline-fields';

/**
 * Provides read/write access to the Obsidian vault for the sync workflow.
 *
 * Wraps the Obsidian `App` vault API to:
 * - Scan Markdown files for recently completed tasks.
 * - Safely update individual task lines using positional (line-index) identity.
 * - Create folders and write the sync output file.
 */
export class VaultHandler {
  private app: App;
  private recentlyChanged: Set<string> = new Set();

  /** @param app The Obsidian application instance. Provides vault and file-system access. */
  constructor(app: App) {
    this.app = app;
  }

  /** Called by main.ts when MetadataCache fires 'changed'. Tracks files for incremental scan. */
  onFileChanged(file: TFile): void {
    this.recentlyChanged.add(file.path);
  }

  /**
   * Reads a file's full text content by path. Prefers {@link Vault.cachedRead} when the file is tracked as a {@link TFile}; falls back to the adapter for first-sync (file may not exist yet). Returns an empty string if the file cannot be read.
   */
  async readFileContent(filePath: string): Promise<string> {
    try {
      const normalized = normalizePath(filePath);
      const file = this.app.vault.getAbstractFileByPath(normalized);
      if (file instanceof TFile) {
        return await this.app.vault.cachedRead(file);
      }
      return await this.app.vault.adapter.read(normalized);
    } catch {
      return '';
    }
  }

  /**
   * Scans all Markdown files modified on or after `cutoffDate` for completed tasks not yet scored.
   *
   * Delegates per-file processing to {@link _scanFileForCompleted}. Uses {@link MetadataCache.getFileCache} `listItems` to pre-filter — files with no completed task list items are skipped without being read.
   *
   * @param cutoffDate  Earliest date to consider.
   * @param excludePath Vault-relative path to skip (the sync output file itself).
   * @returns Array of `{ line, file, lineNumber }` for each qualifying task.
   */
  async getRecentCompletedTasks(
    cutoffDate: Date,
    excludePath?: string,
  ): Promise<Array<{ line: string; file: TFile; lineNumber: number }>> {
    const completedTasks: Array<{ line: string; file: TFile; lineNumber: number }> = [];

    // Incremental scan: only check recently changed files if available
    let filesToScan = this.app.vault.getMarkdownFiles();
    if (this.recentlyChanged.size > 0) {
      const changedSet = this.recentlyChanged;
      this.recentlyChanged = new Set(); // consume the set
      filesToScan = filesToScan.filter(f => changedSet.has(f.path));
    }

    for (const file of filesToScan) {
      if (file.stat.mtime < cutoffDate.getTime()) continue;
      if (excludePath && file.path === excludePath) continue;

      const fileResults = await this._scanFileForCompleted(file, cutoffDate);
      completedTasks.push(...fileResults);
    }
    return completedTasks;
  }

  /**
   * Scans a single Markdown file for completed tasks meeting the cutoff.
   *
   * Pre-filters via {@link MetadataCache.getFileCache} — files with no completeds list items are skipped without being read. For qualifying files, each completed line is checked for `%%scored%%` and `[completion::]`.
   */
  private async _scanFileForCompleted(
    file: TFile,
    cutoffDate: Date,
  ): Promise<Array<{ line: string; file: TFile; lineNumber: number }>> {
    // Pre-filter via MetadataCache — skip files with no completed list items
    const cache = this.app.metadataCache.getFileCache(file);
    const completedItems = cache?.listItems?.filter(
      li => li.task && li.task !== ' ',
    );
    if (!completedItems || completedItems.length === 0) return [];

    const content = await this.app.vault.cachedRead(file);
    const lines = content.split('\n');
    const results: Array<{ line: string; file: TFile; lineNumber: number }> = [];

    for (const li of completedItems) {
      const line = lines[li.position.start.line];
      if (!line) continue;
      if (hasScoredMarker(line)) continue;
      const completionDateStr = extractCompletionDate(line);
      if (!completionDateStr) continue;
      const completionDate = new Date(completionDateStr + 'T00:00:00Z');
      if (completionDate >= cutoffDate) {
        results.push({ line, file, lineNumber: li.position.start.line });
      }
    }
    return results;
  }

  // ── Shared helpers ─────────────────────────────────────────────────────

  /** Pure helper: replaces `content[lineIndex]` with `newLine`, verifying `oldLine`. */
  private _spliceLine(content: string, lineIndex: number, oldLine: string, newLine: string): string {
    return spliceLineByIndex(content, lineIndex, oldLine, newLine);
  }

  /** Writes content to a file, picking the best Vault API for the target type (S4). */
  private async _writeContent(target: TFile | string, content: string): Promise<void> {
    if (target instanceof TFile) {
      await this.app.vault.modify(target, content);
      return;
    }
    const normalized = normalizePath(target);
    // Path-based: prefer vault.process on a tracked TFile, fall back to adapter
    const file = this.app.vault.getAbstractFileByPath(normalized);
    if (file instanceof TFile) {
      await this.app.vault.process(file, () => content);
      return;
    }
    await this.app.vault.adapter.write(normalized, content);
  }

  /** Reads content from a file, picking the best Vault API for the target type. */
  private async _readContent(target: TFile | string): Promise<string> {
    if (target instanceof TFile) return this.app.vault.read(target);
    const normalized = normalizePath(target);
    const file = this.app.vault.getAbstractFileByPath(normalized);
    if (file instanceof TFile) return this.app.vault.cachedRead(file);
    return this.app.vault.adapter.read(normalized);
  }

  // ── Line update (positional primary + legacy fallbacks) ────────────────

  /**
   * Replaces a single line by positional index (primary path). Reads content, splices the line at `lineIndex` (verifying against `oldLine`), and writes back.
   *
   * Accepts either a {@link TFile} or a vault-relative path string. When given a `TFile`, uses `vault.read`/`vault.modify`. When given a path, tries `vault.process` on a tracked `TFile` first, falling back to `adapter`.

   * @param target     The vault file (as TFile) or vault-relative path string.
   * @param lineNumber 0-based index of the line to replace.
   * @param oldLine    Expected current line text (verified before write).
   * @param newLine    Replacement line text.
   */
  async updateLine(
    target: TFile | string,
    lineNumber: number,
    oldLine: string,
    newLine: string,
  ): Promise<void> {
    const content = await this._readContent(target);
    await this._writeContent(target, this._spliceLine(content, lineNumber, oldLine, newLine));
  }

  /**
   * Ensures a folder exists in the vault, creating it if necessary. Does nothing if `folderPath` is an empty string.
   * @param folderPath Vault-relative path (e.g. `'Habitica/Tasks'`).
   */
  async ensureFolder(folderPath: string): Promise<void> {
    if (!folderPath) return;
    const normalized = normalizePath(folderPath);
    const folderExists = await this.app.vault.adapter.exists(normalized);
    if (!folderExists) {
      await this.app.vault.createFolder(normalized);
    }
  }

  /**
   * Writes a string to a vault file, creating or overwriting it. Delegates to
   * {@link _writeContent} which picks the best Vault API for the target.
   * @param filePath Vault-relative path (e.g. `'Habitica/habitica-fullsync.md'`).
   * @param content  The complete string content to write.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    await this._writeContent(normalizePath(filePath), content);
  }
}
