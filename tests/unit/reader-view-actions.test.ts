import { describe, expect, it, vi } from "vitest";

import { ReaderViewActions } from "../../src/reader/view/reader-view-actions";
import type { ReaderSnapshot } from "../../src/reader/reader-controller";

function createSnapshot(state: ReaderSnapshot["state"], wpm = 300): ReaderSnapshot {
  return {
    state,
    sourceKey: "notes/a.md",
    currentIndex: 1,
    tokenCount: 3,
    wpm,
    currentDelayMs: 200,
    errorMessage: null,
  };
}

describe("ReaderViewActions", () => {
  it("applies WPM changes and reports the persisted value through a callback", () => {
    let snapshot = createSnapshot("READY", 300);
    const changedWpm: number[] = [];
    const actions = new ReaderViewActions({
      sessionRunner: {
        getSnapshot: () => snapshot,
        setWpm: (wpm) => {
          snapshot = createSnapshot(snapshot.state, wpm);
          return snapshot;
        },
        play: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        stop: vi.fn(),
      },
      getLastSessionPayload: () => null,
      setLastSessionPayload: vi.fn(),
      reloadSession: vi.fn(),
      onWpmChanged: (wpm) => changedWpm.push(wpm),
    });

    actions.execute("faster");
    actions.execute("slower");

    expect(changedWpm).toEqual([310, 300]);
  });

  it("replays completed sessions from the beginning while preserving current WPM", async () => {
    const play = vi.fn();
    const reloadSession = vi.fn(async () => undefined);
    const actions = new ReaderViewActions({
      sessionRunner: {
        getSnapshot: () => createSnapshot("COMPLETE", 420),
        setWpm: vi.fn(),
        play,
        pause: vi.fn(),
        resume: vi.fn(),
        stop: vi.fn(),
      },
      getLastSessionPayload: () => ({
        sourceKey: "notes/a.md",
        title: "a",
        tokens: [],
        startIndex: 2,
        wpm: 300,
      }),
      setLastSessionPayload: vi.fn(),
      reloadSession,
      onWpmChanged: vi.fn(),
    });

    await actions.execute("toggle-play-pause");

    expect(reloadSession).toHaveBeenCalledWith({
      sourceKey: "notes/a.md",
      title: "a",
      tokens: [],
      startIndex: 0,
      wpm: 420,
    });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("restarts the current session from the beginning without autoplaying", async () => {
    const play = vi.fn();
    const reloadSession = vi.fn(async () => undefined);
    const setLastSessionPayload = vi.fn();
    const actions = new ReaderViewActions({
      sessionRunner: {
        getSnapshot: () => createSnapshot("PLAYING", 420),
        setWpm: vi.fn(),
        play,
        pause: vi.fn(),
        resume: vi.fn(),
        stop: vi.fn(),
      },
      getLastSessionPayload: () => ({
        sourceKey: "notes/a.md",
        title: "a",
        tokens: [],
        startIndex: 2,
        wpm: 300,
      }),
      setLastSessionPayload,
      reloadSession,
      onWpmChanged: vi.fn(),
    });

    await actions.restart();

    const expectedPayload = {
      sourceKey: "notes/a.md",
      title: "a",
      tokens: [],
      startIndex: 0,
      wpm: 420,
    };
    expect(reloadSession).toHaveBeenCalledWith(expectedPayload);
    expect(setLastSessionPayload).toHaveBeenCalledWith(expectedPayload);
    expect(play).not.toHaveBeenCalled();
  });

  it("treats restart without a loaded session as a no-op", async () => {
    const reloadSession = vi.fn(async () => undefined);
    const actions = new ReaderViewActions({
      sessionRunner: {
        getSnapshot: () => createSnapshot("IDLE", 300),
        setWpm: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        stop: vi.fn(),
      },
      getLastSessionPayload: () => null,
      setLastSessionPayload: vi.fn(),
      reloadSession,
      onWpmChanged: vi.fn(),
    });

    await actions.restart();

    expect(reloadSession).not.toHaveBeenCalled();
  });
});
