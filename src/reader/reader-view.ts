import { ItemView, type WorkspaceLeaf } from "obsidian";

import {
  ReaderController,
  type ReadingPositionStore,
  type ReaderSnapshot,
} from "./reader-controller";
import { ReaderSessionRunner } from "./reader-session-runner";
import { ReaderSourceHighlighter, type SourceHighlightAdapter } from "./source-highlighter";
import type { ReadingToken } from "./tokenizer";
import { setTextContentIfChanged, setValueIfChanged } from "./dom-writes";
import {
  createVaultReaderError,
  sanitizeErrorMessageForNotice,
  type VaultReaderErrorCode,
} from "../errors/vault-reader-error";
import {
  resolvePanelZoomBounds,
  resolveReaderKeyAction,
  shouldHandleReaderKeyEvent,
  type PanelZoomBounds,
} from "./reader-view-model";
import type { TokenHighlightMap } from "./source-highlight-map";
import type { ReaderSettingsStore } from "../settings/settings-store";
import type { VaultReaderSettings } from "../settings/vault-reader-data-store";
import { VAULT_READER_COPY } from "../ui/copy";
import type { ReaderViewElements } from "./view/reader-view-elements";
import { ReaderViewActions } from "./view/reader-view-actions";
import {
  applyReaderVisualSettings,
  nextAccentTheme,
  nextInNoteHighlightColor,
} from "./view/reader-appearance-controller";
import { renderReaderViewSnapshot } from "./view/reader-view-renderer";
import { applyPanelZoomInputBounds } from "./view/panel-zoom-controller";
import {
  PANEL_ZOOM_MAX,
  PANEL_ZOOM_MIN,
  PANEL_ZOOM_STEP,
  renderReaderViewShell,
} from "./view/reader-view-shell";

export const VAULT_READER_VIEW_TYPE = "vault-reader-view";
export const VAULT_READER_VIEW_RUNTIME_ID = "vault-reader-view-runtime/v2.6-highlight-safe";

export interface ReaderViewSessionPayload {
  sourceKey: string;
  title: string;
  tokens: ReadingToken[];
  highlightMap?: TokenHighlightMap;
  sourceHighlighter?: SourceHighlightAdapter;
  startIndex?: number;
  wpm?: number;
}

export interface VaultReaderSessionView {
  readonly vaultReaderRuntimeId: typeof VAULT_READER_VIEW_RUNTIME_ID;
  setSession: (payload: ReaderViewSessionPayload) => Promise<void>;
}

export interface VaultReaderCommandView extends VaultReaderSessionView {
  restartCurrentSession: () => Promise<boolean>;
  togglePlayPause: () => Promise<boolean>;
}

export interface VaultReaderViewDependencies {
  settingsStore: ReaderSettingsStore;
  positionStore: ReadingPositionStore;
  notify?: (message: string) => void;
  getActiveSourceKey?: () => string | null;
  startCurrentNoteSession?: () => Promise<void>;
  sourceHighlighter?: SourceHighlightAdapter;
  debounceMs?: number;
  scheduler?: {
    setTimer: (callback: () => void, delayMs: number) => number;
    clearTimer: (timerId: number) => void;
  };
}

export class VaultReaderView extends ItemView {
  readonly vaultReaderRuntimeId = VAULT_READER_VIEW_RUNTIME_ID;

  private readonly settingsStore: ReaderSettingsStore;
  private settings: VaultReaderSettings;
  private readonly controller: ReaderController;
  private readonly sessionRunner: ReaderSessionRunner;
  private readonly actions: ReaderViewActions<ReaderViewSessionPayload>;
  private readonly defaultSourceHighlighterAdapter: SourceHighlightAdapter | null;
  private sourceHighlighter: ReaderSourceHighlighter | null = null;
  private sourceHighlighterAdapter: SourceHighlightAdapter | null = null;
  private readonly notify: (message: string) => void;
  private readonly getActiveSourceKey: () => string | null;
  private readonly startCurrentNoteSession: (() => Promise<void>) | null;
  private readonly debounceMs: number;
  private readonly scheduler: {
    setTimer: (callback: () => void, delayMs: number) => number;
    clearTimer: (timerId: number) => void;
  };
  private lastNotifiedErrorMessage: string | null = null;
  private pendingWpmPersistenceTimerId: number | null = null;
  private pendingWpmPersistenceValue: number | null = null;

  private sessionTitle = "No source loaded";
  private lastSessionPayload: ReaderViewSessionPayload | null = null;

  private elements: ReaderViewElements | null = null;
  private resolvedPanelZoom = 100;

