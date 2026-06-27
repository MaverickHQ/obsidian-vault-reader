import type { ReadingToken } from "./tokenizer";
import { delayForToken, normalizeWpm, type TimingConfig } from "./timing-engine";

export type ReaderSessionState = "IDLE" | "READY" | "PLAYING" | "PAUSED" | "COMPLETE" | "ERROR";

export interface ReaderSnapshot {
  state: ReaderSessionState;
  sourceKey: string | null;
  currentIndex: number;
  tokenCount: number;
  wpm: number;
  currentDelayMs: number | null;
  errorMessage: string | null;
}

export interface ReaderSessionInput {
  sourceKey: string;
  tokens: ReadingToken[];
  startIndex?: number;
  wpm?: number;
}

export interface ReadingPositionStore {
  load: (sourceKey: string) => Promise<number | null> | number | null;
  save: (sourceKey: string, tokenIndex: number) => Promise<void> | void;
}

export interface ReaderControllerOptions {
  positionStore?: ReadingPositionStore;
  defaultWpm?: number;
  timingConfig?: Partial<TimingConfig>;
}

const NOOP_POSITION_STORE: ReadingPositionStore = {
  load: () => null,
  save: () => undefined,
};

export class ReaderController {
  private state: ReaderSessionState = "IDLE";
  private sourceKey: string | null = null;
  private tokens: ReadingToken[] = [];
  private currentIndex = 0;
  private wpm: number;
  private errorMessage: string | null = null;
  private readonly positionStore: ReadingPositionStore;
  private readonly timingConfig: Partial<TimingConfig>;

  constructor(options: ReaderControllerOptions = {}) {
    this.positionStore = options.positionStore ?? NOOP_POSITION_STORE;
    this.timingConfig = options.timingConfig ?? {};
    this.wpm = normalizeWpm(options.defaultWpm ?? 300, this.timingConfig);
  }

  async loadSession(input: ReaderSessionInput): Promise<ReaderSnapshot> {
    this.sourceKey = input.sourceKey;
    this.tokens = input.tokens;
    this.errorMessage = null;
    this.wpm = normalizeWpm(input.wpm ?? this.wpm, this.timingConfig);

    if (this.tokens.length === 0) {
      this.state = "ERROR";
      this.currentIndex = 0;
      this.errorMessage = "Cannot start a reader session with zero tokens.";
      return this.getSnapshot();
    }

    const explicitIndex = input.startIndex;
    if (explicitIndex !== undefined) {
      this.currentIndex = clampTokenIndex(explicitIndex, this.tokens.length);
    } else {
      const storedIndex = await Promise.resolve(this.positionStore.load(input.sourceKey));
      this.currentIndex = clampTokenIndex(storedIndex ?? 0, this.tokens.length);
    }

    this.state = "READY";
    if (explicitIndex !== undefined) {
      const persisted = await this.persistPosition();
      if (!persisted) {
        return this.toErrorState("Vault Reader could not save reading progress while loading.");
      }
    }
    return this.getSnapshot();
  }

  play(): ReaderSnapshot {
    if (
      this.state === "READY" ||
      this.state === "PAUSED" ||
      (this.state === "IDLE" && this.tokens.length > 0)
    ) {
      this.state = "PLAYING";
    }
    return this.getSnapshot();
  }

  async pause(): Promise<ReaderSnapshot> {
    if (this.state === "PLAYING") {
      this.state = "PAUSED";
      const persisted = await this.persistPosition();
      if (!persisted) {
        return this.toErrorState("Vault Reader could not save reading progress while pausing.");
      }
    }
    return this.getSnapshot();
  }

  resume(): ReaderSnapshot {
    if (this.state === "PAUSED") {
      this.state = "PLAYING";
    }
    return this.getSnapshot();
  }

  async stop(): Promise<ReaderSnapshot> {
    if (this.state === "ERROR") {
      return this.getSnapshot();
    }

    if (this.state !== "IDLE") {
      const persisted = await this.persistPosition();
      if (!persisted) {
        return this.toErrorState("Vault Reader could not save reading progress while stopping.");
      }
      this.state = "IDLE";
    }
    return this.getSnapshot();
  }

  async advance(): Promise<ReaderSnapshot> {
    if (this.state !== "PLAYING" || this.tokens.length === 0) {
      return this.getSnapshot();
    }

    const lastIndex = this.tokens.length - 1;
    if (this.currentIndex >= lastIndex) {
      this.state = "COMPLETE";
      const persisted = await this.persistPosition();
      if (!persisted) {
        return this.toErrorState("Vault Reader could not save reading progress at completion.");
      }
      return this.getSnapshot();
    }

    this.currentIndex += 1;
    return this.getSnapshot();
  }

  setWpm(wpm: number): ReaderSnapshot {
    this.wpm = normalizeWpm(wpm, this.timingConfig);
    return this.getSnapshot();
  }

  getCurrentToken(): ReadingToken | null {
    if (this.tokens.length === 0) {
      return null;
    }
    return this.tokens[this.currentIndex] ?? null;
  }

  getCurrentDelayMs(): number | null {
    const token = this.getCurrentToken();
    if (!token) {
      return null;
    }
    return delayForToken(token, this.wpm, this.timingConfig);
  }

  getSnapshot(): ReaderSnapshot {
    return {
      state: this.state,
      sourceKey: this.sourceKey,
      currentIndex: this.currentIndex,
      tokenCount: this.tokens.length,
      wpm: this.wpm,
      currentDelayMs: this.getCurrentDelayMs(),
      errorMessage: this.errorMessage,
    };
  }

  setError(message: string): ReaderSnapshot {
    return this.toErrorState(message);
  }

  private async persistPosition(): Promise<boolean> {
    if (!this.sourceKey) {
      return true;
    }

    try {
      await Promise.resolve(this.positionStore.save(this.sourceKey, this.currentIndex));
      return true;
    } catch {
      return false;
    }
  }

  private toErrorState(message: string): ReaderSnapshot {
    this.state = "ERROR";
    this.errorMessage = message;
    return this.getSnapshot();
  }
}

function clampTokenIndex(candidate: number, tokenCount: number): number {
  if (tokenCount <= 0 || !Number.isFinite(candidate)) {
    return 0;
  }

  return Math.min(tokenCount - 1, Math.max(0, Math.floor(candidate)));
}
