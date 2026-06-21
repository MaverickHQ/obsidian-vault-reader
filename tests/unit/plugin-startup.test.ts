import { describe, expect, it, vi } from "vitest";

import { loadDataStoreWithRecovery } from "../../src/plugin-startup";
import type { VaultReaderError } from "../../src/errors/vault-reader-error";

describe("loadDataStoreWithRecovery", () => {
  it("logs diagnostics when load fails", async () => {
    const notify = vi.fn<(message: string) => void>();
    const logger = vi.fn<(error: VaultReaderError) => void>();
    const loader = {
      load: async () => {
        throw new Error("corrupt payload");
      },
    };

    await loadDataStoreWithRecovery(loader, notify, logger);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0]?.[0].code).toBe("STARTUP_LOAD_FAILED");
    expect(logger.mock.calls[0]?.[0].message).toContain("failed to load");
  });

  it("does not log diagnostics when load succeeds", async () => {
    const notify = vi.fn<(message: string) => void>();
    const logger = vi.fn<(error: VaultReaderError) => void>();
    const loader = {
      load: async () => ({ ok: true }),
    };

    await loadDataStoreWithRecovery(loader, notify, logger);

    expect(notify).not.toHaveBeenCalled();
    expect(logger).not.toHaveBeenCalled();
  });
});
