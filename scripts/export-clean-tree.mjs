import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { defaultCleanTreeExportDir, validateCleanTreeEntries } from "./clean-tree-policy.mjs";

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

function parseArgs(argv) {
  const targetFlagIndex = argv.indexOf("--target");
  const target =
    targetFlagIndex >= 0 && argv[targetFlagIndex + 1]
      ? argv[targetFlagIndex + 1]
      : defaultCleanTreeExportDir;

  return {
    targetDir: path.resolve(projectRoot, target),
  };
}

async function gitTrackedFiles() {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    cwd: projectRoot,
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout.split("\0").filter(Boolean).sort();
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rootDir, absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path.relative(rootDir, absolutePath).replaceAll(path.sep, "/"));
    }
  }

  return files.sort();
}

async function copyTrackedFile(relativePath, targetDir) {
  const sourcePath = path.join(projectRoot, relativePath);
  const targetPath = path.join(targetDir, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

export async function exportCleanTree(targetDir) {
  const trackedFiles = await gitTrackedFiles();
  validateCleanTreeEntries(trackedFiles);

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  for (const relativePath of trackedFiles) {
    await copyTrackedFile(relativePath, targetDir);
  }

  const exportedFiles = await listFiles(targetDir);
  validateCleanTreeEntries(exportedFiles);

  return {
    targetDir,
    fileCount: exportedFiles.length,
  };
}

async function main() {
  const { targetDir } = parseArgs(process.argv.slice(2));
  const result = await exportCleanTree(targetDir);
  console.log(`Exported ${result.fileCount} tracked files to ${result.targetDir}`);
}

main().catch((error) => {
  console.error("Clean tree export failed.", error);
  process.exitCode = 1;
});
