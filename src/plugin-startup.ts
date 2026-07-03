import { createVaultReaderError, type VaultReaderError } from "./errors/vault-reader-error";

export interface DataStoreLoader {
  load: () => Promise<unknown>;
}

export type StartupNoticeFn = (message: string) => void;
export type StartupLogFn = (error: VaultReaderError) => void;

const STARTUP_RECOVERY_NOTICE =
  "Vault Reader could not load persisted data and started with safe defaults. Check console logs for details.";

export async function loadDataStoreWithRecovery(
  loader: DataStoreLoader,
  notify: StartupNoticeFn,
  logError: StartupLogFn = (error) => {
    console.error(error.message, error.context);
  },
): Promise<void> {
  try {
    await loader.load();
  } catch (error) {
    logError(
      createVaultReaderError("STARTUP_LOAD_FAILED", "Vault Reader failed to load persisted data.", {
        cause: error instanceof Error ? error.message : String(error),
      }),
    );
    notify(STARTUP_RECOVERY_NOTICE);
  }
}
