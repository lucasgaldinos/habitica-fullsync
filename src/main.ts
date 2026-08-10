import { Plugin, Notice, TFile } from 'obsidian';
import { HabiticaSyncSettingTab } from './settings';
import { HabiticaSyncSettings, DEFAULT_SETTINGS, IPluginSettingsHost } from './types/habitica';
import { HabiticaApiClient } from './api/client';
import { SyncManager } from './sync/sync-manager';
import { promptConflictResolution } from './sync/conflict-modal';

/**
 * Main entry point for the Habitica Fullsync Plugin.
 */
export default class HabiticaSyncPlugin extends Plugin implements IPluginSettingsHost {
    /** The global plugin settings */
    pluginSettings!: HabiticaSyncSettings;
    /** The API client for communicating with Habitica */
    apiClient!: HabiticaApiClient;
    /** The manager orchestrating the sync between Markdown and Habitica */
    syncManager!: SyncManager;

    /**
     * Called when the plugin is loaded by Obsidian.
     */
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new HabiticaSyncSettingTab(this.app, this));

        // Re-instantiated during sync or settings save
        this.apiClient = new HabiticaApiClient({
            userId: this.pluginSettings.userId,
            apiToken: '' // Token fetched dynamically during sync
        });

        this.syncManager = new SyncManager(
            this.app.vault,
            `${this.app.vault.configDir}/plugins/${this.manifest.id}`,
            this.apiClient,
            (local, remote) => promptConflictResolution(this.app, local, remote)
        );

        // Ribbon Icon
        this.addRibbonIcon('refresh-cw', 'Sync Habitica tasks', async () => {
            await this.performSync();
        });

        // Command Palette
        this.addCommand({
            id: 'sync-habitica-tasks',
            name: 'Sync Habitica tasks',
            callback: async () => {
                await this.performSync();
            }
        });
    }

    /**
     * Called when the plugin is unloaded.
     */
    onunload() {
        // Nothing to clean up currently
    }

    /**
     * Loads settings from the vault's data.json file.
     */
    async loadSettings() {
        const data: unknown = await this.loadData();
        this.pluginSettings = Object.assign({}, DEFAULT_SETTINGS, data as Partial<HabiticaSyncSettings>);
    }

    /**
     * Saves settings to the vault's data.json file.
     */
    async saveSettings() {
        await this.saveData(this.pluginSettings);
    }

    /**
     * Fetches the API token securely and instantiates a new ApiClient.
     * @returns A boolean indicating success or failure.
     */
    private async prepareApiClient(): Promise<boolean> {
        if (!this.pluginSettings.userId || !this.pluginSettings.apiTokenSecretName) {
            new Notice('Habitica sync: Please configure your user ID and API token in settings.');
            return false;
        }

        try {
            // NOTE: SecretStorage requires Obsidian 1.11.4+
            interface AppWithSecret {
                secretStorage?: {
                    getSecret(key: string): Promise<string | null>;
                };
            }
            const appSecret = this.app as unknown as AppWithSecret;
            const token = await appSecret.secretStorage?.getSecret(this.pluginSettings.apiTokenSecretName);
            
            if (!token) {
                new Notice('Habitica sync: API token is empty or missing from SecretStorage. Please set it in settings.');
                return false;
            }

            this.apiClient = new HabiticaApiClient({
                userId: this.pluginSettings.userId,
                apiToken: token
            });
            this.syncManager = new SyncManager(
                this.app.vault,
                `${this.app.vault.configDir}/plugins/${this.manifest.id}`,
                this.apiClient,
                (local, remote) => promptConflictResolution(this.app, local, remote)
            );
            return true;
        } catch {
            new Notice('Habitica sync: Failed to read API token from SecretStorage.');
            return false;
        }
    }

    /**
     * Orchestrates the task synchronization process.
     */
    private async performSync() {
        const isPrepared = await this.prepareApiClient();
        if (!isPrepared) return;

        const syncFilePath = this.pluginSettings.syncFilePath;
        let file = this.app.vault.getAbstractFileByPath(syncFilePath);

        if (!file || !(file instanceof TFile)) {
            // Create the file if it doesn't exist
            try {
                // ensure parent folders exist
                const parts = syncFilePath.split('/');
                let currentPath = '';
                for (let i = 0; i < parts.length - 1; i++) {
                    currentPath += parts[i] + '/';
                    const folder = this.app.vault.getAbstractFileByPath(currentPath.slice(0, -1));
                    if (!folder) {
                        await this.app.vault.createFolder(currentPath.slice(0, -1));
                    }
                }
                file = await this.app.vault.create(syncFilePath, '# Habitica Sync\n\n');
                new Notice(`Created new sync file at ${syncFilePath}`);
            } catch (err) {
                console.error(err);
                new Notice(`Failed to create sync file at ${syncFilePath}`);
                return;
            }
        }

        if (file instanceof TFile) {
            try {
                new Notice('Habitica sync started...');
                await this.syncManager.sync(file);
                new Notice('Habitica sync complete!');
            } catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    new Notice(`Habitica Sync Failed: ${error.message}`);
                } else {
                    new Notice('Habitica sync failed with unknown error.');
                }
            }
        }
    }
}
