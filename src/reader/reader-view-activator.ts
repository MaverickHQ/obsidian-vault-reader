import type { WorkspaceLeaf } from "obsidian";

import type { ReaderPresentationMode } from "../settings/vault-reader-data-store";
import type { VaultReaderSessionView } from "./reader-view";

export interface ReaderViewLeaf {
  setViewState: WorkspaceLeaf["setViewState"];
  view: unknown;
}

export interface ReaderViewWorkspace {
  getLeavesOfType: (viewType: string) => ReaderViewLeaf[];
  getLeaf: {
    (type: "split", direction: "vertical" | "horizontal"): ReaderViewLeaf | null;
    (newLeaf?: boolean): ReaderViewLeaf | null;
  };
  revealLeaf?: (leaf: ReaderViewLeaf) => Promise<void> | void;
  detachLeavesOfType?: (viewType: string) => void;
}

export interface ReaderLeafActivationInput {
  workspace: ReaderViewWorkspace;
  viewType: string;
  presentationMode: ReaderPresentationMode;
}

export interface ReaderViewActivationInput extends ReaderLeafActivationInput {
  runtimeId: string;
}

export async function activateReaderView(
  input: ReaderViewActivationInput,
): Promise<VaultReaderSessionView | null> {
  const leaf = await resolveReaderLeaf(input);
  if (!leaf) {
    return null;
  }

  await input.workspace.revealLeaf?.(leaf);
  const view = getCurrentReaderSessionView(leaf, input.runtimeId);
  if (view) {
    return view;
  }

  input.workspace.detachLeavesOfType?.(input.viewType);
  const freshLeaf = createLeafForPresentationMode(input.workspace, input.presentationMode);
  if (!freshLeaf) {
    return null;
  }

  await freshLeaf.setViewState({
    type: input.viewType,
    active: true,
  });
  await input.workspace.revealLeaf?.(freshLeaf);
  return getCurrentReaderSessionView(freshLeaf, input.runtimeId);
}

export async function resolveReaderLeaf(
  input: ReaderLeafActivationInput,
): Promise<ReaderViewLeaf | null> {
  const existingLeaf = input.workspace.getLeavesOfType(input.viewType)[0];
  const targetLeaf =
    existingLeaf ?? createLeafForPresentationMode(input.workspace, input.presentationMode);
  if (!targetLeaf) {
    return null;
  }

  await targetLeaf.setViewState({
    type: input.viewType,
    active: true,
  });

  return targetLeaf;
}

export function getCurrentReaderSessionView(
  leaf: ReaderViewLeaf,
  runtimeId: string,
): VaultReaderSessionView | null {
  const view = leaf.view as Partial<VaultReaderSessionView> | null;
  if (view?.vaultReaderRuntimeId !== runtimeId || typeof view.setSession !== "function") {
    return null;
  }

  return view as VaultReaderSessionView;
}

function createLeafForPresentationMode(
  workspace: ReaderViewWorkspace,
  mode: ReaderPresentationMode,
): ReaderViewLeaf | null {
  if (mode === "split-right") {
    return workspace.getLeaf("split", "vertical");
  }

  return workspace.getLeaf(true);
}
