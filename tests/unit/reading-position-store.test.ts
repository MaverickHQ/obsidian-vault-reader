import { describe, expect, it } from "vitest";

import { PersistentReadingPositionStore } from "../../src/settings/reading-position-store";
import { VaultReaderDataStore } from "../../src/settings/vault-reader-data-store";

function createAdapter(seed: unknown = null): {
  loadData: () => Promise<unknown>;
  saveData: (data: unknown) => Promise<void>;
  saves: unknown[];
} {
  const saves: unknown[] = [];

  return {
    loadData: async () => seed,
    saveData: async (data: unknown) => {
      saves.push(data);
    },
    saves,
  };
}

describe("PersistentReadingPositionStore", () => {
  it("returns null when no position is stored for a source", async () => {
    const adapter = createAdapter();
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const positionStore = new PersistentReadingPositionStore(dataStore);

    expect(await positionStore.load("notes/a.md")).toBeNull();
  });

  it("persists and reads per-note positions", async () => {
    const adapter = createAdapter();
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const positionStore = new PersistentReadingPositionStore(dataStore);

    await positionStore.save("notes/a.md", 8);
    await positionStore.save("notes/b.md", 3);

    expect(await positionStore.load("notes/a.md")).toBe(8);
    expect(await positionStore.load("notes/b.md")).toBe(3);
    expect(adapter.saves.length).toBe(2);
  });

  it("normalizes negative and non-integer token indexes", async () => {
    const adapter = createAdapter();
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const positionStore = new PersistentReadingPositionStore(dataStore);

    await positionStore.save("notes/a.md", -20);
    expect(await positionStore.load("notes/a.md")).toBe(0);

    await positionStore.save("notes/a.md", 7.9);
    expect(await positionStore.load("notes/a.md")).toBe(7);
  });

  it("does not expose failed position updates as persisted state", async () => {
    const adapter = {
      loadData: async () => null,
      saveData: async () => {
        throw new Error("write failed");
      },
    };
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const positionStore = new PersistentReadingPositionStore(dataStore);

    await expect(positionStore.save("notes/a.md", 10)).rejects.toThrow("write failed");
    expect(await positionStore.load("notes/a.md")).toBeNull();
  });
});
