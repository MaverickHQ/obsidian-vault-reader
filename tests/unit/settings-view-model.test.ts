import { describe, expect, it } from "vitest";

import {
  createSettingsViewModel,
  createSettingsPatch,
} from "../../src/settings/settings-view-model";
import type { VaultReaderSettings } from "../../src/settings/vault-reader-data-store";

const baseSettings: VaultReaderSettings = {
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

describe("settings view model", () => {
  it("exposes public default controls with human-readable labels", () => {
    const viewModel = createSettingsViewModel(baseSettings);

    expect(viewModel.controls.map((control) => control.id)).toEqual([
      "defaultWpm",
      "orpEnabled",
      "presentationMode",
      "accentTheme",
      "typographyScale",
      "panelZoom",
      "inNoteHighlightEnabled",
      "inNoteHighlightColor",
    ]);
    expect(viewModel.controls.map((control) => control.label)).toEqual([
      "Default reading speed",
      "Show focus letter",
      "Open reader in",
      "Accent colour",
      "Default text size",
      "Default panel zoom",
      "Highlight current word in note",
      "Highlight colour",
    ]);
    expect(viewModel.controls.every((control) => control.description.length > 12)).toBe(true);
  });

  it("creates validated patches for settings updates", () => {
    expect(createSettingsPatch("defaultWpm", 1_000)).toEqual({ defaultWpm: 600 });
    expect(createSettingsPatch("typographyScale", 20)).toEqual({ typographyScale: 70 });
    expect(createSettingsPatch("panelZoom", 300)).toEqual({ panelZoom: 140 });
    expect(createSettingsPatch("orpEnabled", false)).toEqual({ orpEnabled: false });
    expect(createSettingsPatch("presentationMode", "tab")).toEqual({ presentationMode: "tab" });
    expect(createSettingsPatch("presentationMode", "floating")).toEqual({
      presentationMode: "split-right",
    });
    expect(createSettingsPatch("accentTheme", "claude-orange")).toEqual({
      accentTheme: "claude-orange",
    });
    expect(createSettingsPatch("accentTheme", "purple")).toEqual({ accentTheme: "blue" });
    expect(createSettingsPatch("inNoteHighlightEnabled", true)).toEqual({
      inNoteHighlightEnabled: true,
    });
    expect(createSettingsPatch("inNoteHighlightColor", "blue")).toEqual({
      inNoteHighlightColor: "blue",
    });
    expect(createSettingsPatch("inNoteHighlightColor", "red")).toEqual({
      inNoteHighlightColor: "yellow",
    });
  });
});
