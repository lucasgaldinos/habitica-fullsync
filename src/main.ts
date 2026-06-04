import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { HabiticaApiClient } from './api-client';
import { isMobilePlatform } from './helpers';
import { SyncManager } from './sync-manager';
import { PluginSettings } from './types';
import { VaultHandler } from './vault-handler';

/**
 * Main Obsidian plugin class for Habitica Full Sync.
 *
 * Initialises the API client, vault handler, and sync manager on load.
 * Registers the "Sync Habitica Tasks" command palette command.
 * Adds the settings tab to Obsidian's settings UI.
 * Conditionally starts an auto-sync interval based on user preferences and detected platform.
 */
class HabiticaSyncFullPlugin extends Plugin {
  settings!: PluginSettings;
  private apiClient!: HabiticaApiClient;
  private vaultHandler!: VaultHandler;
  private syncManager!: SyncManager;
  /** Handle returned by `setInterval` for the auto-sync timer. `undefined` when auto-sync is off. */
  private autoSyncInterval?: number;

  /**
   * Lifecycle hook called when Obsidian loads the plugin.
   *
   * Performs in order:
   * 1. Loads persisted settings.
   * 2. Instantiates `HabiticaApiClient`, `VaultHandler`, and `SyncManager`.
   * 3. Registers the `sync-habitica` command in the command palette.
   * 4. Adds the settings tab.
   * 5. If `autoSync` is enabled and the current platform matches `autoSyncPlatform`,
   *    runs an immediate sync and starts the repeat interval.
   */
  async onload(): Promise<void> {
    await this.loadSettings();

    this.apiClient = new HabiticaApiClient(this.settings.apiUser, this.settings.apiToken);
    this.vaultHandler = new VaultHandler(this.app);
    this.syncManager = new SyncManager(
      this.apiClient,
      this.vaultHandler,
      this.settings,
      msg => new Notice(msg)
    );

    this.addCommand({
      id: 'sync-habitica',
      name: 'Sync Habitica Tasks',
      callback: () => this.syncHabitica()
    });

    this.addSettingTab(new HabiticaSyncSettingTab(this.app, this));

    const platformSetting = this.settings.autoSyncPlatform || 'both';
    const isMobile = isMobilePlatform();

    let shouldAutoSync = false;
    if (platformSetting === 'both') shouldAutoSync = true;
    else if (platformSetting === 'desktop' && !isMobile) shouldAutoSync = true;
    else if (platformSetting === 'mobile' && isMobile) shouldAutoSync = true;

    if (this.settings.autoSync && shouldAutoSync) {
      this.syncHabitica();
      const intervalMs = this.settings.syncInterval * 60 * 1000;
      this.autoSyncInterval = window.setInterval(() => this.syncHabitica(), intervalMs);
    }
  }

  /**
   * Lifecycle hook called when the plugin is disabled or Obsidian shuts down.
   * Clears the auto-sync interval to prevent memory leaks and stale callbacks.
   */
  onunload(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }

  /**
   * Loads plugin settings from Obsidian's data store, merging with defaults.
   *
   * Uses `Object.assign` so stored values override defaults while unknown stored keys
   * (e.g. a removed `machineId` from a previous version's `data.json`) are silently ignored.
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({
      apiUser: '',
      apiToken: '',
      groupId: '',
      outputFolder: '',
      autoSync: false,
      autoSyncPlatform: 'both',
      syncInterval: 30,
      disableScoring: false,
      disableCreating: false
    }, await this.loadData());
  }

  /**
   * Persists the current settings to Obsidian's data store and rebuilds the API client
   * so credential changes (API User / API Token) take effect immediately without
   * requiring a plugin reload.
   * Called after every settings change in {@link HabiticaSyncSettingTab}.
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.apiClient = new HabiticaApiClient(this.settings.apiUser, this.settings.apiToken);
    this.syncManager = new SyncManager(
      this.apiClient,
      this.vaultHandler,
      this.settings,
      msg => new Notice(msg)
    );
  }

  /**
   * Triggers a full Habitica ↔ Obsidian sync.
   * Delegates to `SyncManager.sync()`, which handles concurrency guarding and error reporting.
   */
  async syncHabitica(): Promise<void> {
    await this.syncManager.sync();
  }
}

