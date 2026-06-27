import type { ReadingPositionStore } from "../reader/reader-controller";
import { type VaultReaderDataStore } from "./vault-reader-data-store";

export class PersistentReadingPositionStore implements ReadingPositionStore {
  constructor(private readonly dataStore: VaultReaderDataStore) {}

  async load(sourceKey: string): Promise<number | null> {
    const index = this.dataStore.getSnapshot().readingPositions[sourceKey];
    return typeof index === "number" ? index : null;
  }

  async save(sourceKey: string, tokenIndex: number): Promise<void> {
    await this.dataStore.update((draft) => {
      draft.readingPositions[sourceKey] = sanitizeTokenIndex(tokenIndex);
    });
  }
}

function sanitizeTokenIndex(tokenIndex: number): number {
  if (!Number.isFinite(tokenIndex)) {
    return 0;
  }
  return Math.max(0, Math.floor(tokenIndex));
}
