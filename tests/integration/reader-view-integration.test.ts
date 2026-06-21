import { describe, expect, it } from "vitest";

import { ReaderController } from "../../src/reader/reader-controller";
import {
  ReaderSessionRunner,
  type ReaderSessionScheduler,
} from "../../src/reader/reader-session-runner";
import {
  buildReplaySessionPayload,
  resolveReaderKeyAction,
  shouldHandleReaderKeyEvent,
} from "../../src/reader/reader-view-model";
import { tokenizeReadingText } from "../../src/reader/tokenizer";

type TimerTask = {
  delayMs: number;
  callback: () => void;
};

function createManualScheduler(): ReaderSessionScheduler & {
  tasks: Map<number, TimerTask>;
  runNext: () => void;
} {
  let nextId = 1;
  const tasks = new Map<number, TimerTask>();

  return {
    tasks,
    setTimer: (callback: () => void, delayMs: number) => {
      const id = nextId++;
      tasks.set(id, { callback, delayMs });
      return id;
    },
    clearTimer: (id: number) => {
      tasks.delete(id);
    },
    runNext: () => {
      const first = tasks.entries().next().value as [number, TimerTask] | undefined;
      if (!first) {
        return;
      }
      const [id, task] = first;
      tasks.delete(id);
      task.callback();
    },
  };
}

describe("reader-view orchestration helpers", () => {
  it("maps keyboard toggles to runner lifecycle and supports replay from index 0", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const scheduler = createManualScheduler();
    const runner = new ReaderSessionRunner(controller, { scheduler });
    const tokens = tokenizeReadingText("One two");

    const lastPayload = {
      sourceKey: "notes/a.md",
      title: "a",
      tokens,
      wpm: 300,
    };

    await runner.loadSession(lastPayload);

    expect(resolveReaderKeyAction(" ")).toBe("toggle-play-pause");
    runner.play();
    expect(runner.getSnapshot().state).toBe("PLAYING");

    await runner.pause();
    expect(runner.getSnapshot().state).toBe("PAUSED");

    runner.resume();
    scheduler.runNext();
    await Promise.resolve();
    scheduler.runNext();
    await Promise.resolve();
    expect(runner.getSnapshot().state).toBe("COMPLETE");

    const replayPayload = buildReplaySessionPayload(lastPayload, 420);
    await runner.loadSession(replayPayload);
    runner.play();

    const snapshot = runner.getSnapshot();
    expect(snapshot.currentIndex).toBe(0);
    expect(snapshot.wpm).toBe(420);
    expect(snapshot.state).toBe("PLAYING");
  });

  it("does not handle shortcuts while modifier keys are active", () => {
    expect(
      shouldHandleReaderKeyEvent({
        targetTagName: "DIV",
        isContentEditable: false,
        metaKey: true,
      }),
    ).toBe(false);
  });
});
