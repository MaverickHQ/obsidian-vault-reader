import { describe, expect, it } from "vitest";

import {
  assertReleaseDirectoryEntries,
  releaseAssetNames,
  validateReleaseMetadata,
} from "../../scripts/release-package-policy.mjs";

describe("release package policy", () => {
  it("allows only Obsidian community plugin release assets", () => {
    expect(releaseAssetNames).toEqual(["main.js", "manifest.json", "styles.css"]);
    expect(() =>
      assertReleaseDirectoryEntries(["main.js", "manifest.json", "styles.css", "debug.log"]),
    ).toThrow("Unexpected release artifact: debug.log");
  });

  it("rejects unsupported release sidecar files", () => {
    expect(() =>
      assertReleaseDirectoryEntries(["main.js", "manifest.json", "styles.css", "SHA256SUMS"]),
    ).toThrow("Unexpected release artifact: SHA256SUMS");
  });

  it("rejects version drift before package files are copied", () => {
    expect(() =>
      validateReleaseMetadata({
        manifest: {
          id: "vault-reader",
          version: "0.1.0",
          minAppVersion: "1.8.0",
        },
        packageJson: {
          version: "0.2.0",
        },
        versions: {
          "0.1.0": "1.8.0",
        },
      }),
    ).toThrow("package.json version must match manifest.json.");
  });
});
