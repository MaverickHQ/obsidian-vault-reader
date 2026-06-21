import { describe, expect, it } from "vitest";

import { ReaderController, type ReadingPositionStore } from "../../src/reader/reader-controller";
import { tokenizeReadingText } from "../../src/reader/tokenizer";

function createMemoryPositionStore(): ReadingPositionStore & { saved: Map<string, number> } {
  const saved = new Map<string, number>();

  return {
    saved,
    load: async (sourceKey: string) => saved.get(sourceKey) ?? null,
    save: async (sourceKey: string, tokenIndex: number) => {
      saved.set(sourceKey, tokenIndex);
    },
  };
}

function createFailingPositionStore(): ReadingPositionStore & { saveCalls: number } {
  let saveCalls = 0;

  return {
    get saveCalls() {
      return saveCalls;
    },
    load: async () => null,
    save: async () => {
      saveCalls += 1;
      throw new Error("write failed");
    },
  };
}

describe("ReaderController", () => {
  it("pause() preserves current token index", async () => {
    const positionStore = createMemoryPositionStore();
    const controller = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();
    await controller.advance();
    await controller.pause();

    const snapshot = controller.getSnapshot();
    expect(snapshot.state).toBe("PAUSED");
    expect(snapshot.currentIndex).toBe(1);
    expect(positionStore.saved.get("notes/a.md")).toBe(1);
  });

  it("resume() continues from saved state", async () => {
    const positionStore = createMemoryPositionStore();
    const controller = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();
    await controller.advance();
    await controller.pause();
    controller.resume();
    await controller.advance();

    const snapshot = controller.getSnapshot();
    expect(snapshot.state).toBe("PLAYING");
    expect(snapshot.currentIndex).toBe(2);
  });

  it("restores last-known token position for the same source", async () => {
    const positionStore = createMemoryPositionStore();
    const first = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    await first.loadSession({ sourceKey: "notes/a.md", tokens });
    first.play();
    await first.advance();
    await first.pause();

    const second = new ReaderController({ positionStore, defaultWpm: 300 });
    await second.loadSession({ sourceKey: "notes/a.md", tokens });
    const snapshot = second.getSnapshot();

    expect(snapshot.state).toBe("READY");
    expect(snapshot.currentIndex).toBe(1);
  });

  it("persists an explicit start index when loading a restarted session", async () => {
    const positionStore = createMemoryPositionStore();
    positionStore.saved.set("notes/a.md", 2);
    const controller = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({
      sourceKey: "notes/a.md",
      tokens,
      startIndex: 0,
    });

    const snapshot = controller.getSnapshot();
    expect(snapshot.state).toBe("READY");
    expect(snapshot.currentIndex).toBe(0);
    expect(positionStore.saved.get("notes/a.md")).toBe(0);
  });

  it("reports an error if explicit start position persistence fails", async () => {
    const positionStore = createFailingPositionStore();
    const controller = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    const snapshot = await controller.loadSession({
      sourceKey: "notes/a.md",
      tokens,
      startIndex: 0,
    });

    expect(snapshot.state).toBe("ERROR");
    expect(snapshot.errorMessage).toContain("save reading progress");
    expect(positionStore.saveCalls).toBe(1);
  });

  it("sets state COMPLETE after advancing past the final token", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const tokens = tokenizeReadingText("One.");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();
    await controller.advance();

    const snapshot = controller.getSnapshot();
    expect(snapshot.state).toBe("COMPLETE");
    expect(snapshot.currentIndex).toBe(0);
  });

  it("allows play() after stop() when a session is loaded", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();
    await controller.stop();

    const stopped = controller.getSnapshot();
    expect(stopped.state).toBe("IDLE");
    expect(stopped.tokenCount).toBe(3);

    controller.play();
    const resumed = controller.getSnapshot();
    expect(resumed.state).toBe("PLAYING");
  });

  it("does not attempt another persist when stop() is called from an ERROR state", async () => {
    const positionStore = createFailingPositionStore();
    const controller = new ReaderController({ positionStore, defaultWpm: 300 });
    const tokens = tokenizeReadingText("One two");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();
    const failedPause = await controller.pause();

    expect(failedPause.state).toBe("ERROR");
    expect(positionStore.saveCalls).toBe(1);

    const afterStop = await controller.stop();
    expect(afterStop.state).toBe("ERROR");
    expect(afterStop.errorMessage).toContain("pausing");
    expect(positionStore.saveCalls).toBe(1);
  });
});
