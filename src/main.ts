import { Notice, Plugin } from 'obsidian';
import { HabiticaApiClient } from './api/api-client';
import { isMobilePlatform, shouldAutoSync } from './lib/platform';
import { DEFAULT_SETTINGS, HabiticaSyncSettingTab } from './settings';
import { SyncManager } from './sync/sync-manager';
import { PluginSettings } from './types';
import { VaultHandler } from './vault/vault-handler';

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
class HabiticaSyncFullPlugin extends Plugin {
  // Definite assignment (`!`) is safe here — all four fields are initialised in onload() before any method touches them. A factory function would be more idiomatic but adds indirection for no behavioural gain.
  settings!: PluginSettings;
  private apiClient!: HabiticaApiClient;
  private vaultHandler!: VaultHandler;
  private syncManager!: SyncManager;
  /** Handle returned by `setInterval` for the auto-sync timer. `undefined` when auto-sync is off. */
  private autoSyncInterval?: number;
  private statusBarItem!: HTMLElement;

  async onload(): Promise<void> {
    await this.loadSettings();

    const apiToken = await this._resolveApiToken();
    this.apiClient = new HabiticaApiClient(this.settings.apiUser, apiToken);
    this.vaultHandler = new VaultHandler(this.app);
    this.syncManager = new SyncManager(
      this.apiClient,
      this.vaultHandler,
      this.settings,
      msg => new Notice(msg)
    );

    this.addCommand({
      id: 'sync-habitica',
      name: 'Sync Habitica tasks',
      callback: () => this.syncHabitica(true)
    });

    this.addSettingTab(new HabiticaSyncSettingTab(this.app, this));
    this.addRibbonIcon('refresh-cw', 'Sync Habitica tasks', () => this.syncHabitica(true));
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.setText('🔄 Ready');
    this.app.workspace.onLayoutReady(() => this._scheduleAutoSync());

    // O6: incremental vault scanning — track changed files between syncs
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        this.vaultHandler.onFileChanged(file);
      })
    );
  }

  onunload(): void {}

  /** Starts or restarts the auto-sync interval based on current settings. */
  private _scheduleAutoSync(): void {
    if (this.autoSyncInterval) {
      window.clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = undefined;
    }
    const platformSetting = this.settings.autoSyncPlatform || 'both';
    if (this.settings.autoSync && shouldAutoSync(platformSetting, isMobilePlatform())) {
      this.autoSyncInterval = window.setInterval(
        () => { void this.syncHabitica(); },
        this.settings.syncInterval * 60 * 1000,
      );
      this.registerInterval(this.autoSyncInterval);
    }
  }

  /**
   * Loads settings from Obsidian's data store, merging stored values over {@link DEFAULT_SETTINGS}.
   */
  async loadSettings(): Promise<void> {
    const stored = await this.loadData() as Partial<PluginSettings> | undefined;
    this.settings = { ...DEFAULT_SETTINGS, ...stored };
  }

  /** Resolves the actual API token from SecretStorage. Awaiting handles both sync and async {@link SecretStorage} implementations — no-op on a string, correct on a Promise. */
  private async _resolveApiToken(): Promise<string> {
    const name = this.settings.apiTokenSecretName;
    if (!name) {
      new Notice('Habitica Full Sync: API token not configured. Set a secret name in plugin settings.');
      return '';
    }
    const token = (await this.app.secretStorage.getSecret(name)) ?? '';
    if (!token) {
      new Notice('Habitica Full Sync: Could not read API token from SecretStorage. Re-enter it in plugin settings.');
    }
    return token;
  }

  /**
   * Persists settings and conditionally rebuilds the API client. The API client + SyncManager are only reconstructed when credentials actually change.
   */
  async saveSettings(): Promise<void> {
    const oldUser = this.apiClient?.userId;
    const oldToken = this.apiClient?.apiToken;

    await this.saveData(this.settings);

    // Rebuild API client + SyncManager only when credentials change.
    // The old SyncManager may still have a sync in flight — it will complete
    // using the old API client (still valid) and be garbage-collected afterwards.
    const newToken = await this._resolveApiToken();
    if (this.settings.apiUser !== oldUser || newToken !== oldToken) {
      this.apiClient = new HabiticaApiClient(this.settings.apiUser, newToken);
      this.syncManager = new SyncManager(
        this.apiClient,
        this.vaultHandler,
        this.settings,
        msg => new Notice(msg)
      );
    }
    this._scheduleAutoSync();
  }

  /**
   * Triggers a full Habitica ↔ Obsidian sync.
   * @param allowUpdates When `true`, task field edits in the markdown are pushed to Habitica. Defaults to `false` (auto-sync never mutates task metadata).
   */
  async syncHabitica(allowUpdates?: boolean): Promise<void> {
    this.statusBarItem.setText('⏳ Syncing…');
    try {
      const result = await this.syncManager.sync({ allowUpdates });
      if (result === 'completed') {
        this.statusBarItem.setText('✅ Synced just now');
      } else {
        // skipped — restore ready state, don't lie about syncing
        this.statusBarItem.setText('🔄 Ready');
      }
    } catch (err) {
      this.statusBarItem.setText('❌ Sync failed');
      throw err;
    }
  }
}

export default HabiticaSyncFullPlugin;
