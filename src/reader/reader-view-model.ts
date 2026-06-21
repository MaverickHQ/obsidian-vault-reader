export type ReaderKeyAction = "toggle-play-pause" | "stop" | "restart" | "faster" | "slower";

export interface OrpRenderParts {
  prefix: string;
  focus: string;
  suffix: string;
}

export interface ReaderProgress {
  label: string;
  percent: number;
}

export interface ReaderKeyEventContext {
  targetTagName: string | null;
  isContentEditable: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

export interface ReplaySessionPayload<TToken = unknown> {
  sourceKey: string;
  title: string;
  tokens: TToken[];
  startIndex?: number;
  wpm?: number;
}

export interface PanelZoomBoundsInput {
  desiredZoom: number;
  minZoom: number;
  maxZoom: number;
  step: number;
  containerWidth: number;
  containerHeight: number;
  shellBaseWidth: number;
  shellBaseHeight: number;
}

export interface PanelZoomBounds {
  min: number;
  max: number;
  value: number;
}

export function buildOrpRenderParts(spoken: string, orpIndex: number): OrpRenderParts {
  if (spoken.length === 0) {
    return {
      prefix: "",
      focus: "",
      suffix: "",
    };
  }

  const safeIndex = Math.min(spoken.length - 1, Math.max(0, orpIndex));
  return {
    prefix: spoken.slice(0, safeIndex),
    focus: spoken.charAt(safeIndex),
    suffix: spoken.slice(safeIndex + 1),
  };
}

export function buildReaderProgress(currentIndex: number, tokenCount: number): ReaderProgress {
  if (tokenCount <= 0) {
    return {
      label: "0 / 0",
      percent: 0,
    };
  }

  const safeIndex = Math.min(tokenCount - 1, Math.max(0, currentIndex));
  const completed = safeIndex + 1;
  return {
    label: `${completed} / ${tokenCount}`,
    percent: Math.round((completed / tokenCount) * 100),
  };
}

export function resolveReaderKeyAction(key: string): ReaderKeyAction | null {
  if (key === " " || key === "k" || key === "K") {
    return "toggle-play-pause";
  }

  if (key === "Escape") {
    return "stop";
  }

  if (key === "ArrowUp") {
    return "faster";
  }

  if (key === "ArrowDown") {
    return "slower";
  }

  return null;
}

export function shouldHandleReaderKeyEvent(context: ReaderKeyEventContext): boolean {
  if (context.altKey || context.ctrlKey || context.metaKey) {
    return false;
  }

  if (context.isContentEditable) {
    return false;
  }

  const tagName = context.targetTagName?.toUpperCase() ?? "";
  return tagName !== "INPUT" && tagName !== "TEXTAREA" && tagName !== "SELECT";
}

export function buildReplaySessionPayload<TToken>(
  lastSessionPayload: ReplaySessionPayload<TToken>,
  currentWpm: number,
): ReplaySessionPayload<TToken> {
  return {
    ...lastSessionPayload,
    startIndex: 0,
    wpm: currentWpm,
  };
}

export function resolvePanelZoomBounds(input: PanelZoomBoundsInput): PanelZoomBounds {
  const step = normalizePositive(input.step, 1);
  const staticMax = Math.max(step, roundToStep(input.maxZoom, step));
  const staticMin = clamp(roundToStep(input.minZoom, step), step, staticMax);
  const fitsViewport =
    input.containerWidth > 0 &&
    input.containerHeight > 0 &&
    input.shellBaseWidth > 0 &&
    input.shellBaseHeight > 0;

  let dynamicMax = staticMax;
  if (fitsViewport) {
    const maxByWidth = (input.containerWidth / input.shellBaseWidth) * 100;
    const maxByHeight = (input.containerHeight / input.shellBaseHeight) * 100;
    dynamicMax = floorToStep(Math.min(maxByWidth, maxByHeight, staticMax), step);
  }

  if (!Number.isFinite(dynamicMax) || dynamicMax <= 0) {
    dynamicMax = staticMax;
  }

  const boundedMax = clamp(dynamicMax, step, staticMax);
  const boundedMin = Math.min(staticMin, boundedMax);
  const boundedValue = clamp(roundToStep(input.desiredZoom, step), boundedMin, boundedMax);
  return {
    min: boundedMin,
    max: boundedMax,
    value: boundedValue,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, step: number): number {
  return Math.round(normalizeFinite(value, 0) / step) * step;
}

function floorToStep(value: number, step: number): number {
  return Math.floor(normalizeFinite(value, 0) / step) * step;
}

function normalizePositive(value: number, fallback: number): number {
  if (Number.isFinite(value) && value > 0) {
    return value;
  }
  return fallback;
}

function normalizeFinite(value: number, fallback: number): number {
  if (Number.isFinite(value)) {
    return value;
  }
  return fallback;
}
