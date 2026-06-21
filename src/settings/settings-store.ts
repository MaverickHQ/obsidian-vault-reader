import { type VaultReaderSettings, type VaultReaderDataStore } from "./vault-reader-data-store";

export interface ReaderSettingsStore {
  get: () => VaultReaderSettings;
  update: (patch: Partial<VaultReaderSettings>) => Promise<VaultReaderSettings>;
}

export class VaultReaderSettingsStore implements ReaderSettingsStore {
  constructor(private readonly dataStore: VaultReaderDataStore) {}

  get(): VaultReaderSettings {
    return this.dataStore.getSnapshot().settings;
  }

  async update(patch: Partial<VaultReaderSettings>): Promise<VaultReaderSettings> {
    const next = await this.dataStore.update((draft) => {
      draft.settings = {
        ...draft.settings,
        ...patch,
      };
    });

    return next.settings;
  }
}
