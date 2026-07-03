import { Notice, Plugin, type WorkspaceLeaf } from "obsidian";

import { loadDataStoreWithRecovery } from "./plugin-startup";
import { sanitizeErrorMessageForNotice } from "./errors/vault-reader-error";
import {
  createObsidianSourceHighlightAdapter,
  getActiveObsidianEditorView,
} from "./reader/obsidian-source-highlight-adapter";
import {
  activateReaderView as activateVaultReaderView,
  resolveReaderLeaf as resolveVaultReaderLeaf,
  type ReaderViewWorkspace,
} from "./reader/reader-view-activator";
import {
  VAULT_READER_VIEW_RUNTIME_ID,
  VAULT_READER_VIEW_TYPE,
  VaultReaderView,
  type VaultReaderCommandView,
  type VaultReaderSessionView,
} from "./reader/reader-view";
import { vaultReaderHighlightExtension } from "./reader/source-highlight-extension";
import { resolveObsidianReadingSource } from "./reader/source-resolver";
import { startReaderSession } from "./reader/start-reader-session-use-case";
import { PersistentReadingPositionStore } from "./settings/reading-position-store";
import { VaultReaderSettingsStore } from "./settings/settings-store";
import { VaultReaderDataStore } from "./settings/vault-reader-data-store";
import { VaultReaderSettingsTab } from "./settings/vault-reader-settings-tab";
import { VAULT_READER_COPY } from "./ui/copy";

export default class VaultReaderPlugin extends Plugin {
  private dataStore!: VaultReaderDataStore;
  private settingsStore!: VaultReaderSettingsStore;
  private readingPositionStore!: PersistentReadingPositionStore;

  async onload(): Promise<void> {
    this.dataStore = new VaultReaderDataStore({
      loadData: () => this.loadData(),
      saveData: (data) => this.saveData(data),
    });
    await loadDataStoreWithRecovery(this.dataStore, (message) => {
      new Notice(message);
    });
    this.settingsStore = new VaultReaderSettingsStore(this.dataStore);
    this.readingPositionStore = new PersistentReadingPositionStore(this.dataStore);
    this.addSettingTab(new VaultReaderSettingsTab(this.app, this, this.settingsStore));
    this.registerEditorExtension(vaultReaderHighlightExtension);

    this.registerView(
      VAULT_READER_VIEW_TYPE,
      (leaf) =>
        new VaultReaderView(leaf, {
          settingsStore: this.settingsStore,
          positionStore: this.readingPositionStore,
          notify: (message) => new Notice(message),
          getActiveSourceKey: () => this.getActiveNoteSourceKey(),
          startCurrentNoteSession: () => this.startCurrentNoteSession(),
        }),
    );

    this.addCommand({
      id: "vault-reader-start-session",
      name: VAULT_READER_COPY.commands.startNoteSessionName,
      callback: async () => {
        await this.startCurrentNoteSession();
      },
    });
    this.addCommand({
      id: "vault-reader-restart-current-note",
      name: VAULT_READER_COPY.commands.restartCurrentNoteName,
      callback: async () => {
        await this.restartCurrentReaderSession();
      },
    });
    this.addCommand({
      id: "vault-reader-toggle-play-pause",
      name: VAULT_READER_COPY.commands.togglePlayPauseName,
      callback: async () => {
        await this.toggleCurrentReaderPlayback();
      },
    });
  }

  async onunload(): Promise<void> {
    this.app.workspace.detachLeavesOfType(VAULT_READER_VIEW_TYPE);
  }

  private async activateReaderView(): Promise<VaultReaderSessionView | null> {
    return activateVaultReaderView({
      workspace: this.app.workspace as unknown as ReaderViewWorkspace,
      viewType: VAULT_READER_VIEW_TYPE,
      runtimeId: VAULT_READER_VIEW_RUNTIME_ID,
      presentationMode: this.settingsStore.get().presentationMode,
    });
  }

  private async resolveReaderLeaf(): Promise<WorkspaceLeaf | null> {
    return (await resolveVaultReaderLeaf({
      workspace: this.app.workspace as unknown as ReaderViewWorkspace,
      viewType: VAULT_READER_VIEW_TYPE,
      presentationMode: this.settingsStore.get().presentationMode,
    })) as WorkspaceLeaf | null;
  }

  private getExistingReaderCommandView(): VaultReaderCommandView | null {
    const leaf = (this.app.workspace as unknown as ReaderViewWorkspace).getLeavesOfType(
      VAULT_READER_VIEW_TYPE,
    )[0];
    const view = leaf?.view as Partial<VaultReaderCommandView> | null | undefined;
    if (
      view?.vaultReaderRuntimeId !== VAULT_READER_VIEW_RUNTIME_ID ||
      typeof view.setSession !== "function" ||
      typeof view.restartCurrentSession !== "function" ||
      typeof view.togglePlayPause !== "function"
    ) {
      return null;
    }

    return view as VaultReaderCommandView;
  }

  private async restartCurrentReaderSession(): Promise<void> {
    const view = this.getExistingReaderCommandView();
    if (!view || !(await view.restartCurrentSession())) {
      new Notice(VAULT_READER_COPY.reader.restartUnavailable);
    }
  }

  private async toggleCurrentReaderPlayback(): Promise<void> {
    const view = this.getExistingReaderCommandView();
    if (!view || !(await view.togglePlayPause())) {
      new Notice(VAULT_READER_COPY.reader.toggleUnavailable);
    }
  }

  private async startCurrentNoteSession(): Promise<void> {
    try {
      const result = await startReaderSession({
        resolveSource: () => resolveObsidianReadingSource(this.app),
        captureSourceHighlighter: () => {
          const sourceEditorView = getActiveObsidianEditorView(this.app);
          return sourceEditorView
            ? createObsidianSourceHighlightAdapter(sourceEditorView)
            : undefined;
        },
        activateReaderView: () => this.activateReaderView(),
        getDefaultWpm: () => this.settingsStore.get().defaultWpm,
      });

      if (!result.ok) {
        new Notice(result.message);
        return;
      }

      new Notice(`Vault Reader loaded ${result.tokenCount} tokens from ${result.title}.`);
    } catch (error) {
      console.error("Vault Reader start session failed.", error);
      const message = sanitizeErrorMessageForNotice(
        error instanceof Error ? error.message : String(error),
        "Vault Reader could not start a session due to an unexpected error.",
      );
      new Notice(message);
    }
  }

  private getActiveNoteSourceKey(): string | null {
    return this.app.workspace.getActiveFile()?.path ?? null;
  }
}
