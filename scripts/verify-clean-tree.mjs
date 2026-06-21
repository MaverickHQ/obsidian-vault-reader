import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { defaultCleanTreeExportDir } from "./clean-tree-policy.mjs";

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const cleanTreeDir = path.join(projectRoot, defaultCleanTreeExportDir);
const verificationDir = path.join(projectRoot, "release", "clean-public-tree-verify");

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function run(command, args) {
  await execFileAsync(command, args, {
    cwd: verificationDir,
    maxBuffer: 20 * 1024 * 1024,
    stdio: "inherit",
  });
}

async function main() {
  await fs.access(cleanTreeDir);
  await fs.rm(verificationDir, { recursive: true, force: true });
  await copyDirectory(cleanTreeDir, verificationDir);

  await run("git", ["init", "-q"]);
  await run("git", ["add", "."]);
  await run("npm", ["ci"]);
  await run("npm", ["run", "verify"]);
}

main().catch((error) => {
  console.error("Clean tree verification failed.", error);
  process.exitCode = 1;
});
