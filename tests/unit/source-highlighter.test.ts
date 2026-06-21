import { describe, expect, it, vi } from "vitest";

import { ReaderSourceHighlighter } from "../../src/reader/source-highlighter";
import type { ReaderSnapshot } from "../../src/reader/reader-controller";
import type { TokenHighlightMap } from "../../src/reader/source-highlight-map";

function createSnapshot(overrides: Partial<ReaderSnapshot>): ReaderSnapshot {
  return {
    state: "READY",
    sourceKey: "notes/a.md",
    currentIndex: 0,
    tokenCount: 2,
    wpm: 300,
    currentDelayMs: 200,
    errorMessage: null,
    ...overrides,
  };
}

function createMap(): TokenHighlightMap {
  return {
    ok: true,
    sourceKey: "notes/a.md",
    ranges: [
      { index: 0, from: 0, to: 3 },
      { index: 1, from: 4, to: 7 },
    ],
  };
}

describe("ReaderSourceHighlighter", () => {
  it("updates the editor highlight once per token index and clears on stop", () => {
    const apply = vi.fn();
    const highlighter = new ReaderSourceHighlighter({
      apply,
      clear: () => apply(null),
    });

    highlighter.setSession({
      enabled: true,
      map: createMap(),
    });
    highlighter.update(createSnapshot({ state: "READY", currentIndex: 0 }));
    highlighter.update(createSnapshot({ state: "READY", currentIndex: 0 }));
    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 1 }));
    highlighter.update(createSnapshot({ state: "IDLE", currentIndex: 1 }));

    expect(apply).toHaveBeenCalledTimes(3);
    expect(apply).toHaveBeenNthCalledWith(1, { from: 0, to: 3, color: "yellow" });
    expect(apply).toHaveBeenNthCalledWith(2, { from: 4, to: 7, color: "yellow" });
    expect(apply).toHaveBeenNthCalledWith(3, null);
  });

  it("re-applies the current token when only the highlight color changes", () => {
    const apply = vi.fn();
    const highlighter = new ReaderSourceHighlighter({
      apply,
      clear: () => apply(null),
    });

    highlighter.setSession({
      enabled: true,
      color: "yellow",
      map: createMap(),
    });
    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 0 }));
    highlighter.setColor("orange");
    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 0 }));
    highlighter.setColor("blue");
    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 0 }));

    expect(apply).toHaveBeenCalledTimes(3);
    expect(apply).toHaveBeenNthCalledWith(1, { from: 0, to: 3, color: "yellow" });
    expect(apply).toHaveBeenNthCalledWith(2, { from: 0, to: 3, color: "orange" });
    expect(apply).toHaveBeenNthCalledWith(3, { from: 0, to: 3, color: "blue" });
  });

  it("does nothing when in-note highlighting is disabled", () => {
    const apply = vi.fn();
    const highlighter = new ReaderSourceHighlighter({
      apply,
      clear: () => apply(null),
    });

    highlighter.setSession({
      enabled: false,
      map: createMap(),
    });
    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 0 }));

    expect(apply).not.toHaveBeenCalled();
    expect(highlighter.getState()).toEqual({ status: "disabled" });
  });

  it("falls back safely when the adapter rejects highlight updates", () => {
    const unavailable = vi.fn();
    const highlighter = new ReaderSourceHighlighter(
      {
        apply: () => {
          throw new Error("missing editor view");
        },
        clear: vi.fn(),
      },
      {
        onUnavailable: unavailable,
      },
    );

    highlighter.setSession({
      enabled: true,
      map: createMap(),
    });

    expect(() =>
      highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 0 })),
    ).not.toThrow();
    expect(unavailable).toHaveBeenCalledWith("missing editor view");
    expect(highlighter.getState()).toEqual({
      status: "unavailable",
      reason: "missing editor view",
      notified: true,
    });

    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 1 }));
    expect(unavailable).toHaveBeenCalledTimes(1);
  });

  it("transitions from ready to active when a valid token range exists", () => {
    const highlighter = new ReaderSourceHighlighter({
      apply: vi.fn(),
      clear: vi.fn(),
    });

    highlighter.setSession({
      enabled: true,
      map: createMap(),
    });

    expect(highlighter.getState()).toEqual({ status: "ready" });

    highlighter.update(createSnapshot({ state: "PLAYING", currentIndex: 1 }));

    expect(highlighter.getState()).toEqual({
      status: "active",
      range: { from: 4, to: 7, color: "yellow" },
    });
  });
});
