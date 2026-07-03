import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import {
  assertReleaseDirectoryEntries,
  formatChecksumLines,
  releaseAssetNames,
  releaseChecksumFileName,
} from "./release-package-policy.mjs";

export async function validateReleaseCandidateDirectory(releaseDir) {
  const entries = await fs.readdir(releaseDir);
  assertReleaseDirectoryEntries(entries);

  const checksums = [];
  for (const assetName of releaseAssetNames) {
    const assetPath = path.join(releaseDir, assetName);
    const stat = await fs.stat(assetPath);
    assert(stat.isFile(), `${assetName} must be a file.`);
    assert(stat.size > 0, `${assetName} must not be empty.`);
    checksums.push({
      assetName,
      sha256: await sha256File(assetPath),
    });
  }

  const expectedChecksums = formatChecksumLines(checksums);
  const actualChecksums = await fs.readFile(path.join(releaseDir, releaseChecksumFileName), "utf8");
  assert(
    actualChecksums === expectedChecksums,
    "Release checksum file must match the packaged artifacts.",
  );

  return {
    assetNames: [...releaseAssetNames],
    checksumFileName: releaseChecksumFileName,
  };
}

export async function installReleaseCandidateToVault({ releaseDir, vaultRoot, pluginId }) {
  await validateReleaseCandidateDirectory(releaseDir);

  const installDir = path.join(vaultRoot, ".obsidian", "plugins", pluginId);
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  for (const assetName of [...releaseAssetNames, releaseChecksumFileName]) {
    await fs.copyFile(path.join(releaseDir, assetName), path.join(installDir, assetName));
  }

  return installDir;
}

async function sha256File(absolutePath) {
  const content = await fs.readFile(absolutePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
