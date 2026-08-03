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

import { App, Notice, Plugin, PluginSettingTab, SecretComponent, Setting } from 'obsidian';
import { AutoSyncPlatform, PluginSettings } from './types';

// ── Defaults (single source of truth) ─────────────────────────────────────

export const DEFAULT_SETTINGS: PluginSettings = {
  apiUser: '',
  apiTokenSecretName: '',
  groupId: '',
  outputFolder: '',
  autoSync: false,
  autoSyncPlatform: 'both',
  syncInterval: 30,
  disableScoring: false,
  disableCreating: false,
  enableVaultScan: false,
  completionLookbackDays: 4
};

// ── Interface Segregation (DIP) ───────────────────────────────────────────

/**
 * Minimal contract the settings tab needs from its host. The concrete plugin class satisfies this structurally — no circular import needed.
 */
export interface IPluginSettingsHost {
  settings: PluginSettings;
  saveSettings(): Promise<void>;
}

// ── Settings Definitions (data-driven) ────────────────────────────────────

type SettingControl = 'text' | 'secret' | 'toggle' | 'dropdown' | 'number';

interface SettingDef {
  name: string;
  desc: string;
  key: keyof PluginSettings;
  control: SettingControl;
  placeholder?: string;
  options?: Record<string, string>;
  defaultOption?: string;
  errorMsg?: string;
}

const SETTING_DEFS: SettingDef[] = [
  { name: 'API user', desc: 'Your Habitica API user ID', key: 'apiUser', control: 'text', placeholder: 'Enter API user' },
  { name: 'API token', desc: 'Your Habitica API token, stored securely via Obsidian SecretStorage', key: 'apiTokenSecretName', control: 'secret' },
  { name: 'Group ID', desc: 'Your Habitica group ID for shared tasks', key: 'groupId', control: 'text', placeholder: 'Enter group ID' },
  { name: 'Output folder', desc: 'Folder where habitica-fullsync.md will be saved (leave blank for vault root)', key: 'outputFolder', control: 'text', placeholder: 'E.g., Habitica' },
  { name: 'Automatic sync', desc: 'Enable automatic sync on load and every x minutes', key: 'autoSync', control: 'toggle' },
  { name: 'Auto sync platform', desc: 'Choose which devices should run auto sync', key: 'autoSyncPlatform', control: 'dropdown', options: { both: 'Both desktop and mobile', desktop: 'Desktop only', mobile: 'Mobile only' }, defaultOption: 'both' },
  { name: 'Sync interval (minutes)', desc: 'How often to run auto-sync when enabled', key: 'syncInterval', control: 'number', placeholder: 'E.g., 30', errorMsg: 'Sync interval must be a positive number' },
  { name: 'Disable scoring', desc: 'Enable this to prevent scoring tasks in Habitica (read-only sync)', key: 'disableScoring', control: 'toggle' },
  { name: 'Disable creating new tasks', desc: 'Enable this to prevent creating new tasks in Habitica from non-Habitica tasks completed in Obsidian', key: 'disableCreating', control: 'toggle' },
  { name: 'Scan vault for completed tasks', desc: 'Scan all markdown files in your vault for checked-off tasks with a [completion::] field and score them in Habitica. When off, only the sync file (Habitica-fullsync.md) is checked.', key: 'enableVaultScan', control: 'toggle' },
  { name: 'Completion lookback (days)', desc: 'How many days back to look for recently completed tasks in your vault. Defaults to 4 — covers a typical weekend gap.', key: 'completionLookbackDays', control: 'number', placeholder: '4', errorMsg: 'Lookback must be a positive number' },
];

// ── Settings Tab ──────────────────────────────────────────────────────────

/**
 * Obsidian settings tab for the Habitica Full Sync plugin.
 *
 * Settings are rendered from {@link SETTING_DEFS} — a single data-driven array rather than copy-pasted `new Setting(...)` blocks. Adding a setting now requires only one new entry in the array.
 */
// eslint-disable-next-line obsidianmd/settings-tab/prefer-setting-definitions -- custom controls (password-masked text, interval validation) are not supported by the declarative API
export class HabiticaSyncSettingTab extends PluginSettingTab {
  /** Satisfies `IPluginSettingsHost` structurally. */
  declare plugin: IPluginSettingsHost;

  /**
   * @param app    The Obsidian application instance.
   * @param plugin The parent plugin — must satisfy `IPluginSettingsHost`.
   */
  constructor(app: App, plugin: IPluginSettingsHost) {
    // PluginSettingTab expects Plugin, but IPluginSettingsHost is satisfied structurally by any Plugin subclass with typed settings. The cast is unavoidable — TypeScript cannot verify structural compatibility across the opaque Plugin base class.
    super(app, plugin as unknown as Plugin);
    this.plugin = plugin;
  }

  /**
   * Renders all settings controls from a single data-driven definition.
   *
   * Adding a setting now requires only a new entry in {@link SETTING_DEFS} — no copy-paste of the render/onChange boilerplate. The two special cases (secret component and validated number inputs) are handled inline in the render switch.
   */
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    for (const def of SETTING_DEFS) {
      const setting = new Setting(containerEl).setName(def.name).setDesc(def.desc);
      const key = def.key;

      switch (def.control) {
        case 'text':
          setting.addText(text => text
            .setPlaceholder(def.placeholder ?? '')
            .setValue(String(this.plugin.settings[key] ?? ''))
            .onChange(async (value) => {
              (this.plugin.settings as any)[key] = value;
              await this.plugin.saveSettings();
            }));
          break;

        case 'secret':
          setting.addComponent(el => new SecretComponent(this.app, el)
            .setValue(String(this.plugin.settings.apiTokenSecretName))
            .onChange(async (value) => {
              this.plugin.settings.apiTokenSecretName = value;
              await this.plugin.saveSettings();
            }));
          break;

        case 'toggle':
          setting.addToggle(toggle => toggle
            .setValue(Boolean(this.plugin.settings[key]))
            .onChange(async (value) => {
              (this.plugin.settings as any)[key] = value;
              await this.plugin.saveSettings();
            }));
          break;

        case 'dropdown':
          setting.addDropdown(dropdown => {
            for (const [optValue, optLabel] of Object.entries(def.options ?? {})) {
              dropdown.addOption(optValue, optLabel);
            }
            dropdown
              .setValue(String(this.plugin.settings[key] ?? def.defaultOption ?? ''))
              .onChange(async (value: string) => {
                (this.plugin.settings as any)[key] = value;
                await this.plugin.saveSettings();
              });
          });
          break;

        case 'number':
          setting.addText(text => text
            .setPlaceholder(def.placeholder ?? '')
            .setValue(String(this.plugin.settings[key] ?? ''))
            .onChange(async (value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num) && num > 0) {
                (this.plugin.settings as any)[key] = num;
                await this.plugin.saveSettings();
              } else {
                new Notice(def.errorMsg ?? 'Must be a positive number');
              }
            }));
          break;
      }
    }
  }
}
