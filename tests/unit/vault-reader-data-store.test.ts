import { describe, expect, it } from "vitest";

import { VaultReaderDataStore } from "../../src/settings/vault-reader-data-store";

describe("VaultReaderDataStore", () => {
  it("defaults to split-right presentation mode and blue accent theme", async () => {
    const adapter = {
      loadData: async () => null,
      saveData: async () => undefined,
    };

    const dataStore = new VaultReaderDataStore(adapter);
    const snapshot = await dataStore.load();

    expect(snapshot.settings.presentationMode).toBe("split-right");
    expect(snapshot.settings.accentTheme).toBe("blue");
    expect(snapshot.settings.panelZoom).toBe(100);
    expect(snapshot.settings.inNoteHighlightEnabled).toBe(false);
    expect(snapshot.settings.inNoteHighlightColor).toBe("yellow");
    expect(snapshot.settings.onboardingDismissed).toBe(false);
  });

  it("falls back to safe defaults for invalid presentation and accent values", async () => {
    const adapter = {
      loadData: async () => ({
        settings: {
          presentationMode: "floating",
          accentTheme: "hot-pink",
          inNoteHighlightColor: "neon",
          onboardingDismissed: "yes please",
        },
      }),
      saveData: async () => undefined,
    };

    const dataStore = new VaultReaderDataStore(adapter);
    const snapshot = await dataStore.load();

    expect(snapshot.settings.presentationMode).toBe("split-right");
    expect(snapshot.settings.accentTheme).toBe("blue");
    expect(snapshot.settings.panelZoom).toBe(100);
    expect(snapshot.settings.inNoteHighlightEnabled).toBe(false);
    expect(snapshot.settings.inNoteHighlightColor).toBe("yellow");
    expect(snapshot.settings.onboardingDismissed).toBe(false);
  });

  it("normalizes onboarding dismissal to an explicit boolean", async () => {
    const adapter = {
      loadData: async () => ({
        settings: {
          onboardingDismissed: true,
        },
      }),
      saveData: async () => undefined,
    };

    const dataStore = new VaultReaderDataStore(adapter);
    const snapshot = await dataStore.load();

    expect(snapshot.settings.onboardingDismissed).toBe(true);
  });

  it("normalizes in-note highlight settings to an explicit boolean", async () => {
    const adapter = {
      loadData: async () => ({
        settings: {
          inNoteHighlightEnabled: true,
        },
      }),
      saveData: async () => undefined,
    };

    const dataStore = new VaultReaderDataStore(adapter);
    const snapshot = await dataStore.load();

    expect(snapshot.settings.inNoteHighlightEnabled).toBe(true);
  });

  it("normalizes in-note highlight color to a supported palette value", async () => {
    const adapter = {
      loadData: async () => ({
        settings: {
          inNoteHighlightColor: "orange",
        },
      }),
      saveData: async () => undefined,
    };

    const dataStore = new VaultReaderDataStore(adapter);
    const snapshot = await dataStore.load();

    expect(snapshot.settings.inNoteHighlightColor).toBe("orange");
  });

  it("does not mutate in-memory snapshot when saveData fails", async () => {
    const adapter = {
      loadData: async () => null,
      saveData: async () => {
        throw new Error("disk full");
      },
    };

    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();

    await expect(
      dataStore.update((draft) => {
        draft.settings.defaultWpm = 480;
      }),
    ).rejects.toThrow("disk full");

    const snapshot = dataStore.getSnapshot();
    expect(snapshot.settings.defaultWpm).toBe(300);
  });

  it("continues to accept writes after a failed save without carrying failed mutations", async () => {
    let shouldFail = true;
    const adapter = {
      loadData: async () => null,
      saveData: async () => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error("disk full");
        }
      },
    };

    const dataStore = new VaultReaderDataStore(adapter);
    await dataStore.load();

    await expect(
      dataStore.update((draft) => {
        draft.settings.defaultWpm = 500;
      }),
    ).rejects.toThrow("disk full");

    await dataStore.update((draft) => {
      draft.settings.defaultWpm = 420;
    });

    const snapshot = dataStore.getSnapshot();
    expect(snapshot.settings.defaultWpm).toBe(420);
  });
});
