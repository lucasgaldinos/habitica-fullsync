import { Notice, Plugin } from 'obsidian';
import { HabiticaApiClient } from './api/api-client';
import { isMobilePlatform, shouldAutoSync } from './lib/platform';
import { DEFAULT_SETTINGS, HabiticaSyncSettingTab } from './settings';
import { SyncManager } from './sync/sync-manager';
import { PluginSettings } from './types';
import { VaultHandler } from './vault/vault-handler';
import { SQLiteStore } from './db/sqlite-store';

const IS_DEBUG = process.env.NODE_ENV === 'development';

/**
 * Main Obsidian plugin class for Habitica Full Sync.
 *
 * Responsibilities (SRP — orchestration only):
 * 1. Load/save settings (delegates defaults to {@link DEFAULT_SETTINGS}).
 * 2. Wire up API client, vault handler, and sync manager.
 * 3. Register the command-palette command and settings tab.
 * 4. Start/stop the auto-sync interval.
 *
 * Settings UI lives in {@link HabiticaSyncSettingTab} (`./settings.ts`). Domain helpers live in `./platform.ts`, `./tags.ts`, `./scanner.ts`, `./dataview.ts`, `./formatter.ts`, `./parser.ts`.
 */
export default class HabiticaSyncFullPlugin extends Plugin {
  declare settings: PluginSettings;
  private apiClient!: HabiticaApiClient;
  private vaultHandler!: VaultHandler;
  private sqliteStore!: SQLiteStore;
  private syncManager!: SyncManager;
  /** Handle returned by `setInterval` for the auto-sync timer. `undefined` when auto-sync is off. */
  private autoSyncInterval?: number;
  private statusBarItem!: HTMLElement;

