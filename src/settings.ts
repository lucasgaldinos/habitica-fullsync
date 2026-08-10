/**
 * Plugin Settings — User-Configurable Habitica Sync Options.
 *
 * Provides a settings tab in Obsidian's settings UI that allows users to configure Habitica API credentials, sync behaviour, and safety toggles. Settings are persisted via Obsidian's `loadData()`/`saveData()` mechanism.
 *
 * ## Architecture (SOLID)
 *
 * - **`DEFAULT_SETTINGS`**: Single source of truth for default values. Used by `HabiticaSyncFullPlugin.loadSettings()` via `Object.assign`.
 * - **`IPluginSettingsHost`**: Interface Segregation — the settings tab depends on this minimal contract (`settings` + `saveSettings()`), not the concrete plugin class. The plugin satisfies it structurally; no import from `main.ts` needed.
 * - **`HabiticaSyncSettingTab`**: Single Responsibility — owns only settings UI rendering. Lives in its own file so `main.ts` stays lean.
 *
 * ## Settings
 *
 * | Setting             | Type                                    | Default  | Description                              |
 * |---------------------|-----------------------------------------|----------|------------------------------------------|
 * | `apiUser`           | `string`                                | `""`     | Habitica User ID (UUID)                  |
 * | `apiTokenSecretName`| `string`                                | `""`     | SecretStorage name for Habitica API token |
 * | `groupId`           | `string`                                | `""`     | Optional group ID for shared tasks       |
 * | `outputFolder`      | `string`                                | `""`     | Vault folder for `habitica-fullsync.md`  |
 * | `autoSync`          | `boolean`                               | `false`  | Enable periodic automatic sync           |
 * | `autoSyncPlatform`  | `'both' \| 'desktop' \| 'mobile'`       | `"both"` | Which devices run auto-sync              |
 * | `syncInterval`      | `number`                                | `30`     | Auto-sync interval in minutes            |
 * | `disableScoring`    | `boolean`                               | `false`  | Prevent scoring tasks in Habitica        |
 * | `disableCreating`   | `boolean`                               | `false`  | Prevent creating new Habitica tasks      |
 */

import type { SettingDefinitionItem } from 'obsidian';
import { App, Notice, PluginSettingTab, SecretComponent, Setting, Plugin } from 'obsidian';
import { IPluginSettingsHost } from './types/habitica';

/**
 * Obsidian settings tab for the Habitica Full Sync plugin.
 */
export class HabiticaSyncSettingTab extends PluginSettingTab {
  declare plugin: IPluginSettingsHost & Plugin;

  constructor(app: App, plugin: IPluginSettingsHost & Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [];
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('API user')
      .setDesc('Your Habitica API user ID')
      .addText(text => text
        .setPlaceholder('Enter API user')
        .setValue(this.plugin.pluginSettings.userId)
        .onChange(async (value) => {
          this.plugin.pluginSettings.userId = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('API token')
      .setDesc('Your Habitica API token, stored securely via Obsidian SecretStorage')
      .addComponent(el => new SecretComponent(this.app, el)
        .setValue(this.plugin.pluginSettings.apiTokenSecretName)
        .onChange(async (value) => {
          this.plugin.pluginSettings.apiTokenSecretName = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Group ID')
      .setDesc('Your Habitica group ID for shared tasks')
      .addText(text => text
        .setPlaceholder('Enter group ID')
        .setValue(this.plugin.pluginSettings.groupId ?? '')
        .onChange(async (value) => {
          this.plugin.pluginSettings.groupId = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Output file path')
      .setDesc('Path where Habitica tasks will be synced')
      .addText(text => text
        .setPlaceholder('Habitica/Sync.md')
        .setValue(this.plugin.pluginSettings.syncFilePath)
        .onChange(async (value) => {
          this.plugin.pluginSettings.syncFilePath = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Automatic sync')
      .setDesc('Enable automatic sync on load and every x minutes')
      .addToggle(toggle => toggle
        .setValue(Boolean(this.plugin.pluginSettings.autoSync))
        .onChange(async (value) => {
          this.plugin.pluginSettings.autoSync = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto sync platform')
      .setDesc('Choose which devices should run auto sync')
      .addDropdown(dropdown => dropdown
        .addOption('both', 'Both desktop and mobile')
        .addOption('desktop', 'Desktop only')
        .addOption('mobile', 'Mobile only')
        .setValue(this.plugin.pluginSettings.autoSyncPlatform ?? 'both')
        .onChange(async (value: string) => {
          this.plugin.pluginSettings.autoSyncPlatform = value as 'both' | 'desktop' | 'mobile';
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Sync interval (minutes)')
      .setDesc('How often to run auto-sync when enabled')
      .addText(text => text
        .setPlaceholder('E.g., 30')
        .setValue(String(this.plugin.pluginSettings.syncInterval ?? 30))
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num > 0) {
            this.plugin.pluginSettings.syncInterval = num;
            await this.plugin.saveSettings();
          } else {
            new Notice('Sync interval must be a positive number');
          }
        }));

    new Setting(containerEl)
      .setName('Disable scoring')
      .setDesc('Enable this to prevent scoring tasks in Habitica (read-only sync)')
      .addToggle(toggle => toggle
        .setValue(Boolean(this.plugin.pluginSettings.disableScoring))
        .onChange(async (value) => {
          this.plugin.pluginSettings.disableScoring = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Disable creating new tasks')
      .setDesc('Enable this to prevent creating new tasks in Habitica from non-Habitica tasks completed in Obsidian')
      .addToggle(toggle => toggle
        .setValue(Boolean(this.plugin.pluginSettings.disableCreating))
        .onChange(async (value) => {
          this.plugin.pluginSettings.disableCreating = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Scan vault for completed tasks')
      .setDesc('Scan all markdown files in your vault for checked-off tasks with a [completion::] field and score them in Habitica. When off, only the sync file (Habitica-fullsync.md) is checked.')
      .addToggle(toggle => toggle
        .setValue(Boolean(this.plugin.pluginSettings.enableVaultScan))
        .onChange(async (value) => {
          this.plugin.pluginSettings.enableVaultScan = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Completion lookback (days)')
      .setDesc('How many days back to look for recently completed tasks in your vault. Defaults to 4 — covers a typical weekend gap.')
      .addText(text => text
        .setPlaceholder('4')
        .setValue(String(this.plugin.pluginSettings.completionLookbackDays ?? 4))
        .onChange(async (value) => {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num > 0) {
            this.plugin.pluginSettings.completionLookbackDays = num;
            await this.plugin.saveSettings();
          } else {
            new Notice('Lookback must be a positive number');
          }
        }));
  }
}
