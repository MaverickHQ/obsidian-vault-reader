import {
  DEFAULT_VAULT_READER_SETTINGS,
  type ReaderAccentTheme,
  type ReaderInNoteHighlightColor,
  type ReaderPresentationMode,
  type VaultReaderSettings,
} from "./vault-reader-data-store";

export type SettingsControlId = keyof VaultReaderSettings;

export type SettingsControl =
  | {
      id: SettingsControlId;
      kind: "number";
      label: string;
      description: string;
      value: number;
      min: number;
      max: number;
      step: number;
      unit: string;
    }
  | {
      id: SettingsControlId;
      kind: "toggle";
      label: string;
      description: string;
      value: boolean;
    }
  | {
      id: SettingsControlId;
      kind: "select";
      label: string;
      description: string;
      value: string;
      options: Array<{ value: string; label: string }>;
    };

export interface SettingsViewModel {
  controls: SettingsControl[];
}

export function createSettingsViewModel(settings: VaultReaderSettings): SettingsViewModel {
  return {
    controls: [
      {
        id: "defaultWpm",
        kind: "number",
        label: "Default reading speed",
        description: "Words per minute used when a new reader session starts.",
        value: settings.defaultWpm,
        min: 100,
        max: 600,
        step: 10,
        unit: "WPM",
      },
      {
        id: "orpEnabled",
        kind: "toggle",
        label: "Show focus letter",
        description: "Highlights the optimal recognition point inside each displayed word.",
        value: settings.orpEnabled,
      },
      {
        id: "presentationMode",
        kind: "select",
        label: "Open reader in",
        description: "Choose whether Vault Reader opens beside the note or in a normal tab.",
        value: settings.presentationMode,
        options: [
          { value: "split-right", label: "Right split panel" },
          { value: "tab", label: "New tab" },
        ],
      },
      {
        id: "accentTheme",
        kind: "select",
        label: "Accent colour",
        description: "Controls the reader panel accent used for focus and controls.",
        value: settings.accentTheme,
        options: [
          { value: "blue", label: "Blue" },
          { value: "claude-orange", label: "Claude orange" },
        ],
      },
      {
        id: "typographyScale",
        kind: "number",
        label: "Default text size",
        description: "Default reader word size as a percentage of the base display.",
        value: settings.typographyScale,
        min: 70,
        max: 200,
        step: 5,
        unit: "%",
      },
      {
        id: "panelZoom",
        kind: "number",
        label: "Default panel zoom",
        description: "Default scale for the whole reader panel and its controls.",
        value: settings.panelZoom,
        min: 80,
        max: 140,
        step: 5,
        unit: "%",
      },
      {
        id: "inNoteHighlightEnabled",
        kind: "toggle",
        label: "Highlight current word in note",
        description: "Attempts to highlight the active word in the source note while reading.",
        value: settings.inNoteHighlightEnabled,
      },
      {
        id: "inNoteHighlightColor",
        kind: "select",
        label: "Highlight colour",
        description: "Default colour for the active word highlight inside the note.",
        value: settings.inNoteHighlightColor,
        options: [
          { value: "yellow", label: "Yellow" },
          { value: "orange", label: "Orange" },
          { value: "blue", label: "Blue" },
        ],
      },
    ],
  };
}

export function createSettingsPatch(
  id: SettingsControlId,
  value: unknown,
): Partial<VaultReaderSettings> {
  switch (id) {
    case "defaultWpm":
      return { defaultWpm: clampNumber(value, 100, 600, DEFAULT_VAULT_READER_SETTINGS.defaultWpm) };
    case "typographyScale":
      return {
        typographyScale: clampNumber(value, 70, 200, DEFAULT_VAULT_READER_SETTINGS.typographyScale),
      };
    case "panelZoom":
      return { panelZoom: clampNumber(value, 80, 140, DEFAULT_VAULT_READER_SETTINGS.panelZoom) };
    case "orpEnabled":
      return { orpEnabled: value === true };
    case "inNoteHighlightEnabled":
      return { inNoteHighlightEnabled: value === true };
    case "onboardingDismissed":
      return { onboardingDismissed: value === true };
    case "presentationMode":
      return { presentationMode: toPresentationMode(value) };
    case "accentTheme":
      return { accentTheme: toAccentTheme(value) };
    case "inNoteHighlightColor":
      return { inNoteHighlightColor: toHighlightColor(value) };
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numericValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.round(numericValue)));
}

function toPresentationMode(value: unknown): ReaderPresentationMode {
  return value === "tab" || value === "split-right"
    ? value
    : DEFAULT_VAULT_READER_SETTINGS.presentationMode;
}

function toAccentTheme(value: unknown): ReaderAccentTheme {
  return value === "blue" || value === "claude-orange"
    ? value
    : DEFAULT_VAULT_READER_SETTINGS.accentTheme;
}

function toHighlightColor(value: unknown): ReaderInNoteHighlightColor {
  return value === "yellow" || value === "orange" || value === "blue"
    ? value
    : DEFAULT_VAULT_READER_SETTINGS.inNoteHighlightColor;
}
