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

import { App, Notice, Plugin, PluginSettingTab, SecretComponent, Setting, SettingDefinitionItem } from 'obsidian';
import { IPluginSettingsHost, PluginSettings } from './types';

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

// Local types for the Obsidian 1.13.0+ declarative settings API.
// Replace with imports from 'obsidian' when minAppVersion is bumped to ≥ 1.13.0.
// See: https://docs.obsidian.md/Plugins/User+interface/Settings

/**
 * Obsidian settings tab for the Habitica Full Sync plugin.
 *
 * - **Obsidian ≥ 1.13.0**: calls {@link getSettingDefinitions}, which returns a declarative array. Obsidian handles rendering, search indexing, persistence, and validation. `display()` is skipped.
 * - **Obsidian < 1.13.0**: calls {@link display}, which renders imperatively from the same `SETTING_DEFS` data.
 *
 * The imperative `display()` path is preserved for backward compatibility with Obsidian versions below 1.13.0. Once `minAppVersion` is bumped to 1.13.0, `display()` and `SETTING_DEFS` can be deleted, and the local `DeclarativeControlDef` / `DeclarativeSettingEntry` types can be replaced with imports from `'obsidian'`.
 *
 * Settings are defined once as data — the declarative array and the imperative render loop both describe the same 11 settings.
 */
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

  // ── Declarative API (Obsidian ≥ 1.13.0) ─────────────────────────────────

  /**
   * Declarative settings definitions for Obsidian 1.13.0+.
   *
   * Obsidian reads `this.plugin.settings[key]`, writes changes back, and calls `saveData()` automatically. No `onChange` plumbing, no `display()` DOM construction. Each entry maps to the same setting as the imperative {@link SETTING_DEFS} array.
   *
   * The `apiTokenSecretName` setting uses a `render` callback instead of a `control` because {@link SecretComponent} is not available as a first-class declarative control type in Obsidian 1.13.0.
   *
   * @returns An array of setting definitions that Obsidian renders as the settings UI.
   */
  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: 'API user',
        desc: 'Your Habitica API user ID',
        control: { type: 'text', key: 'apiUser', placeholder: 'Enter API user' },
      },
      {
        name: 'API token',
        desc: 'Your Habitica API token, stored securely via Obsidian SecretStorage',
        render: (setting: Setting) => this._renderApiTokenControl(setting),
      },
      {
        name: 'Group ID',
        desc: 'Your Habitica group ID for shared tasks',
        control: { type: 'text', key: 'groupId', placeholder: 'Enter group ID' },
      },
      {
        name: 'Output folder',
        desc: 'Folder where habitica-fullsync.md will be saved (leave blank for vault root)',
        control: { type: 'folder', key: 'outputFolder', includeRoot: true, placeholder: 'E.g., Habitica' },
      },
      {
        name: 'Automatic sync',
        desc: 'Enable automatic sync on load and every x minutes',
        control: { type: 'toggle', key: 'autoSync' },
      },
      {
        name: 'Auto sync platform',
        desc: 'Choose which devices should run auto sync',
        control: {
          type: 'dropdown',
          key: 'autoSyncPlatform',
          defaultValue: 'both',
          options: { both: 'Both desktop and mobile', desktop: 'Desktop only', mobile: 'Mobile only' },
        },
      },
      {
        name: 'Sync interval (minutes)',
        desc: 'How often to run auto-sync when enabled',
        control: { type: 'number', key: 'syncInterval', min: 1, placeholder: '30', defaultValue: 30 },
      },
      {
        name: 'Disable scoring',
        desc: 'Enable this to prevent scoring tasks in Habitica (read-only sync)',
        control: { type: 'toggle', key: 'disableScoring' },
      },
      {
        name: 'Disable creating new tasks',
        desc: 'Enable this to prevent creating new tasks in Habitica from non-Habitica tasks completed in Obsidian',
        control: { type: 'toggle', key: 'disableCreating' },
      },
      {
        name: 'Scan vault for completed tasks',
        desc: 'Scan all markdown files in your vault for checked-off tasks with a [completion::] field and score them in Habitica. When off, only the sync file (Habitica-fullsync.md) is checked.',
        control: { type: 'toggle', key: 'enableVaultScan' },
      },
      {
        name: 'Completion lookback (days)',
        desc: 'How many days back to look for recently completed tasks in your vault. Defaults to 4 — covers a typical weekend gap.',
        control: { type: 'number', key: 'completionLookbackDays', min: 1, placeholder: '4', defaultValue: 4 },
      },
    ];
  }

  /**
   * Renders the API token {@link SecretComponent} inside a declarative setting row.
   *
   * SecretComponent is not available as a first-class declarative `control` type in Obsidian 1.13.0, so it must be wired manually via a `render` callback. This method is shared between the declarative path and could also be called from the imperative path — extracted to avoid duplication.
   */
  private _renderApiTokenControl(setting: Setting): void {
    setting.addComponent(el => new SecretComponent(this.app, el)
      .setValue(String(this.plugin.settings.apiTokenSecretName))
      .onChange(async (value) => {
        this.plugin.settings.apiTokenSecretName = value;
        await this.plugin.saveSettings();
      }));
  }

  // ── Imperative API (Obsidian < 1.13.0) ──────────────────────────────────

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
              (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
              await this.plugin.saveSettings();
            }));
          break;

        case 'secret':
          this._renderApiTokenControl(setting);
          break;

        case 'toggle':
          setting.addToggle(toggle => toggle
            .setValue(Boolean(this.plugin.settings[key]))
            .onChange(async (value) => {
              (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
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
                (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
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
                (this.plugin.settings as unknown as Record<string, unknown>)[key] = num;
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
