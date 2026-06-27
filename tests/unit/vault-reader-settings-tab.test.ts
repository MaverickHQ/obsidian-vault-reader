import { describe, expect, it } from "vitest";
import { Setting } from "obsidian";

import { VaultReaderSettingsTab } from "../../src/settings/vault-reader-settings-tab";
import type { VaultReaderSettings } from "../../src/settings/vault-reader-data-store";

const settings: VaultReaderSettings = {
  defaultWpm: 300,
  orpEnabled: true,
  typographyScale: 100,
  panelZoom: 100,
  presentationMode: "split-right",
  accentTheme: "blue",
  inNoteHighlightEnabled: false,
  inNoteHighlightColor: "yellow",
  onboardingDismissed: false,
};

describe("VaultReaderSettingsTab", () => {
  it("renders discoverable default controls and persists changes through the settings store", async () => {
    const SettingMock = Setting as unknown as {
      reset: () => void;
      created: Array<{
        name: string;
        description: string;
        sliders: Array<{
          limits: [number, number, number] | null;
          value: number | null;
          onChangeCallback: ((value: number) => void) | null;
        }>;
        dropdowns: Array<{
          options: Record<string, string>;
          value: string | null;
          onChangeCallback: ((value: string) => void) | null;
        }>;
      }>;
    };
    SettingMock.reset();
    const updates: Array<Partial<VaultReaderSettings>> = [];
    const tab = new VaultReaderSettingsTab(
      {} as never,
      {} as never,
      {
        get: () => settings,
        update: async (patch) => {
          updates.push(patch);
          return { ...settings, ...patch };
        },
      },
      () => undefined,
    );

    tab.display();

    expect(SettingMock.created.map((setting) => setting.name)).toEqual([
      "Default reading speed",
      "Show focus letter",
      "Open reader in",
      "Accent colour",
      "Default text size",
      "Default panel zoom",
      "Highlight current word in note",
      "Highlight colour",
    ]);
    expect(SettingMock.created.every((setting) => setting.description.length > 12)).toBe(true);
    expect(SettingMock.created[0]?.sliders[0]?.limits).toEqual([100, 600, 10]);
    expect(SettingMock.created[0]?.sliders[0]?.value).toBe(300);
    expect(SettingMock.created[2]?.dropdowns[0]?.options).toEqual({
      "split-right": "Right split panel",
      tab: "New tab",
    });

    SettingMock.created[0]?.sliders[0]?.onChangeCallback?.(1_000);
    SettingMock.created[2]?.dropdowns[0]?.onChangeCallback?.("tab");
    await Promise.resolve();

    expect(updates).toEqual([{ defaultWpm: 600 }, { presentationMode: "tab" }]);
  });
});
