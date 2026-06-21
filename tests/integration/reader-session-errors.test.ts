import { describe, expect, it } from "vitest";

import { ReaderController, type ReadingPositionStore } from "../../src/reader/reader-controller";
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

function createFailingPositionStore(): ReadingPositionStore {
  return {
    load: () => null,
    save: async () => {
      throw new Error("save failed");
    },
  };
}

describe("Reader error handling", () => {
  it("transitions to ERROR when pause persistence fails", async () => {
    const controller = new ReaderController({
      defaultWpm: 300,
      positionStore: createFailingPositionStore(),
    });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();

    const snapshot = await controller.pause();
    expect(snapshot.state).toBe("ERROR");
    expect(snapshot.errorMessage).toContain("save reading progress");
  });

  it("transitions to ERROR when stop persistence fails", async () => {
    const controller = new ReaderController({
      defaultWpm: 300,
      positionStore: createFailingPositionStore(),
    });
    const tokens = tokenizeReadingText("One two three");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();

    const snapshot = await controller.stop();
    expect(snapshot.state).toBe("ERROR");
    expect(snapshot.errorMessage).toContain("save reading progress");
  });

  it("transitions to ERROR when completion persistence fails", async () => {
    const controller = new ReaderController({
      defaultWpm: 300,
      positionStore: createFailingPositionStore(),
    });
    const tokens = tokenizeReadingText("One.");

    await controller.loadSession({ sourceKey: "notes/a.md", tokens });
    controller.play();

    const snapshot = await controller.advance();
    expect(snapshot.state).toBe("ERROR");
    expect(snapshot.errorMessage).toContain("save reading progress");
  });

  it("keeps runner stable when timed completion persistence fails", async () => {
    const scheduler = createManualScheduler();
    const controller = new ReaderController({
      defaultWpm: 300,
      positionStore: createFailingPositionStore(),
    });
    const runner = new ReaderSessionRunner(controller, { scheduler });
    const tokens = tokenizeReadingText("One two");

    await runner.loadSession({ sourceKey: "notes/a.md", tokens });
    runner.play();

    scheduler.runNext();
    await Promise.resolve();
    expect(runner.getSnapshot().state).toBe("PLAYING");

    scheduler.runNext();
    await Promise.resolve();
    await Promise.resolve();

    const snapshot = runner.getSnapshot();
    expect(snapshot.state).toBe("ERROR");
    expect(scheduler.tasks.size).toBe(0);
  });

  it("emits onError once for an error state even if stop() is called afterward", async () => {
    const scheduler = createManualScheduler();
    const errors: Array<{ code: string; message: string }> = [];
    const controller = new ReaderController({
      defaultWpm: 300,
      positionStore: createFailingPositionStore(),
    });
    const runner = new ReaderSessionRunner(controller, {
      scheduler,
      onError: (error) => {
        errors.push({
          code: error.code,
          message: error.message,
        });
      },
    });
    const tokens = tokenizeReadingText("One two");

    await runner.loadSession({ sourceKey: "notes/a.md", tokens });
    runner.play();
    await runner.pause();

    expect(runner.getSnapshot().state).toBe("ERROR");
    expect(errors).toHaveLength(1);
    expect(errors[0]?.code).toBe("SESSION_STATE_ERROR");

    await runner.stop();
    expect(runner.getSnapshot().state).toBe("ERROR");
    expect(errors).toHaveLength(1);
  });
});