  async onload(): Promise<void> {
    await this.loadSettings();

    const apiToken = await this._resolveApiToken();
    this.apiClient = new HabiticaApiClient(this.settings.apiUser, apiToken, {
      debug: IS_DEBUG,
    });
    this.vaultHandler = new VaultHandler(this.app);
    this.sqliteStore = new SQLiteStore(this.app);
    
    await this.sqliteStore.init();

    this.syncManager = new SyncManager(
      this.apiClient,
      this.vaultHandler,
      this.settings,
      this.sqliteStore,
      this.app,
      msg => new Notice(msg)
    );

    this.addCommand({
      id: 'pull-habitica',
      name: 'Habitica: Pull from remote',
      callback: () => this.pullHabitica()
    });

    this.addCommand({
      id: 'push-habitica',
      name: 'Habitica: Push local changes',
      callback: () => this.pushHabitica()
    });

    this.addCommand({
      id: 'sync-both-habitica',
      name: 'Habitica: Sync both (push then pull)',
      callback: () => this.syncBothHabitica()
    });

    this.addSettingTab(new HabiticaSyncSettingTab(this.app, this));
    this.addRibbonIcon('refresh-cw', 'Sync Habitica tasks', () => this.syncBothHabitica());
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.setText('🔄 Ready');
    this.app.workspace.onLayoutReady(() => this._scheduleAutoSync());

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        this.vaultHandler.onFileChanged(file);
      })
    );
  }

  onunload(): void {
    if (this.sqliteStore) {
      void this.sqliteStore.close();
    }
  }

  /** Starts or restarts the auto-sync interval based on current settings. */
  private _scheduleAutoSync(): void {
    if (this.autoSyncInterval) {
      window.clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = undefined;
    }
    const platformSetting = this.settings.autoSyncPlatform || 'both';
    if (this.settings.autoSync && shouldAutoSync(platformSetting, isMobilePlatform())) {
      this.autoSyncInterval = window.setInterval(
        () => { void this.pullHabitica(true); },
        this.settings.syncInterval * 60 * 1000,
      );
      this.registerInterval(this.autoSyncInterval);
    }
  }

  /**
   * Loads settings from Obsidian's data store, merging stored values over {@link DEFAULT_SETTINGS}.
   * @returns A promise that resolves when settings are loaded.
   */
  async loadSettings(): Promise<void> {
    const stored = await this.loadData() as Partial<PluginSettings> | undefined;
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
  }

  /** 
   * Resolves the actual API token from SecretStorage. Awaiting handles both sync and async {@link SecretStorage} implementations — no-op on a string, correct on a Promise.
   * @returns The resolved API token string.
   */
  private async _resolveApiToken(): Promise<string> {
    const name = this.settings.apiTokenSecretName;
    if (!name) {
      new Notice('Habitica full sync: API token not configured.');
      return '';
    }
    const token = this.app.secretStorage.getSecret(name) ?? '';
    if (!token) {
      new Notice('Habitica full sync: Could not read API token.');
    }
    return token;
  }

  /**
   * Persists settings and conditionally rebuilds the API client. The API client + SyncManager are only reconstructed when credentials actually change.
   * @returns A promise that resolves when settings are saved.
   */
  async saveSettings(): Promise<void> {
    const oldUser = this.apiClient?.userId;
    const oldToken = this.apiClient?.apiToken;

    await this.saveData(this.settings);

    const newToken = await this._resolveApiToken();
    if (this.settings.apiUser !== oldUser || newToken !== oldToken) {
      this.apiClient = new HabiticaApiClient(this.settings.apiUser, newToken, {
        debug: IS_DEBUG,
      });
      this.syncManager = new SyncManager(
        this.apiClient,
        this.vaultHandler,
        this.settings,
        this.sqliteStore,
        this.app,
        msg => new Notice(msg)
      );
    }
    this._scheduleAutoSync();
  }

  /**
   * Triggers a pull from Habitica to Obsidian.
   * @param isAutoSync When `true`, indicates the pull was triggered by the background interval. Defaults to `false`.
   * @returns A promise that resolves when the pull completes.
   */
  async pullHabitica(isAutoSync = false): Promise<void> {
    this.statusBarItem.setText('⏳ Pulling…');
    try {
      const result = await this.syncManager.pull(isAutoSync);
      if (result === 'completed') {
        this.statusBarItem.setText('✅ Pulled');
      } else if (result === 'snoozed') {
        this.statusBarItem.setText('💤 Snoozed');
        // Pause auto sync by clearing interval and scheduling it again in 1 hr
        if (this.autoSyncInterval) {
          window.clearInterval(this.autoSyncInterval);
          this.autoSyncInterval = undefined;
          window.setTimeout(() => this._scheduleAutoSync(), 60 * 60 * 1000);
        }
      } else {
        this.statusBarItem.setText('🔄 Ready');
      }
    } catch (err) {
      this.statusBarItem.setText('❌ Pull failed');
      throw err;
    }
  }

  /**
   * Pushes local task changes from Obsidian to Habitica.
   * @returns A promise that resolves when the push completes.
   */
  async pushHabitica(): Promise<void> {
    this.statusBarItem.setText('⏳ Pushing…');
    try {
      const result = await this.syncManager.push();
      if (result === 'completed') {
        this.statusBarItem.setText('✅ Pushed');
        // Reset snooze if pushed manually
        this._scheduleAutoSync();
      } else {
        this.statusBarItem.setText('🔄 Ready');
      }
    } catch (err) {
      this.statusBarItem.setText('❌ Push failed');
      throw err;
    }
  }

  /**
   * Triggers a full Habitica ↔ Obsidian sync (push then pull).
   * @returns A promise that resolves when both push and pull complete.
   */
  async syncBothHabitica(): Promise<void> {
    this.statusBarItem.setText('⏳ Syncing…');
    try {
      await this.syncManager.push();
      await this.syncManager.pull();
      this.statusBarItem.setText('✅ Synced');
      this._scheduleAutoSync();
    } catch (err) {
      this.statusBarItem.setText('❌ Sync failed');
      throw err;
    }
  }
}
