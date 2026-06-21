import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { releaseAssetNames } from "./release-package-policy.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const defaultTargetDir = path.join(
  projectRoot,
  "fixtures/manual-test-vault/.obsidian/plugins/vault-reader",
);
export const localDeployAssetNames = [...releaseAssetNames];

function resolveTargetDir() {
  const argvTarget = readArgValue("--target");
  const envTarget = process.env.VAULT_READER_PLUGIN_DIR;
  return path.resolve(argvTarget ?? envTarget ?? defaultTargetDir);
}

function readArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }
  const value = process.argv[index + 1];
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function copyArtifact(name, targetDir) {
  const sourcePath = path.join(projectRoot, name);
  const targetPath = path.join(targetDir, name);
  await fs.copyFile(sourcePath, targetPath);
  return targetPath;
}

export async function deployLocalVaultBuild(targetDir = resolveTargetDir()) {
  await fs.mkdir(targetDir, { recursive: true });
  const copied = [];
  for (const artifact of localDeployAssetNames) {
    copied.push(await copyArtifact(artifact, targetDir));
  }
  return {
    targetDir,
    copied,
  };
}

function isMainModule() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

async function run() {
  const result = await deployLocalVaultBuild();
  console.log(`Deployed ${localDeployAssetNames.join(", ")} to ${result.targetDir}`);
}

if (isMainModule()) {
  run().catch((error) => {
    console.error("Local deploy failed.", error);
    process.exitCode = 1;
  });
}
