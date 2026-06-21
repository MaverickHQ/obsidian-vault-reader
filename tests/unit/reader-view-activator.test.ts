import { describe, expect, it, vi } from "vitest";

import {
  activateReaderView,
  resolveReaderLeaf,
  type ReaderViewLeaf,
} from "../../src/reader/reader-view-activator";
import { VAULT_READER_VIEW_RUNTIME_ID, VAULT_READER_VIEW_TYPE } from "../../src/reader/reader-view";

describe("reader view activator", () => {
  it("creates a right split leaf for split-right presentation mode", async () => {
    const leaf = {
      setViewState: vi.fn(async () => undefined),
      view: {},
    };
    const getLeaf = vi.fn(() => leaf);

    await resolveReaderLeaf({
      workspace: {
        getLeavesOfType: () => [],
        getLeaf,
      },
      viewType: VAULT_READER_VIEW_TYPE,
      presentationMode: "split-right",
    });

    expect(getLeaf).toHaveBeenCalledWith("split", "vertical");
    expect(leaf.setViewState).toHaveBeenCalledWith({
      type: VAULT_READER_VIEW_TYPE,
      active: true,
    });
  });

  it("detaches stale reader leaves and returns the fresh runtime view", async () => {
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
    let leaves: ReaderViewLeaf[] = [staleLeaf];
    const detachLeavesOfType = vi.fn(() => {
      leaves = [];
    });

    const view = await activateReaderView({
      workspace: {
        getLeavesOfType: () => leaves,
        getLeaf: () => freshLeaf,
        revealLeaf: vi.fn(async () => undefined),
        detachLeavesOfType,
      },
      viewType: VAULT_READER_VIEW_TYPE,
      runtimeId: VAULT_READER_VIEW_RUNTIME_ID,
      presentationMode: "split-right",
    });

    expect(detachLeavesOfType).toHaveBeenCalledWith(VAULT_READER_VIEW_TYPE);
    expect(view).toEqual({
      vaultReaderRuntimeId: VAULT_READER_VIEW_RUNTIME_ID,
      setSession,
    });
  });
});
