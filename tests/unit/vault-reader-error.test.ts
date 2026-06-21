import { describe, expect, it } from "vitest";

import {
  createVaultReaderError,
  fingerprintVaultReaderError,
  sanitizeErrorMessageForNotice,
} from "../../src/errors/vault-reader-error";

describe("vault-reader-error", () => {
  it("builds deterministic fingerprints for dedupe", () => {
    const error = createVaultReaderError("SETTINGS_PERSIST_FAILED", "Save failed");
    expect(fingerprintVaultReaderError(error)).toBe("SETTINGS_PERSIST_FAILED::Save failed");
  });

  it("sanitizes user-facing error text and falls back when empty", () => {
    expect(sanitizeErrorMessageForNotice("  <b>bad</b>\nmessage  ", "Fallback")).toBe(
      "bbad/b message",
    );
    expect(sanitizeErrorMessageForNotice("\n\t", "Fallback")).toBe("Fallback");
  });

  it("truncates very long error strings to keep notices readable", () => {
    const longMessage = `x${"y".repeat(400)}`;
    expect(sanitizeErrorMessageForNotice(longMessage, "Fallback").length).toBeLessThanOrEqual(180);
  });

  it("falls back instead of exposing stack traces or absolute local paths", () => {
    expect(
      sanitizeErrorMessageForNotice(
        "Error: failed\n    at Object.run (/Users/maverick/vault/private-note.md:1:1)",
        "Friendly fallback",
      ),
    ).toBe("Friendly fallback");
    expect(
      sanitizeErrorMessageForNotice(
        "Could not read /Users/maverick/vault/private-note.md",
        "Friendly fallback",
      ),
    ).toBe("Friendly fallback");
  });
});
