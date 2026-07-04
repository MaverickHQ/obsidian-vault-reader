import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertReleaseDirectoryEntries,
  releaseAssetNames,
  validateReleaseMetadata,
} from "./release-package-policy.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(projectRoot, relativePath), "utf8"));
}

async function assertFileExists(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const stat = await fs.stat(absolutePath);
  assert(stat.isFile(), `${relativePath} must be a file.`);
  assert(stat.size > 0, `${relativePath} must not be empty.`);
  return absolutePath;
}

async function main() {
  const [manifest, packageJson, versions] = await Promise.all([
    readJson("manifest.json"),
    readJson("package.json"),
    readJson("versions.json"),
  ]);

  validateReleaseMetadata({ manifest, packageJson, versions });

  const releaseDir = path.join(projectRoot, "release", manifest.version);
  await fs.rm(releaseDir, { recursive: true, force: true });
  await fs.mkdir(releaseDir, { recursive: true });

  for (const assetName of releaseAssetNames) {
    const sourcePath = await assertFileExists(assetName);
    const targetPath = path.join(releaseDir, assetName);
    await fs.copyFile(sourcePath, targetPath);
  }

  assertReleaseDirectoryEntries(await fs.readdir(releaseDir));
  console.log(`Packaged ${releaseAssetNames.join(", ")} into ${releaseDir}`);
}

main().catch((error) => {
  console.error("Release packaging failed.", error);
  process.exitCode = 1;
});
