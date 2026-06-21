import type { ReaderSnapshot } from "../reader-controller";
import {
  buildReplaySessionPayload,
  type ReaderKeyAction,
  type ReplaySessionPayload,
} from "../reader-view-model";

export interface ReaderActionRunner {
  getSnapshot: () => ReaderSnapshot;
  setWpm: (wpm: number) => ReaderSnapshot;
  play: () => ReaderSnapshot;
  pause: () => Promise<ReaderSnapshot> | ReaderSnapshot;
  resume: () => ReaderSnapshot;
  stop: () => Promise<ReaderSnapshot> | ReaderSnapshot;
}

export interface ReaderViewActionsOptions<TPayload extends ReplaySessionPayload<unknown>> {
  sessionRunner: ReaderActionRunner;
  getLastSessionPayload: () => TPayload | null;
  setLastSessionPayload: (payload: TPayload) => void;
  reloadSession: (payload: TPayload) => Promise<void>;
  onWpmChanged: (wpm: number) => void;
}

export class ReaderViewActions<
  TPayload extends ReplaySessionPayload<unknown> = ReplaySessionPayload<unknown>,
> {
  private readonly sessionRunner: ReaderActionRunner;
  private readonly getLastSessionPayload: () => TPayload | null;
  private readonly setLastSessionPayload: (payload: TPayload) => void;
  private readonly reloadSession: (payload: TPayload) => Promise<void>;
  private readonly onWpmChanged: (wpm: number) => void;

  constructor(options: ReaderViewActionsOptions<TPayload>) {
    this.sessionRunner = options.sessionRunner;
    this.getLastSessionPayload = options.getLastSessionPayload;
    this.setLastSessionPayload = options.setLastSessionPayload;
    this.reloadSession = options.reloadSession;
    this.onWpmChanged = options.onWpmChanged;
  }

  async execute(action: ReaderKeyAction): Promise<void> {
    switch (action) {
      case "toggle-play-pause":
        await this.togglePlayPause();
        return;
      case "stop":
        await this.sessionRunner.stop();
        return;
      case "restart":
        await this.restart();
        return;
      case "faster":
        this.adjustWpm(10);
        return;
      case "slower":
        this.adjustWpm(-10);
        return;
      default:
        return;
    }
  }

  adjustWpm(delta: number): void {
    const snapshot = this.sessionRunner.getSnapshot();
    this.applyWpm(snapshot.wpm + delta);
  }

  applyWpm(nextWpm: number): ReaderSnapshot {
    const snapshot = this.sessionRunner.setWpm(nextWpm);
    const lastSessionPayload = this.getLastSessionPayload();
    if (lastSessionPayload) {
      this.setLastSessionPayload({
        ...lastSessionPayload,
        wpm: snapshot.wpm,
      });
    }
    this.onWpmChanged(snapshot.wpm);
    return snapshot;
  }

  async togglePlayPause(): Promise<void> {
    const snapshot = this.sessionRunner.getSnapshot();
    switch (snapshot.state) {
      case "PLAYING":
        await this.sessionRunner.pause();
        return;
      case "PAUSED":
        this.sessionRunner.resume();
        return;
      case "COMPLETE":
        await this.replayCompletedSession(snapshot.wpm);
        return;
      case "READY":
      case "IDLE":
        this.sessionRunner.play();
        return;
      default:
        return;
    }
  }

  async restart(): Promise<void> {
    const lastSessionPayload = this.getLastSessionPayload();
    if (!lastSessionPayload) {
      return;
    }

    const snapshot = this.sessionRunner.getSnapshot();
    const restartPayload = buildReplaySessionPayload(lastSessionPayload, snapshot.wpm) as TPayload;
    this.setLastSessionPayload(restartPayload);
    await this.reloadSession(restartPayload);
  }

  private async replayCompletedSession(currentWpm: number): Promise<void> {
    const lastSessionPayload = this.getLastSessionPayload();
    if (!lastSessionPayload) {
      return;
    }

    const replayPayload = buildReplaySessionPayload(lastSessionPayload, currentWpm) as TPayload;
    await this.reloadSession(replayPayload);
    this.sessionRunner.play();
  }
}
