export type ReaderPresentationMode = "split-right" | "tab";
export type ReaderAccentTheme = "blue" | "claude-orange";
export type ReaderInNoteHighlightColor = "yellow" | "orange" | "blue";

export interface VaultReaderSettings {
  defaultWpm: number;
  orpEnabled: boolean;
  typographyScale: number;
  panelZoom: number;
  presentationMode: ReaderPresentationMode;
  accentTheme: ReaderAccentTheme;
  inNoteHighlightEnabled: boolean;
  inNoteHighlightColor: ReaderInNoteHighlightColor;
  onboardingDismissed: boolean;
}

export interface VaultReaderPluginData {
  settings: VaultReaderSettings;
  readingPositions: Record<string, number>;
}

export interface VaultReaderPluginDataAdapter {
  loadData: () => Promise<unknown>;
  saveData: (data: VaultReaderPluginData) => Promise<void>;
}

export const DEFAULT_VAULT_READER_SETTINGS: VaultReaderSettings = {
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

export const DEFAULT_VAULT_READER_DATA: VaultReaderPluginData = {
  settings: DEFAULT_VAULT_READER_SETTINGS,
  readingPositions: {},
};

export class VaultReaderDataStore {
  private snapshot: VaultReaderPluginData = cloneData(DEFAULT_VAULT_READER_DATA);
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly adapter: VaultReaderPluginDataAdapter) {}

  async load(): Promise<VaultReaderPluginData> {
    const raw = await this.adapter.loadData();
    this.snapshot = normalizeVaultReaderData(raw);
    return this.getSnapshot();
  }

  getSnapshot(): VaultReaderPluginData {
    return cloneData(this.snapshot);
  }

  async update(mutate: (draft: VaultReaderPluginData) => void): Promise<VaultReaderPluginData> {
    const operation = this.writeQueue.then(async () => {
      const draft = this.getSnapshot();
      mutate(draft);
      const nextSnapshot = normalizeVaultReaderData(draft);

      // Atomic commit-on-success semantics: runtime snapshot advances only if persistence succeeds.
      await this.adapter.saveData(nextSnapshot);
      this.snapshot = nextSnapshot;
      return this.getSnapshot();
    });

    this.writeQueue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }
}

export function normalizeVaultReaderData(raw: unknown): VaultReaderPluginData {
  const rawData = isRecord(raw) ? raw : {};
  const rawSettings = isRecord(rawData.settings) ? rawData.settings : {};
  const rawPositions = isRecord(rawData.readingPositions) ? rawData.readingPositions : {};

  const settings: VaultReaderSettings = {
    defaultWpm: clampNumber(
      toNumber(rawSettings.defaultWpm, DEFAULT_VAULT_READER_SETTINGS.defaultWpm),
      100,
      600,
    ),
    orpEnabled: toBoolean(rawSettings.orpEnabled, DEFAULT_VAULT_READER_SETTINGS.orpEnabled),
    typographyScale: clampNumber(
      toNumber(rawSettings.typographyScale, DEFAULT_VAULT_READER_SETTINGS.typographyScale),
      70,
      200,
    ),
    panelZoom: clampNumber(
      toNumber(rawSettings.panelZoom, DEFAULT_VAULT_READER_SETTINGS.panelZoom),
      80,
      140,
    ),
    presentationMode: toPresentationMode(
      rawSettings.presentationMode,
      DEFAULT_VAULT_READER_SETTINGS.presentationMode,
    ),
    accentTheme: toAccentTheme(rawSettings.accentTheme, DEFAULT_VAULT_READER_SETTINGS.accentTheme),
    inNoteHighlightEnabled: toBoolean(
      rawSettings.inNoteHighlightEnabled,
      DEFAULT_VAULT_READER_SETTINGS.inNoteHighlightEnabled,
    ),
    inNoteHighlightColor: toInNoteHighlightColor(
      rawSettings.inNoteHighlightColor,
      DEFAULT_VAULT_READER_SETTINGS.inNoteHighlightColor,
    ),
    onboardingDismissed: toBoolean(
      rawSettings.onboardingDismissed,
      DEFAULT_VAULT_READER_SETTINGS.onboardingDismissed,
    ),
  };

  const readingPositions: Record<string, number> = {};
  for (const [sourceKey, value] of Object.entries(rawPositions)) {
    const normalizedIndex = clampNumber(toNumber(value, 0), 0, Number.MAX_SAFE_INTEGER);
    readingPositions[sourceKey] = normalizedIndex;
  }

  return {
    settings,
    readingPositions,
  };
}

function cloneData(data: VaultReaderPluginData): VaultReaderPluginData {
  return {
    settings: {
      ...data.settings,
    },
    readingPositions: {
      ...data.readingPositions,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function toPresentationMode(
  value: unknown,
  fallback: ReaderPresentationMode,
): ReaderPresentationMode {
  return value === "split-right" || value === "tab" ? value : fallback;
}

function toAccentTheme(value: unknown, fallback: ReaderAccentTheme): ReaderAccentTheme {
  return value === "blue" || value === "claude-orange" ? value : fallback;
}

function toInNoteHighlightColor(
  value: unknown,
  fallback: ReaderInNoteHighlightColor,
): ReaderInNoteHighlightColor {
  return value === "yellow" || value === "orange" || value === "blue" ? value : fallback;
}

function clampNumber(value: number, min: number, max: number): number {
  const rounded = Math.round(value);
  return Math.min(max, Math.max(min, rounded));
}
