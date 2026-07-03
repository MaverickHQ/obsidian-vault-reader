import { spawn } from "node:child_process";

import { deployLocalVaultBuild } from "./deploy-local-vault.mjs";

let deployQueue = Promise.resolve();

function enqueueDeploy() {
  deployQueue = deployQueue
    .then(async () => {
      const result = await deployLocalVaultBuild();
      console.log(`[local-sync] deployed artifacts to ${result.targetDir}`);
    })
    .catch((error) => {
      console.error("[local-sync] deploy failed.", error);
    });
}

const watcher = spawn("node", ["esbuild.config.mjs", "--watch"], {
  stdio: ["inherit", "pipe", "pipe"],
});

function handleOutput(output, write) {
  write(output);
  if (output.includes("[watch] build finished")) {
    enqueueDeploy();
  }
}

watcher.stdout.on("data", (chunk) => {
  handleOutput(chunk.toString(), (output) => {
    process.stdout.write(output);
  });
});

watcher.stderr.on("data", (chunk) => {
  handleOutput(chunk.toString(), (output) => {
    process.stderr.write(output);
  });
});

watcher.on("close", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => {
  watcher.kill("SIGINT");
});

process.on("SIGTERM", () => {
  watcher.kill("SIGTERM");
});
