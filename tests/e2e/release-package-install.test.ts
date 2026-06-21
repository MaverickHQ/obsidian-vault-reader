import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  installReleaseCandidateToVault,
  validateReleaseCandidateDirectory,
} from "../../scripts/release-candidate-validation.mjs";
import { formatChecksumLines, releaseAssetNames } from "../../scripts/release-package-policy.mjs";

async function sha256(content: string): Promise<string> {
  return crypto.createHash("sha256").update(content).digest("hex");
}

describe("release package install E2E", () => {
  it("validates and installs the packaged plugin into an Obsidian vault plugin directory", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "vault-reader-release-"));
    const releaseDir = path.join(tempRoot, "release", "0.1.0");
    const vaultRoot = path.join(tempRoot, "vault");
    await fs.mkdir(releaseDir, { recursive: true });

    const assetContents: Record<(typeof releaseAssetNames)[number], string> = {
      "main.js": "console.log('vault reader');",
      "manifest.json": JSON.stringify({
        id: "vault-reader",
        name: "Vault Reader",
        version: "0.1.0",
      }),
      "styles.css": ".vault-reader-view { display: block; }",
    };

    const checksums = [];
    for (const assetName of releaseAssetNames) {
      const content = assetContents[assetName];
      await fs.writeFile(path.join(releaseDir, assetName), content, "utf8");
      checksums.push({
        assetName,
        sha256: await sha256(content),
      });
    }
    await fs.writeFile(path.join(releaseDir, "SHA256SUMS"), formatChecksumLines(checksums), "utf8");

    await expect(validateReleaseCandidateDirectory(releaseDir)).resolves.toEqual({
      assetNames: ["main.js", "manifest.json", "styles.css"],
      checksumFileName: "SHA256SUMS",
    });

    const installDir = await installReleaseCandidateToVault({
      releaseDir,
      vaultRoot,
      pluginId: "vault-reader",
    });

    expect(installDir).toBe(path.join(vaultRoot, ".obsidian", "plugins", "vault-reader"));
    await expect(fs.readdir(installDir)).resolves.toEqual([
      "SHA256SUMS",
      "main.js",
      "manifest.json",
      "styles.css",
    ]);
  });
});
