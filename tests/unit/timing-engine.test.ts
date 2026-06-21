import { describe, expect, it } from "vitest";

import {
  DEFAULT_TIMING_CONFIG,
  delayForToken,
  timingForWpm,
  type TimingConfig,
} from "../../src/reader/timing-engine";
import type { ReadingToken } from "../../src/reader/tokenizer";

function buildToken(
  pauseClass: ReadingToken["pauseClass"],
  overrides: Partial<ReadingToken> = {},
): ReadingToken {
  return {
    index: 0,
    raw: "token",
    spoken: "token",
    orpIndex: 1,
    trailingPunctuation: "",
    pauseClass,
    pauseMultiplier: 1,
    sourceStart: 0,
    sourceEnd: 5,
    ...overrides,
  };
}

describe("timingForWpm", () => {
  it("returns expected base delay at 300 WPM", () => {
    expect(timingForWpm(300)).toBe(200);
  });

  it("clamps WPM to configured bounds", () => {
    expect(timingForWpm(20)).toBe(600);
    expect(timingForWpm(10_000)).toBe(100);
  });
});

describe("delayForToken", () => {
  it("applies punctuation-aware pause multipliers from token metadata", () => {
    expect(delayForToken(buildToken("none"), 300)).toBe(200);
    expect(delayForToken(buildToken("clause"), 300)).toBe(270);
    expect(delayForToken(buildToken("sentence"), 300)).toBe(350);
    expect(delayForToken(buildToken("paragraph"), 300)).toBe(440);
  });

  it("supports configurable delay rules", () => {
    const config: Partial<TimingConfig> = {
      sentencePauseMultiplier: 2,
      minDelayMs: 0,
      maxDelayMs: 10_000,
    };

    const sentenceDelay = delayForToken(buildToken("sentence"), 300, config);

    expect(sentenceDelay).toBe(400);
    expect(DEFAULT_TIMING_CONFIG.sentencePauseMultiplier).toBe(1.75);
  });
});
