import type { EditorHighlightRange, TokenHighlightMap } from "./source-highlight-map";

export type SourceHighlightState =
  | { status: "disabled" }
  | { status: "ready" }
  | { status: "active"; range: EditorHighlightRange }
  | { status: "unavailable"; reason: string; notified: boolean };

export interface SourceHighlightStateInput {
  enabled: boolean;
  map: TokenHighlightMap | null;
}

export function createSourceHighlightState(input: SourceHighlightStateInput): SourceHighlightState {
  if (!input.enabled) {
    return { status: "disabled" };
  }

  if (!input.map) {
    return {
      status: "unavailable",
      reason: "NO_HIGHLIGHT_MAP",
      notified: false,
    };
  }

  if (!input.map.ok) {
    return {
      status: "unavailable",
      reason: input.map.reason,
      notified: false,
    };
  }

  return { status: "ready" };
}

export function transitionSourceHighlightReady(
  current: SourceHighlightState,
): SourceHighlightState {
  if (current.status === "disabled" || current.status === "unavailable") {
    return current;
  }

  return { status: "ready" };
}

export function transitionSourceHighlightActive(
  current: SourceHighlightState,
  range: EditorHighlightRange,
): SourceHighlightState {
  if (current.status === "disabled" || current.status === "unavailable") {
    return current;
  }

  return {
    status: "active",
    range,
  };
}

export function transitionSourceHighlightUnavailable(
  current: SourceHighlightState,
  reason: string,
): SourceHighlightState {
  if (current.status === "unavailable") {
    return current;
  }

  return {
    status: "unavailable",
    reason,
    notified: false,
  };
}

export function shouldNotifySourceHighlightUnavailable(
  state: SourceHighlightState,
): state is { status: "unavailable"; reason: string; notified: false } {
  return state.status === "unavailable" && !state.notified;
}

export function markSourceHighlightUnavailableNotified(
  state: SourceHighlightState,
): SourceHighlightState {
  if (state.status !== "unavailable" || state.notified) {
    return state;
  }

  return {
    ...state,
    notified: true,
  };
}