  constructor(leaf: WorkspaceLeaf, dependencies: VaultReaderViewDependencies) {
    super(leaf);
    this.settingsStore = dependencies.settingsStore;
    this.notify = dependencies.notify ?? (() => undefined);
    this.getActiveSourceKey = dependencies.getActiveSourceKey ?? (() => null);
    this.startCurrentNoteSession = dependencies.startCurrentNoteSession ?? null;
    this.defaultSourceHighlighterAdapter = dependencies.sourceHighlighter ?? null;
    this.debounceMs = dependencies.debounceMs ?? 200;
    this.scheduler = dependencies.scheduler ?? {
      setTimer: (callback, delayMs) => {
        return window.setTimeout(callback, delayMs);
      },
      clearTimer: (timerId) => {
        window.clearTimeout(timerId);
      },
    };
    this.settings = this.settingsStore.get();
    this.controller = new ReaderController({
      defaultWpm: this.settings.defaultWpm,
      positionStore: dependencies.positionStore,
    });
    this.sessionRunner = new ReaderSessionRunner(this.controller, {
      onSnapshot: (snapshot) => this.renderFromSnapshot(snapshot),
      onError: (error) => this.reportRuntimeError(error),
    });
    this.actions = new ReaderViewActions<ReaderViewSessionPayload>({
      sessionRunner: this.sessionRunner,
      getLastSessionPayload: () => this.lastSessionPayload,
      setLastSessionPayload: (payload) => {
        this.lastSessionPayload = payload;
      },
      reloadSession: (payload) => this.setSession(payload),
      onWpmChanged: (wpm) => this.scheduleWpmPersistence(wpm),
    });
  }

  getViewType(): string {
    return VAULT_READER_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Vault Reader";
  }

  async onOpen(): Promise<void> {
    this.lastNotifiedErrorMessage = null;
    this.renderSkeleton();
    this.applyVisualSettings();
    this.renderFromSnapshot(this.sessionRunner.getSnapshot());
  }

  async onClose(): Promise<void> {
    await this.flushPendingWpmPersistence();
    await this.sessionRunner.stop();
    this.runSourceHighlightSafely(() => {
      this.sourceHighlighter?.clear();
    });
  }

  onResize(): void {
    this.refreshPanelZoomBounds();
  }

  async setSession(payload: ReaderViewSessionPayload): Promise<void> {
    if (!this.elements) {
      this.renderSkeleton();
      this.applyVisualSettings();
    }

    this.lastNotifiedErrorMessage = null;
    this.sessionTitle = payload.title;
    this.configureSourceHighlighter(
      payload.sourceHighlighter ?? this.defaultSourceHighlighterAdapter,
    );
    this.runSourceHighlightSafely(() => {
      this.sourceHighlighter?.setSession({
        enabled: this.settings.inNoteHighlightEnabled,
        color: this.settings.inNoteHighlightColor,
        map: payload.highlightMap ?? null,
      });
    });
    const snapshot = await this.sessionRunner.loadSession({
      sourceKey: payload.sourceKey,
      tokens: payload.tokens,
      startIndex: payload.startIndex,
      wpm: payload.wpm ?? this.settings.defaultWpm,
    });
    this.lastSessionPayload = {
      ...payload,
      startIndex: snapshot.currentIndex,
      wpm: snapshot.wpm,
    };
    this.renderFromSnapshot(snapshot);
  }

