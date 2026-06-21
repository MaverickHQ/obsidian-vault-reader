import type { ReadingToken, TokenPauseClass } from "./tokenizer";

export interface TimingConfig {
  defaultWpm: number;
  minWpm: number;
  maxWpm: number;
  clausePauseMultiplier: number;
  sentencePauseMultiplier: number;
  paragraphPauseMultiplier: number;
  minDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_TIMING_CONFIG: TimingConfig = {
  defaultWpm: 300,
  minWpm: 100,
  maxWpm: 600,
  clausePauseMultiplier: 1.35,
  sentencePauseMultiplier: 1.75,
  paragraphPauseMultiplier: 2.2,
  minDelayMs: 60,
  maxDelayMs: 2_000,
};

export function normalizeWpm(wpm: number, overrides: Partial<TimingConfig> = {}): number {
  const config = withTimingDefaults(overrides);
  const safeWpm = Number.isFinite(wpm) ? wpm : config.defaultWpm;
  return clampNumber(Math.round(safeWpm), config.minWpm, config.maxWpm);
}

export function timingForWpm(wpm: number, overrides: Partial<TimingConfig> = {}): number {
  const config = withTimingDefaults(overrides);
  const normalizedWpm = normalizeWpm(wpm, config);
  const baseDelayMs = Math.round(60_000 / normalizedWpm);

  return clampNumber(baseDelayMs, config.minDelayMs, config.maxDelayMs);
}

export function delayForPauseClass(
  pauseClass: TokenPauseClass,
  wpm: number,
  overrides: Partial<TimingConfig> = {},
): number {
  const config = withTimingDefaults(overrides);
  const baseDelayMs = timingForWpm(wpm, config);
  const multiplier = pauseMultiplierForClass(pauseClass, config);
  const delayMs = Math.round(baseDelayMs * multiplier);

  return clampNumber(delayMs, config.minDelayMs, config.maxDelayMs);
}

export function delayForToken(
  token: Pick<ReadingToken, "pauseClass">,
  wpm: number,
  overrides: Partial<TimingConfig> = {},
): number {
  return delayForPauseClass(token.pauseClass, wpm, overrides);
}

function withTimingDefaults(overrides: Partial<TimingConfig>): TimingConfig {
  return {
    ...DEFAULT_TIMING_CONFIG,
    ...overrides,
  };
}

function pauseMultiplierForClass(pauseClass: TokenPauseClass, config: TimingConfig): number {
  switch (pauseClass) {
    case "clause":
      return config.clausePauseMultiplier;
    case "sentence":
      return config.sentencePauseMultiplier;
    case "paragraph":
      return config.paragraphPauseMultiplier;
    default:
      return 1;
  }
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
