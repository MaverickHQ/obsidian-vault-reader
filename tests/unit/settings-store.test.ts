import { describe, expect, it } from "vitest";

import { PersistentReadingPositionStore } from "../../src/settings/reading-position-store";
import { VaultReaderSettingsStore } from "../../src/settings/settings-store";
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

describe("VaultReaderSettingsStore", () => {
  it("loads defaults when persisted data is missing or invalid", async () => {
    const adapter = createAdapter({
      settings: {
        defaultWpm: "invalid",
        orpEnabled: "invalid",
      },
    });

    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);

    expect(settingsStore.get()).toEqual({
      defaultWpm: 300,
      orpEnabled: true,
      typographyScale: 100,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: false,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    });
  });

  it("persists default WPM, ORP toggle, and typography scale", async () => {
    const adapter = createAdapter();
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);

    const updated = await settingsStore.update({
      defaultWpm: 420,
      orpEnabled: false,
      typographyScale: 120,
      panelZoom: 135,
      presentationMode: "tab",
      accentTheme: "claude-orange",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "orange",
      onboardingDismissed: true,
    });

    expect(updated).toEqual({
      defaultWpm: 420,
      orpEnabled: false,
      typographyScale: 120,
      panelZoom: 135,
      presentationMode: "tab",
      accentTheme: "claude-orange",
      inNoteHighlightEnabled: true,
      inNoteHighlightColor: "orange",
      onboardingDismissed: true,
    });
    expect(adapter.saves.length).toBe(1);
  });

  it("keeps existing settings values when partial payload omits new Phase 2 fields", async () => {
    const adapter = createAdapter({
      settings: {
        defaultWpm: 360,
        orpEnabled: false,
        typographyScale: 110,
      },
      readingPositions: {
        "notes/a.md": 9,
      },
    });

    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);

    expect(settingsStore.get()).toEqual({
      defaultWpm: 360,
      orpEnabled: false,
      typographyScale: 110,
      panelZoom: 100,
      presentationMode: "split-right",
      accentTheme: "blue",
      inNoteHighlightEnabled: false,
      inNoteHighlightColor: "yellow",
      onboardingDismissed: false,
    });
  });

  it("clamps persisted values to safe ranges", async () => {
    const adapter = createAdapter();
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);

    const updated = await settingsStore.update({
      defaultWpm: 10_000,
      typographyScale: 5,
      panelZoom: 1_000,
    });

    expect(updated.defaultWpm).toBe(600);
    expect(updated.typographyScale).toBe(70);
    expect(updated.panelZoom).toBe(140);
  });

  it("preserves both settings and positions when async saves resolve out of order", async () => {
    const persistedSnapshots: unknown[] = [];
    let invocationCount = 0;
    const adapter = {
      loadData: async () => null,
      saveData: async (data: unknown) => {
        const saveIndex = invocationCount++;
        const delayMs = saveIndex === 0 ? 30 : 0;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        persistedSnapshots.push(data);
      },
    };

    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);
    const positionStore = new PersistentReadingPositionStore(dataStore);

    const firstWrite = settingsStore.update({
      defaultWpm: 410,
    });
    const secondWrite = positionStore.save("notes/a.md", 7);
    await Promise.all([firstWrite, secondWrite]);

    const snapshot = dataStore.getSnapshot();
    expect(snapshot.settings.defaultWpm).toBe(410);
    expect(snapshot.readingPositions["notes/a.md"]).toBe(7);

    const lastPersisted = persistedSnapshots[persistedSnapshots.length - 1] as {
      settings?: { defaultWpm?: number };
      readingPositions?: Record<string, number>;
    };
    expect(lastPersisted.settings?.defaultWpm).toBe(410);
    expect(lastPersisted.readingPositions?.["notes/a.md"]).toBe(7);
  });

  it("does not expose failed settings updates as persisted state", async () => {
    const adapter = {
      loadData: async () => null,
      saveData: async () => {
        throw new Error("write failed");
      },
    };
    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();
    const settingsStore = new VaultReaderSettingsStore(dataStore);

    await expect(
      settingsStore.update({
        defaultWpm: 550,
      }),
    ).rejects.toThrow("write failed");

    expect(settingsStore.get().defaultWpm).toBe(300);
  });
});
