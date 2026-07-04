import { describe, expect, it, vi } from "vitest";
import { Notice } from "obsidian";

import VaultReaderPlugin from "../../src/main";
import { VAULT_READER_VIEW_RUNTIME_ID, VAULT_READER_VIEW_TYPE } from "../../src/reader/reader-view";

function createThrowingApp() {
  return {
    workspace: {
      activeEditor: null,
      getActiveFile: () => {
        throw new Error("workspace detached");
      },
      getLeavesOfType: () => [],
      getLeaf: () => ({
        setViewState: async () => undefined,
        view: {},
      }),
      revealLeaf: async () => undefined,
      detachLeavesOfType: () => undefined,
    },
    vault: {
      getFileByPath: () => null,
      cachedRead: async () => "",
    },
  };
}

describe("start session command", () => {
  it("handles unexpected failures without rejecting the command callback", async () => {
    const TestNotice = Notice as unknown as { reset: () => void; messages: string[] };
    TestNotice.reset();

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = createThrowingApp();
    await plugin.onload();

    const command = (
      plugin as unknown as {
        commands: Array<{ id: string; callback: () => Promise<void> }>;
      }
    ).commands.find((candidate) => candidate.id === "start-session");

    expect(command).toBeDefined();
    if (!command) {
      return;
    }

    await expect(command.callback()).resolves.toBeUndefined();
    expect(TestNotice.messages.at(-1)).toContain("workspace detached");
  });

  it("opens the reader in a right split by default", async () => {
    const setViewState = vi.fn(async (state?: unknown) => {
      void state;
      return undefined;
    });
    const getLeaf = vi.fn(() => ({
      setViewState,
      view: {},
    }));

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        getLeavesOfType: () => [],
        getLeaf,
      },
    };

    await plugin.onload();
    await (plugin as unknown as { resolveReaderLeaf: () => Promise<unknown> }).resolveReaderLeaf();

    expect(getLeaf).toHaveBeenCalledWith("split", "vertical");
    expect(setViewState).toHaveBeenCalledTimes(1);
  });

  it("uses tab mode when persisted presentationMode is tab", async () => {
    const setViewState = vi.fn(async (state?: unknown) => {
      void state;
      return undefined;
    });
    const getLeaf = vi.fn(() => ({
      setViewState,
      view: {},
    }));

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        getLeavesOfType: () => [],
        getLeaf,
      },
    };
    (plugin as unknown as { loadData: () => Promise<unknown> }).loadData = async () => ({
      settings: {
        presentationMode: "tab",
      },
    });

    await plugin.onload();
    await (plugin as unknown as { resolveReaderLeaf: () => Promise<unknown> }).resolveReaderLeaf();

    expect(getLeaf).toHaveBeenCalledWith(true);
    expect(setViewState).toHaveBeenCalledTimes(1);
  });

  it("reuses existing reader leaf on repeated activation without creating duplicates", async () => {
    const setViewState = vi.fn(async (state?: unknown) => {
      void state;
      return undefined;
    });
    const createdLeaf = {
      setViewState: async (state: unknown) => {
        await setViewState(state);
        if (readerLeaves.length === 0) {
          readerLeaves.push(createdLeaf);
        }
      },
      view: {},
    };
    const readerLeaves: unknown[] = [];
    const getLeaf = vi.fn(() => createdLeaf);

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        getLeavesOfType: () => readerLeaves,
        getLeaf,
      },
    };

    await plugin.onload();
    await (plugin as unknown as { resolveReaderLeaf: () => Promise<unknown> }).resolveReaderLeaf();
    await (plugin as unknown as { resolveReaderLeaf: () => Promise<unknown> }).resolveReaderLeaf();

    expect(getLeaf).toHaveBeenCalledTimes(1);
    expect(setViewState).toHaveBeenCalledTimes(2);
  });

  it("recreates stale reader leaves from a previous plugin runtime before starting a session", async () => {
    const TestNotice = Notice as unknown as { reset: () => void; messages: string[] };
    TestNotice.reset();
    const setSession = vi.fn(async () => undefined);
    const staleLeaf = {
      setViewState: vi.fn(async () => undefined),
      view: {},
    };
    const freshLeaf = {
      setViewState: vi.fn(async () => {
        freshLeaf.view = {
          vaultReaderRuntimeId: VAULT_READER_VIEW_RUNTIME_ID,
          setSession,
        };
      }),
      view: {},
    };
    let readerLeaves: unknown[] = [staleLeaf];
    const detachLeavesOfType = vi.fn((viewType: string) => {
      if (viewType === VAULT_READER_VIEW_TYPE) {
        readerLeaves = [];
      }
    });

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        activeEditor: null,
        getActiveFile: () => ({
          path: "notes/source.md",
          name: "source.md",
          basename: "source",
        }),
        getLeavesOfType: () => readerLeaves,
        getLeaf: () => freshLeaf,
        revealLeaf: async () => undefined,
        detachLeavesOfType,
      },
      vault: {
        getFileByPath: () => ({
          path: "notes/source.md",
        }),
        cachedRead: async () => "One two three",
      },
    };

    await plugin.onload();
    const command = (
      plugin as unknown as {
        commands: Array<{ id: string; callback: () => Promise<void> }>;
      }
    ).commands.find((candidate) => candidate.id === "start-session");
    expect(command).toBeDefined();
    if (!command) {
      return;
    }

    await command.callback();

    expect(detachLeavesOfType).toHaveBeenCalledWith(VAULT_READER_VIEW_TYPE);
    expect(freshLeaf.setViewState).toHaveBeenCalledWith({
      type: VAULT_READER_VIEW_TYPE,
      active: true,
    });
    expect(setSession).toHaveBeenCalledTimes(1);
  });

  it("binds source highlighting to the note editor before the reader pane takes focus", async () => {
    const TestNotice = Notice as unknown as { reset: () => void; messages: string[] };
    TestNotice.reset();
    const sourceDispatch = vi.fn();
    const readerDispatch = vi.fn();
    let activeEditor = {
      editor: {
        cm: {
          state: {
            field: vi.fn(() => ({})),
          },
          dispatch: sourceDispatch,
        },
        getSelection: () => "",
      },
    };
    interface CapturedSessionPayload {
      sourceHighlighter?: {
        apply: (range: { from: number; to: number }) => void;
        clear: () => void;
      };
    }

    let capturedPayload: CapturedSessionPayload | null = null;

    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        get activeEditor() {
          return activeEditor;
        },
        getActiveFile: () => ({
          path: "notes/source.md",
          name: "source.md",
          basename: "source",
        }),
        getLeavesOfType: () => [],
        getLeaf: () => ({
          setViewState: async () => undefined,
          view: {},
        }),
        revealLeaf: async () => undefined,
        detachLeavesOfType: () => undefined,
      },
      vault: {
        getFileByPath: () => ({
          path: "notes/source.md",
        }),
        cachedRead: async () => "One two three",
      },
    };
    (plugin as unknown as { activateReaderView: () => Promise<unknown> }).activateReaderView =
      async () => {
        activeEditor = {
          editor: {
            cm: {
              state: {
                field: vi.fn(() => ({})),
              },
              dispatch: readerDispatch,
            },
            getSelection: () => "",
          },
        };
        return {
          vaultReaderRuntimeId: VAULT_READER_VIEW_RUNTIME_ID,
          setSession: async (payload: unknown) => {
            capturedPayload = payload as CapturedSessionPayload;
          },
        };
      };

    await plugin.onload();
    const command = (
      plugin as unknown as {
        commands: Array<{ id: string; callback: () => Promise<void> }>;
      }
    ).commands.find((candidate) => candidate.id === "start-session");
    expect(command).toBeDefined();
    if (!command) {
      return;
    }

    await command.callback();
    const payload = capturedPayload as CapturedSessionPayload | null;
    expect(payload?.sourceHighlighter).toBeDefined();
    payload?.sourceHighlighter?.apply({ from: 0, to: 3 });

    expect(sourceDispatch).toHaveBeenCalledTimes(1);
    expect(readerDispatch).not.toHaveBeenCalled();
  });
});