  private renderSkeleton(): void {
    const elements = renderReaderViewShell(this.contentEl);
    this.elements = elements;

    this.registerDomEvent(this.contentEl, "keydown", (evt: KeyboardEvent) => {
      const target = evt.target;
      if (
        !shouldHandleReaderKeyEvent({
          targetTagName: target instanceof Element ? target.tagName : null,
          isContentEditable: target instanceof HTMLElement ? target.isContentEditable : false,
          altKey: evt.altKey,
          ctrlKey: evt.ctrlKey,
          metaKey: evt.metaKey,
        })
      ) {
        return;
      }

      const action = resolveReaderKeyAction(evt.key);
      if (!action) {
        return;
      }

      evt.preventDefault();
      this.runSafely(
        () => this.actions.execute(action),
        "VIEW_ACTION_FAILED",
        "Vault Reader could not run that keyboard action.",
      );
    });

    this.registerDomEvent(elements.playPauseButtonEl, "click", () => {
      this.runSafely(
        () => this.actions.togglePlayPause(),
        "VIEW_ACTION_FAILED",
        "Vault Reader could not toggle playback.",
      );
    });
    this.registerDomEvent(elements.restartButtonEl, "click", () => {
      this.runSafely(
        () => this.actions.restart(),
        "VIEW_ACTION_FAILED",
        "Vault Reader could not restart the current session.",
      );
    });
    this.registerDomEvent(elements.stopButtonEl, "click", () => {
      this.runSafely(
        () => this.actions.execute("stop"),
        "VIEW_ACTION_FAILED",
        "Vault Reader could not stop the current session.",
      );
    });
    this.registerDomEvent(elements.readActiveNoteButtonEl, "click", () => {
      if (!this.startCurrentNoteSession) {
        return;
      }

      this.runSafely(
        () => this.startCurrentNoteSession!(),
        "VIEW_ACTION_FAILED",
        "Vault Reader could not read the current note.",
      );
    });
    this.registerDomEvent(elements.onboardingDismissButtonEl, "click", () => {
      this.runSafely(
        () =>
          this.updateSettings({
            onboardingDismissed: true,
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save first-run hint settings.",
      );
    });
    this.registerDomEvent(elements.slowerButtonEl, "click", () => {
      this.actions.adjustWpm(-10);
    });
    this.registerDomEvent(elements.fasterButtonEl, "click", () => {
      this.actions.adjustWpm(10);
    });
    this.registerDomEvent(elements.wpmInputEl, "change", () => {
      const nextWpm = Number(elements.wpmInputEl.value);
      if (!Number.isFinite(nextWpm)) {
        return;
      }
      this.actions.applyWpm(nextWpm);
    });
    this.registerDomEvent(elements.orpToggleButtonEl, "click", () => {
      this.runSafely(
        () =>
          this.updateSettings({
            orpEnabled: !this.settings.orpEnabled,
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save ORP settings.",
      );
    });
    this.registerDomEvent(elements.accentToggleButtonEl, "click", () => {
      this.runSafely(
        () =>
          this.updateSettings({
            accentTheme: nextAccentTheme(this.settings.accentTheme),
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save accent theme settings.",
      );
    });
    this.registerDomEvent(elements.inNoteHighlightToggleButtonEl, "click", () => {
      this.runSafely(
        () =>
          this.updateSettings({
            inNoteHighlightEnabled: !this.settings.inNoteHighlightEnabled,
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save in-note highlight settings.",
      );
    });
    this.registerDomEvent(elements.inNoteHighlightColorButtonEl, "click", () => {
      this.runSafely(
        () =>
          this.updateSettings({
            inNoteHighlightColor: nextInNoteHighlightColor(this.settings.inNoteHighlightColor),
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save in-note highlight color settings.",
      );
    });
    this.registerDomEvent(elements.typographySliderEl, "input", () => {
      const nextScale = Number(elements.typographySliderEl.value);
      if (!Number.isFinite(nextScale)) {
        return;
      }
      setValueIfChanged(elements.typographyInputEl, String(nextScale));
      this.updatePercentReadout(elements.typographyValueEl, elements.typographySliderEl, nextScale);
    });
    this.registerDomEvent(elements.typographyInputEl, "change", () => {
      const nextScale = Number(elements.typographyInputEl.value);
      if (!Number.isFinite(nextScale)) {
        return;
      }
      this.persistTypographyScale(nextScale);
    });
    this.registerDomEvent(elements.typographySliderEl, "change", () => {
      const nextScale = Number(elements.typographySliderEl.value);
      if (!Number.isFinite(nextScale)) {
        return;
      }
      this.persistTypographyScale(nextScale);
    });
    this.registerDomEvent(elements.panelZoomSliderEl, "input", () => {
      const nextZoom = Number(elements.panelZoomSliderEl.value);
      if (!Number.isFinite(nextZoom)) {
        return;
      }
      setValueIfChanged(elements.panelZoomInputEl, String(nextZoom));
      this.updatePercentReadout(elements.panelZoomValueEl, elements.panelZoomSliderEl, nextZoom);
    });
    this.registerDomEvent(elements.panelZoomInputEl, "change", () => {
      const nextZoom = Number(elements.panelZoomInputEl.value);
      if (!Number.isFinite(nextZoom)) {
        return;
      }
      this.persistPanelZoom(nextZoom);
    });
    this.registerDomEvent(elements.panelZoomSliderEl, "change", () => {
      const nextZoom = Number(elements.panelZoomSliderEl.value);
      if (!Number.isFinite(nextZoom)) {
        return;
      }
      this.persistPanelZoom(nextZoom);
    });
  }

  async restartCurrentSession(): Promise<boolean> {
    if (!this.lastSessionPayload) {
      return false;
    }

    await this.actions.restart();
    return true;
  }

  async togglePlayPause(): Promise<boolean> {
    const snapshot = this.sessionRunner.getSnapshot();
    if (!snapshot.sourceKey || snapshot.tokenCount === 0) {
      return false;
    }

    await this.actions.togglePlayPause();
    return true;
  }

  private configureSourceHighlighter(adapter: SourceHighlightAdapter | null): void {
    this.runSourceHighlightSafely(() => {
      if (this.sourceHighlighterAdapter === adapter) {
        return;
      }

      this.sourceHighlighter?.clear();
      this.sourceHighlighterAdapter = adapter;
      this.sourceHighlighter = adapter
        ? new ReaderSourceHighlighter(adapter, {
            onUnavailable: () => {
              this.notify(VAULT_READER_COPY.reader.highlightUnavailable);
            },
          })
        : null;
    });
  }

  private renderFromSnapshot(snapshot: ReaderSnapshot): void {
    if (!this.elements) {
      return;
    }

    this.updateSourceHighlightFromSnapshot(snapshot);
    renderReaderViewSnapshot({
      elements: this.elements,
      sessionTitle: this.sessionTitle,
      sessionSourceKey: snapshot.sourceKey,
      activeSourceKey: this.getActiveSourceKey(),
      canReadActiveSource: this.startCurrentNoteSession !== null,
      snapshot,
      settings: this.settings,
      resolvedPanelZoom: this.resolvedPanelZoom,
      token: this.controller.getCurrentToken(),
      sourceHighlightState: this.sourceHighlighter?.getState(),
    });
  }

  private updateSourceHighlightFromSnapshot(snapshot: ReaderSnapshot): void {
    this.runSourceHighlightSafely(() => {
      this.sourceHighlighter?.setEnabled(this.settings.inNoteHighlightEnabled);
      this.sourceHighlighter?.setColor(this.settings.inNoteHighlightColor);
      this.sourceHighlighter?.update(snapshot);
    });
  }

  private runSourceHighlightSafely(task: () => void): void {
    try {
      task();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      if (this.sourceHighlighter) {
        this.sourceHighlighter.markUnavailable(reason);
        return;
      }

      this.notify(VAULT_READER_COPY.reader.highlightUnavailable);
    }
  }

  private persistTypographyScale(nextScale: number): void {
    if (this.elements) {
      setValueIfChanged(this.elements.typographyInputEl, String(nextScale));
      setValueIfChanged(this.elements.typographySliderEl, String(nextScale));
      this.updatePercentReadout(
        this.elements.typographyValueEl,
        this.elements.typographySliderEl,
        nextScale,
      );
    }
    this.runSafely(
      () =>
        this.updateSettings({
          typographyScale: nextScale,
        }),
      "SETTINGS_PERSIST_FAILED",
      "Vault Reader could not save typography settings.",
    );
  }

  private persistPanelZoom(nextZoom: number): void {
    const bounds = this.calculatePanelZoomBounds(nextZoom);
    const resolvedZoom = bounds.value;
    this.applyPanelZoomControlBounds(bounds);
    if (this.elements) {
      setValueIfChanged(this.elements.panelZoomInputEl, String(resolvedZoom));
      setValueIfChanged(this.elements.panelZoomSliderEl, String(resolvedZoom));
      this.updatePercentReadout(
        this.elements.panelZoomValueEl,
        this.elements.panelZoomSliderEl,
        resolvedZoom,
      );
    }
    this.runSafely(
      () =>
        this.updateSettings({
          panelZoom: resolvedZoom,
        }),
      "SETTINGS_PERSIST_FAILED",
      "Vault Reader could not save panel zoom settings.",
    );
  }

  private async updateSettings(patch: Partial<VaultReaderSettings>): Promise<VaultReaderSettings> {
    this.settings = await this.settingsStore.update(patch);
    this.applyVisualSettings();
    this.renderFromSnapshot(this.sessionRunner.getSnapshot());
    return this.settings;
  }

  private applyVisualSettings(): void {
    applyReaderVisualSettings(this.contentEl, this.settings);
    this.refreshPanelZoomBounds();
  }

  private refreshPanelZoomBounds(): void {
    const bounds = this.calculatePanelZoomBounds(this.settings.panelZoom);
    this.resolvedPanelZoom = bounds.value;
    this.contentEl.setCssProps({
      "--vault-reader-shell-scale": String(bounds.value / 100),
    });
    this.applyPanelZoomControlBounds(bounds);
  }

  private calculatePanelZoomBounds(desiredZoom: number): PanelZoomBounds {
    const shellDimensions = this.measureShellAtBaseScale();
    const containerWidth =
      this.contentEl.clientWidth || this.contentEl.getBoundingClientRect().width;
    const containerHeight =
      this.contentEl.clientHeight || this.contentEl.getBoundingClientRect().height;
    return resolvePanelZoomBounds({
      desiredZoom,
      minZoom: PANEL_ZOOM_MIN,
      maxZoom: PANEL_ZOOM_MAX,
      step: PANEL_ZOOM_STEP,
      containerWidth,
      containerHeight,
      shellBaseWidth: shellDimensions.width,
      shellBaseHeight: shellDimensions.height,
    });
  }

  private measureShellAtBaseScale(): { width: number; height: number } {
    if (!this.elements) {
      return {
        width: 0,
        height: 0,
      };
    }

    const priorScale = this.contentEl.style.getPropertyValue("--vault-reader-shell-scale");
    this.contentEl.setCssProps({
      "--vault-reader-shell-scale": "1",
    });
    const rect = this.elements.shellEl.getBoundingClientRect();
    this.contentEl.setCssProps({
      "--vault-reader-shell-scale": priorScale.length > 0 ? priorScale : "1",
    });

    return {
      width: rect.width,
      height: rect.height,
    };
  }

  private applyPanelZoomControlBounds(bounds: PanelZoomBounds): void {
    if (!this.elements) {
      return;
    }

    applyPanelZoomInputBounds(
      [this.elements.panelZoomInputEl, this.elements.panelZoomSliderEl],
      bounds,
    );
  }

  private scheduleWpmPersistence(nextWpm: number): void {
    this.pendingWpmPersistenceValue = nextWpm;
    if (this.pendingWpmPersistenceTimerId !== null) {
      this.scheduler.clearTimer(this.pendingWpmPersistenceTimerId);
    }

    this.pendingWpmPersistenceTimerId = this.scheduler.setTimer(() => {
      this.pendingWpmPersistenceTimerId = null;
      const wpm = this.pendingWpmPersistenceValue;
      this.pendingWpmPersistenceValue = null;

      if (wpm === null || wpm === this.settings.defaultWpm) {
        return;
      }

      this.runSafely(
        () =>
          this.updateSettings({
            defaultWpm: wpm,
          }),
        "SETTINGS_PERSIST_FAILED",
        "Vault Reader could not save WPM settings.",
      );
    }, this.debounceMs);
  }

  private async flushPendingWpmPersistence(): Promise<void> {
    if (this.pendingWpmPersistenceTimerId !== null) {
      this.scheduler.clearTimer(this.pendingWpmPersistenceTimerId);
      this.pendingWpmPersistenceTimerId = null;
    }

    const wpm = this.pendingWpmPersistenceValue;
    this.pendingWpmPersistenceValue = null;

    if (wpm === null || wpm === this.settings.defaultWpm) {
      return;
    }

    try {
      await this.updateSettings({
        defaultWpm: wpm,
      });
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      this.reportRuntimeError(
        createVaultReaderError(
          "SETTINGS_PERSIST_FAILED",
          sanitizeErrorMessageForNotice(rawMessage, "Vault Reader could not save WPM settings."),
        ),
      );
    }
  }

  private updatePercentReadout(
    valueEl: HTMLOutputElement,
    sliderEl: HTMLInputElement,
    value: number,
  ): void {
    const label = `${value}%`;
    setTextContentIfChanged(valueEl, label);
    sliderEl.setAttribute("aria-valuetext", label);
  }

  private runSafely(
    task: () => Promise<unknown>,
    errorCode: VaultReaderErrorCode,
    fallbackMessage: string,
  ): void {
    void task().catch((error) => {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const message = sanitizeErrorMessageForNotice(rawMessage, fallbackMessage);
      this.reportRuntimeError(
        createVaultReaderError(errorCode, message, {
          fallbackMessage,
        }),
      );
    });
  }

  private reportRuntimeError(error: {
    code: VaultReaderErrorCode;
    message: string;
    context?: Record<string, unknown>;
  }): void {
    this.sessionRunner.cancelPendingTick();
    const safeError = createVaultReaderError(
      error.code,
      sanitizeErrorMessageForNotice(error.message, "Vault Reader encountered an unexpected error."),
      error.context,
    );
    if (this.lastNotifiedErrorMessage === safeError.message) {
      return;
    }

    this.lastNotifiedErrorMessage = safeError.message;
    this.controller.setError(safeError.message);
    this.renderFromSnapshot(this.sessionRunner.getSnapshot());
    this.notify(safeError.message);
  }
}