/**
 * Obsidian settings tab for the Habitica Full Sync plugin.
 *
 * Renders all configurable options using the Obsidian `Setting` API.
 * Notable: the API Token field sets `text.inputEl.type = 'password'` to mask the input,
 * preventing casual shoulder-surfing without affecting the stored value.
 */
class HabiticaSyncSettingTab extends PluginSettingTab {
  plugin: HabiticaSyncFullPlugin;

  /**
   * @param app    The Obsidian application instance.
   * @param plugin The parent plugin instance, providing access to settings and save methods.
   */
  constructor(app: App, plugin: HabiticaSyncFullPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Renders all settings controls into the settings container.
   * Settings (in order): API User, API Token (password-masked), Group ID, Output Folder,
   * Automatic Sync toggle, Auto Sync Platform dropdown, Sync Interval, Disable Scoring,
   * Disable Creating New Tasks.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('API User')
      .setDesc('Your Habitica API User ID')
      .addText(text => text
        .setPlaceholder('Enter API User')
        .setValue(this.plugin.settings.apiUser)
        .onChange(async (value) => {
          this.plugin.settings.apiUser = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('API Token')
      .setDesc('Your Habitica API Token (kept in Obsidian local storage; do not share your vault)')
      .addText(text => {
        text
          .setPlaceholder('Enter API Token')
          .setValue(this.plugin.settings.apiToken)
          .onChange(async (value) => {
            this.plugin.settings.apiToken = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
        return text;
      });

    new Setting(containerEl)
      .setName('Group ID')
      .setDesc('Your Habitica Group ID for shared tasks')
      .addText(text => text
        .setPlaceholder('Enter Group ID')
        .setValue(this.plugin.settings.groupId)
        .onChange(async (value) => {
          this.plugin.settings.groupId = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Output folder')
      .setDesc('Folder where habitica-fullsync.md will be saved (leave blank for vault root)')
      .addText(text => text
        .setPlaceholder('e.g., Habitica')
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async (value) => {
          this.plugin.settings.outputFolder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Automatic sync')
      .setDesc('Enable automatic sync on load and every X minutes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoSync)
        .onChange(async (value) => {
          this.plugin.settings.autoSync = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto sync platform')
      .setDesc('Choose which devices should run auto sync')
      .addDropdown(dropdown => {
        dropdown
          .addOption('both', 'Both Desktop and Mobile')
          .addOption('desktop', 'Desktop Only')
          .addOption('mobile', 'Mobile Only')
          .setValue(this.plugin.settings.autoSyncPlatform || 'both')
          .onChange(async (value: 'both' | 'desktop' | 'mobile') => {
            this.plugin.settings.autoSyncPlatform = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Sync interval (minutes)')
      .setDesc('How often to run auto-sync when enabled')
      .addText(text => text
        .setPlaceholder('e.g., 30')
        .setValue(String(this.plugin.settings.syncInterval))
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num > 0) {
            this.plugin.settings.syncInterval = num;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName('Disable scoring')
      .setDesc('Enable this to prevent scoring tasks in Habitica (read-only sync)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.disableScoring)
        .onChange(async (value) => {
          this.plugin.settings.disableScoring = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Disable creating new tasks')
      .setDesc('Enable this to prevent creating new tasks in Habitica from non-habitica tasks completed in Obsidian')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.disableCreating)
        .onChange(async (value) => {
          this.plugin.settings.disableCreating = value;
          await this.plugin.saveSettings();
        }));
  }
}

export default HabiticaSyncFullPlugin;
