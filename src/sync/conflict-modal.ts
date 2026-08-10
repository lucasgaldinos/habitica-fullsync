import { App, Modal, Setting } from 'obsidian';
import { MarkdownTask, ConflictResolution } from '../types/markdown';
import { HabiticaTask } from '../types/habitica';

export class ConflictModal extends Modal {
    private localTask: MarkdownTask;
    private remoteTask: HabiticaTask;
    private resolvePromise: (resolution: ConflictResolution) => void;

    constructor(app: App, localTask: MarkdownTask, remoteTask: HabiticaTask, resolve: (resolution: ConflictResolution) => void) {
        super(app);
        this.localTask = localTask;
        this.remoteTask = remoteTask;
        this.resolvePromise = resolve;
    }

    onOpen() {
        const { contentEl, titleEl } = this;
        
        titleEl.setText('Sync conflict detected');

        contentEl.createEl('p', {
            text: `A conflict was detected for task: "${this.localTask.text || this.remoteTask.text}"`
        });
        contentEl.createEl('p', {
            text: 'Both the local markdown and the remote Habitica API have changed since the last sync. Which version should take precedence?'
        });

        new Setting(contentEl)
            .setName('Markdown version')
            .setDesc('Keep your local changes and push them to Habitica.')
            .addButton(btn => btn
                .setButtonText('Choose markdown')
                .setCta()
                .onClick(() => {
                    this.resolvePromise('markdown');
                    this.close();
                }));

        new Setting(contentEl)
            .setName('API version')
            .setDesc('Keep the remote changes and overwrite your local markdown.')
            .addButton(btn => btn
                .setButtonText('Choose API')
                .onClick(() => {
                    this.resolvePromise('api');
                    this.close();
                }));

        new Setting(contentEl)
            .setName('Skip')
            .setDesc('Do not sync this task right now.')
            .addButton(btn => btn
                .setButtonText('Skip')
                .onClick(() => {
                    this.resolvePromise('skip');
                    this.close();
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Helper to show the conflict modal and wait for a resolution.
 */
export function promptConflictResolution(app: App, localTask: MarkdownTask, remoteTask: HabiticaTask): Promise<ConflictResolution> {
    return new Promise((resolve) => {
        const modal = new ConflictModal(app, localTask, remoteTask, resolve);
        modal.open();
    });
}
