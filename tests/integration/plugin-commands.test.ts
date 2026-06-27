import { Notice } from "obsidian";
import { beforeEach, describe, expect, it, vi } from "vitest";

import VaultReaderPlugin from "../../src/main";
import { VAULT_READER_VIEW_RUNTIME_ID, VAULT_READER_VIEW_TYPE } from "../../src/reader/reader-view";

type RegisteredCommand = {
  id: string;
  name: string;
  callback: () => void | Promise<void>;
};

const NoticeMock = Notice as unknown as {
  messages: string[];
  reset: () => void;
};

function createReaderLeaf(view: unknown) {
  return {
    view,
    setViewState: vi.fn(async () => undefined),
  };
}

async function createLoadedPluginWithWorkspace(workspace: unknown): Promise<VaultReaderPlugin> {
  const plugin = new VaultReaderPlugin({} as never, {} as never);
  (plugin as unknown as { app: unknown }).app = {
    workspace,
  };

  await plugin.onload();
  return plugin;
}

function findCommand(plugin: VaultReaderPlugin, id: string): RegisteredCommand {
  const command = (plugin as unknown as { commands: RegisteredCommand[] }).commands.find(
    (candidate) => candidate.id === id,
  );
  if (!command) {
    throw new Error(`Command not found: ${id}`);
  }
  return command;
}

describe("Vault Reader command palette polish", () => {
  beforeEach(() => {
    NoticeMock.reset();
  });

  it("registers stable public command names for start, restart, and play/pause", async () => {
    const plugin = await createLoadedPluginWithWorkspace({
      detachLeavesOfType: vi.fn(),
      getLeavesOfType: vi.fn(() => []),
    });

    const commands = (plugin as unknown as { commands: RegisteredCommand[] }).commands;

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "vault-reader-start-session",
          name: "Vault Reader: Start reading current note",
        }),
        expect.objectContaining({
          id: "vault-reader-restart-current-note",
          name: "Vault Reader: Restart current note from beginning",
        }),
        expect.objectContaining({
          id: "vault-reader-toggle-play-pause",
          name: "Vault Reader: Toggle play/pause",
        }),
      ]),
    );
  });

  it("routes restart command through the active reader view action", async () => {
    const restartCurrentSession = vi.fn(async () => true);
    const leaf = createReaderLeaf({
      vaultReaderRuntimeId: VAULT_READER_VIEW_RUNTIME_ID,
      setSession: vi.fn(),
      restartCurrentSession,
      togglePlayPause: vi.fn(),
    });
    const plugin = await createLoadedPluginWithWorkspace({
      detachLeavesOfType: vi.fn(),
      getLeavesOfType: vi.fn((viewType: string) =>
        viewType === VAULT_READER_VIEW_TYPE ? [leaf] : [],
      ),
    });

    await findCommand(plugin, "vault-reader-restart-current-note").callback();

    expect(restartCurrentSession).toHaveBeenCalledTimes(1);
    expect(NoticeMock.messages).toEqual([]);
  });

  it("shows a helpful notice when restart has no active reader session", async () => {
    const plugin = await createLoadedPluginWithWorkspace({
      detachLeavesOfType: vi.fn(),
      getLeavesOfType: vi.fn(() => []),
    });

    await findCommand(plugin, "vault-reader-restart-current-note").callback();

    expect(NoticeMock.messages).toContain(
      "Open Vault Reader from a note before using the restart command.",
    );
  });

  it("routes play/pause command through the active reader view action", async () => {
    const togglePlayPause = vi.fn(async () => true);
    const leaf = createReaderLeaf({
      vaultReaderRuntimeId: VAULT_READER_VIEW_RUNTIME_ID,
      setSession: vi.fn(),
      restartCurrentSession: vi.fn(),
      togglePlayPause,
    });
    const plugin = await createLoadedPluginWithWorkspace({
      detachLeavesOfType: vi.fn(),
      getLeavesOfType: vi.fn((viewType: string) =>
        viewType === VAULT_READER_VIEW_TYPE ? [leaf] : [],
      ),
    });

    await findCommand(plugin, "vault-reader-toggle-play-pause").callback();

    expect(togglePlayPause).toHaveBeenCalledTimes(1);
    expect(NoticeMock.messages).toEqual([]);
  });
});
