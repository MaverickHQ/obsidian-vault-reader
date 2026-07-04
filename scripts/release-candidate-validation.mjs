import fs from "node:fs/promises";
import path from "node:path";

import { assertReleaseDirectoryEntries, releaseAssetNames } from "./release-package-policy.mjs";

export async function validateReleaseCandidateDirectory(releaseDir) {
  const entries = await fs.readdir(releaseDir);
  assertReleaseDirectoryEntries(entries);

  for (const assetName of releaseAssetNames) {
    const assetPath = path.join(releaseDir, assetName);
    const stat = await fs.stat(assetPath);
    assert(stat.isFile(), `${assetName} must be a file.`);
    assert(stat.size > 0, `${assetName} must not be empty.`);
  }

  return {
    assetNames: [...releaseAssetNames],
  };
}

export async function installReleaseCandidateToVault({ releaseDir, vaultRoot, pluginId }) {
  await validateReleaseCandidateDirectory(releaseDir);

  const installDir = path.join(vaultRoot, ".obsidian", "plugins", pluginId);
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  for (const assetName of releaseAssetNames) {
    await fs.copyFile(path.join(releaseDir, assetName), path.join(installDir, assetName));
  }

  return installDir;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
