import { App, Modal, Setting } from 'obsidian';

export class SyncWarningModal extends Modal {
  private resolvePromise: ((value: 'proceed' | 'cancel' | 'snooze') => void) | null = null;
  private isAutoSync: boolean;

  constructor(app: App, isAutoSync: boolean) {
    super(app);
    this.isAutoSync = isAutoSync;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    
    this.setTitle('Unsynced local changes detected');
    
    contentEl.createEl('p', { 
      text: 'Your markdown file has local changes that have not been pushed to Habitica. ' +
            'Pulling from Habitica now will overwrite your local changes.' 
    });

    const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

    new Setting(buttonContainer)
      .addButton(btn => {
        btn.setButtonText('Proceed (overwrite local)')
          .onClick(() => {
            this.resolvePromise?.('proceed');
            this.close();
          });
        // Destructive styling via CSS class — avoids the v1.13.0-only setDestructive() API.
        btn.buttonEl.addClass('habitica-fullsync-btn-destructive');
      })
      .addButton(btn => btn
        .setButtonText('Cancel')
        .onClick(() => {
          this.resolvePromise?.('cancel');
          this.close();
        }));

    if (this.isAutoSync) {
      new Setting(contentEl)
        .setDesc('You can snooze auto-sync for 1 hour to give yourself time to finish editing and push manually.')
        .addButton(btn => btn
          .setButtonText('Snooze auto-sync (1 hour)')
          .onClick(() => {
            this.resolvePromise?.('snooze');
            this.close();
          }));
    }
  }

  onClose() {
    this.contentEl.empty();
    // If closed by clicking outside or pressing Escape, treat as cancel
    this.resolvePromise?.('cancel');
  }

  async openAndAwait(): Promise<'proceed' | 'cancel' | 'snooze'> {
    this.open();
    return new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }
}
