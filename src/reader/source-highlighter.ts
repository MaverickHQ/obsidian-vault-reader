import type { ReaderSnapshot } from "./reader-controller";
import {
  createSourceHighlightState,
  markSourceHighlightUnavailableNotified,
  shouldNotifySourceHighlightUnavailable,
  transitionSourceHighlightActive,
  transitionSourceHighlightReady,
  transitionSourceHighlightUnavailable,
  type SourceHighlightState,
} from "./source-highlight-state";
import {
  resolveTokenHighlightRange,
  type EditorHighlightRange,
  type TokenHighlightMap,
} from "./source-highlight-map";
import type { ReaderInNoteHighlightColor } from "../settings/vault-reader-data-store";

export interface SourceHighlightAdapter {
  apply: (range: EditorHighlightRange) => void;
  clear: () => void;
}

export interface ReaderSourceHighlighterOptions {
  onUnavailable?: (message: string) => void;
}

export interface ReaderSourceHighlightSession {
  enabled: boolean;
  map: TokenHighlightMap | null;
  color?: ReaderInNoteHighlightColor;
}

export class ReaderSourceHighlighter {
  private map: TokenHighlightMap | null = null;
  private color: ReaderInNoteHighlightColor = "yellow";
  private lastAppliedSignature: string | null = "clear";
  private state: SourceHighlightState = { status: "disabled" };

  constructor(
    private readonly adapter: SourceHighlightAdapter,
    private readonly options: ReaderSourceHighlighterOptions = {},
  ) {}

  setSession(session: ReaderSourceHighlightSession): void {
    this.clear();
    this.map = session.map;
    this.color = session.color ?? "yellow";
    this.state = createSourceHighlightState({
      enabled: session.enabled,
      map: session.map,
    });
    this.reportUnavailableIfNeeded();
  }

  setEnabled(enabled: boolean): void {
    if (enabled && this.state.status !== "disabled") {
      return;
    }

    if (!enabled) {
      this.clear();
      this.state = { status: "disabled" };
      return;
    }

    this.state = createSourceHighlightState({
      enabled,
      map: this.map,
    });
    this.reportUnavailableIfNeeded();
  }

  getState(): SourceHighlightState {
    return this.state;
  }

  markUnavailable(reason: string): void {
    this.state = transitionSourceHighlightUnavailable(this.state, reason);
    this.lastAppliedSignature = null;
    this.reportUnavailableIfNeeded();
  }

  setColor(color: ReaderInNoteHighlightColor): void {
    this.color = color;
  }

  update(snapshot: ReaderSnapshot): void {
    if (this.state.status === "disabled" || this.state.status === "unavailable") {
      return;
    }

    if (!this.map || !this.map.ok) {
      this.markUnavailable("NO_HIGHLIGHT_MAP");
      return;
    }

    if (snapshot.sourceKey !== this.map.sourceKey) {
      this.clear();
      this.state = transitionSourceHighlightReady(this.state);
      return;
    }

    const range = resolveTokenHighlightRange(this.map, snapshot.state, snapshot.currentIndex);
    if (!range) {
      this.clear();
      this.state = transitionSourceHighlightReady(this.state);
      return;
    }

    const coloredRange = {
      ...range,
      color: this.color,
    };
    this.apply(coloredRange);
    this.state = transitionSourceHighlightActive(this.state, coloredRange);
  }

  clear(): void {
    if (this.lastAppliedSignature === "clear") {
      return;
    }

    try {
      this.adapter.clear();
      this.lastAppliedSignature = "clear";
      this.state = transitionSourceHighlightReady(this.state);
    } catch (error) {
      this.handleAdapterError(error);
    }
  }

  private apply(range: EditorHighlightRange): void {
    const signature = `${range.from}:${range.to}:${range.color ?? this.color}`;
    if (this.lastAppliedSignature === signature) {
      return;
    }

    try {
      this.adapter.apply(range);
      this.lastAppliedSignature = signature;
    } catch (error) {
      this.handleAdapterError(error);
    }
  }

  private handleAdapterError(error: unknown): void {
    this.lastAppliedSignature = null;
    const message = error instanceof Error ? error.message : String(error);
    this.markUnavailable(message);
  }

  private reportUnavailableIfNeeded(): void {
    if (!shouldNotifySourceHighlightUnavailable(this.state)) {
      return;
    }

    this.options.onUnavailable?.(this.state.reason);
    this.state = markSourceHighlightUnavailableNotified(this.state);
  }
}
