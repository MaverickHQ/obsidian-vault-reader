import { describe, expect, it, vi } from "vitest";

import { loadDataStoreWithRecovery } from "../../src/plugin-startup";
import type { VaultReaderError } from "../../src/errors/vault-reader-error";
import VaultReaderPlugin from "../../src/main";

describe("plugin startup data-store recovery", () => {
  it("does not throw when persisted data load fails and emits a notice callback", async () => {
    const notify = vi.fn<(message: string) => void>();
    const logError = vi.fn<(error: VaultReaderError) => void>();
    const loader = {
      load: async () => {
        throw new Error("corrupt payload");
      },
    };

    await expect(loadDataStoreWithRecovery(loader, notify, logError)).resolves.toBeUndefined();
    expect(notify).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError.mock.calls[0]?.[0].code).toBe("STARTUP_LOAD_FAILED");
    expect(notify.mock.calls[0]?.[0]).toContain("safe defaults");
  });

  it("does not notify when persisted data load succeeds", async () => {
    const notify = vi.fn<(message: string) => void>();
    const loader = {
      load: async () => ({ ok: true }),
    };

    await expect(loadDataStoreWithRecovery(loader, notify)).resolves.toBeUndefined();
    expect(notify).not.toHaveBeenCalled();
  });

  it("registers the Vault Reader settings tab during plugin startup", async () => {
    const plugin = new VaultReaderPlugin({} as never, {} as never);
    (plugin as unknown as { app: unknown }).app = {
      workspace: {
        detachLeavesOfType: () => undefined,
      },
    };

    await plugin.onload();

    const settingTabs = (plugin as unknown as { settingTabs: unknown[] }).settingTabs;
    expect(settingTabs).toHaveLength(1);
    expect(settingTabs[0]).toHaveProperty("display");
  });
});
