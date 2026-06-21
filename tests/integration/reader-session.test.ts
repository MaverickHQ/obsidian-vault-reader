import { describe, expect, it } from "vitest";

import { ReaderController } from "../../src/reader/reader-controller";
import {
  ReaderSessionRunner,
  type ReaderSessionScheduler,
} from "../../src/reader/reader-session-runner";
import { tokenizeReadingText } from "../../src/reader/tokenizer";

type TimerTask = {
  delayMs: number;
  callback: () => void;
};

function createManualScheduler(): ReaderSessionScheduler & {
  tasks: Map<number, TimerTask>;
  runNext: () => void;
  clearCount: number;
} {
  let nextId = 1;
  let clearCount = 0;
  const tasks = new Map<number, TimerTask>();

  const scheduler: ReaderSessionScheduler & {
    tasks: Map<number, TimerTask>;
    runNext: () => void;
    clearCount: number;
  } = {
    tasks,
    clearCount,
    setTimer: (callback: () => void, delayMs: number) => {
      const id = nextId++;
      tasks.set(id, { callback, delayMs });
      return id;
    },
    clearTimer: (id: number) => {
      clearCount += 1;
      tasks.delete(id);
      scheduler.clearCount = clearCount;
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

  return scheduler;
}

describe("ReaderSessionRunner", () => {
  it("schedules timed playback and reaches COMPLETE", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const scheduler = createManualScheduler();
    const runner = new ReaderSessionRunner(controller, { scheduler });
    const tokens = tokenizeReadingText("One two");

    await runner.loadSession({ sourceKey: "notes/a.md", tokens });
    runner.play();

    expect(scheduler.tasks.size).toBe(1);
    scheduler.runNext();
    await Promise.resolve();

    expect(runner.getSnapshot().currentIndex).toBe(1);
    expect(scheduler.tasks.size).toBe(1);

    scheduler.runNext();
    await Promise.resolve();

    const snapshot = runner.getSnapshot();
    expect(snapshot.state).toBe("COMPLETE");
    expect(scheduler.tasks.size).toBe(0);
  });

  it("pause() cancels active timer and resume() continues", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const scheduler = createManualScheduler();
    const runner = new ReaderSessionRunner(controller, { scheduler });
    const tokens = tokenizeReadingText("One two three");

    await runner.loadSession({ sourceKey: "notes/a.md", tokens });
    runner.play();

    await runner.pause();
    expect(runner.getSnapshot().state).toBe("PAUSED");
    expect(scheduler.tasks.size).toBe(0);

    runner.resume();
    expect(runner.getSnapshot().state).toBe("PLAYING");
    expect(scheduler.tasks.size).toBe(1);
  });

  it("reschedules current timer when WPM changes during playback", async () => {
    const controller = new ReaderController({ defaultWpm: 300 });
    const scheduler = createManualScheduler();
    const runner = new ReaderSessionRunner(controller, { scheduler });
    const tokens = tokenizeReadingText("One two three");

    await runner.loadSession({ sourceKey: "notes/a.md", tokens });
    runner.play();

    const before = Array.from(scheduler.tasks.values())[0]?.delayMs;
    runner.setWpm(600);
    const after = Array.from(scheduler.tasks.values())[0]?.delayMs;

    expect(before).toBeGreaterThan(after ?? 0);
    expect(scheduler.clearCount).toBeGreaterThan(0);
  });
});
