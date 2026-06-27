import { describe, expect, it } from "vitest";

import {
  assertReleaseDirectoryEntries,
  formatChecksumLines,
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

  it("formats checksum lines for exactly the shipped assets", () => {
    expect(
      formatChecksumLines([
        { assetName: "main.js", sha256: "a".repeat(64) },
        { assetName: "manifest.json", sha256: "b".repeat(64) },
        { assetName: "styles.css", sha256: "c".repeat(64) },
      ]),
    ).toBe(
      `${"a".repeat(64)}  main.js\n${"b".repeat(64)}  manifest.json\n${"c".repeat(64)}  styles.css\n`,
    );
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
