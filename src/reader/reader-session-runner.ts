import {
  ReaderController,
  type ReaderSessionInput,
  type ReaderSnapshot,
} from "./reader-controller";
import {
  createVaultReaderError,
  fingerprintVaultReaderError,
  type VaultReaderError,
} from "../errors/vault-reader-error";

export interface ReaderSessionScheduler {
  setTimer: (callback: () => void, delayMs: number) => number;
  clearTimer: (timerId: number) => void;
}

export interface ReaderSessionRunnerOptions {
  scheduler?: ReaderSessionScheduler;
  onSnapshot?: (snapshot: ReaderSnapshot) => void;
  onError?: (error: VaultReaderError) => void;
}

const DEFAULT_SCHEDULER: ReaderSessionScheduler = {
  setTimer: (callback: () => void, delayMs: number) => {
    return window.setTimeout(callback, delayMs);
  },
  clearTimer: (timerId: number) => {
    window.clearTimeout(timerId);
  },
};

export class ReaderSessionRunner {
  private readonly controller: ReaderController;
  private readonly scheduler: ReaderSessionScheduler;
  private readonly onSnapshot?: (snapshot: ReaderSnapshot) => void;
  private readonly onError?: (error: VaultReaderError) => void;
  private activeTimerId: number | null = null;
  private lastReportedErrorFingerprint: string | null = null;

  constructor(controller: ReaderController, options: ReaderSessionRunnerOptions = {}) {
    this.controller = controller;
    this.scheduler = options.scheduler ?? DEFAULT_SCHEDULER;
    this.onSnapshot = options.onSnapshot;
    this.onError = options.onError;
  }

  async loadSession(input: ReaderSessionInput): Promise<ReaderSnapshot> {
    this.clearActiveTimer();
    this.lastReportedErrorFingerprint = null;
    const snapshot = await this.controller.loadSession(input);
    this.emit(snapshot);
    return snapshot;
  }

  play(): ReaderSnapshot {
    const snapshot = this.controller.play();
    this.emit(snapshot);
    this.scheduleNextIfPlaying();
    return snapshot;
  }

  async pause(): Promise<ReaderSnapshot> {
    this.clearActiveTimer();
    const snapshot = await this.controller.pause();
    this.reportErrorFromSnapshot(snapshot);
    this.emit(snapshot);
    return snapshot;
  }

  resume(): ReaderSnapshot {
    const snapshot = this.controller.resume();
    this.emit(snapshot);
    this.scheduleNextIfPlaying();
    return snapshot;
  }

  async stop(): Promise<ReaderSnapshot> {
    this.clearActiveTimer();
    const snapshot = await this.controller.stop();
    this.reportErrorFromSnapshot(snapshot);
    this.emit(snapshot);
    return snapshot;
  }

  cancelPendingTick(): void {
    this.clearActiveTimer();
  }

  setWpm(wpm: number): ReaderSnapshot {
    const snapshot = this.controller.setWpm(wpm);
    this.emit(snapshot);

    if (snapshot.state === "PLAYING") {
      this.scheduleNextIfPlaying();
    }

    return snapshot;
  }

  getSnapshot(): ReaderSnapshot {
    return this.controller.getSnapshot();
  }

  private scheduleNextIfPlaying(): void {
    const snapshot = this.controller.getSnapshot();
    if (snapshot.state !== "PLAYING") {
      this.clearActiveTimer();
      return;
    }

    const delayMs = snapshot.currentDelayMs;
    if (delayMs === null) {
      this.clearActiveTimer();
      return;
    }

    this.clearActiveTimer();
    this.activeTimerId = this.scheduler.setTimer(() => {
      this.runTickSafely();
    }, delayMs);
  }

  private async onTick(): Promise<void> {
    this.activeTimerId = null;
    const snapshot = await this.controller.advance();
    this.reportErrorFromSnapshot(snapshot);
    this.emit(snapshot);

    if (snapshot.state === "PLAYING") {
      this.scheduleNextIfPlaying();
    }
  }

  private emit(snapshot: ReaderSnapshot): void {
    this.onSnapshot?.(snapshot);
  }

  private runTickSafely(): void {
    void this.onTick().catch((error) => {
      const message = "Vault Reader encountered an unexpected playback error.";
      const snapshot = this.controller.setError(message);
      this.emit(snapshot);
      this.reportError(
        createVaultReaderError("SESSION_PLAYBACK_UNEXPECTED", message, {
          cause: error instanceof Error ? error.message : String(error),
        }),
      );
    });
  }

  private reportErrorFromSnapshot(snapshot: ReaderSnapshot): void {
    if (snapshot.state !== "ERROR" || !snapshot.errorMessage) {
      return;
    }

    this.reportError(
      createVaultReaderError("SESSION_STATE_ERROR", snapshot.errorMessage, {
        sourceKey: snapshot.sourceKey,
        currentIndex: snapshot.currentIndex,
      }),
    );
  }

  private reportError(error: VaultReaderError): void {
    const fingerprint = fingerprintVaultReaderError(error);
    if (this.lastReportedErrorFingerprint === fingerprint) {
      return;
    }

    this.lastReportedErrorFingerprint = fingerprint;
    this.onError?.(error);
  }

  private clearActiveTimer(): void {
    if (this.activeTimerId === null) {
      return;
    }

    this.scheduler.clearTimer(this.activeTimerId);
    this.activeTimerId = null;
  }
}
