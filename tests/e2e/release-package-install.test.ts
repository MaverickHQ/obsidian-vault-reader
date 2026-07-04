import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  installReleaseCandidateToVault,
  validateReleaseCandidateDirectory,
} from "../../scripts/release-candidate-validation.mjs";
import { releaseAssetNames } from "../../scripts/release-package-policy.mjs";

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

    for (const assetName of releaseAssetNames) {
      const content = assetContents[assetName];
      await fs.writeFile(path.join(releaseDir, assetName), content, "utf8");
    }

    await expect(validateReleaseCandidateDirectory(releaseDir)).resolves.toEqual({
      assetNames: ["main.js", "manifest.json", "styles.css"],
    });

    const installDir = await installReleaseCandidateToVault({
      releaseDir,
      vaultRoot,
      pluginId: "vault-reader",
    });

    expect(installDir).toBe(path.join(vaultRoot, ".obsidian", "plugins", "vault-reader"));
    await expect(fs.readdir(installDir)).resolves.toEqual([
      "main.js",
      "manifest.json",
      "styles.css",
    ]);
  });
});
