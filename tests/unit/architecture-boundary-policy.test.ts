import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("architecture boundary policy", () => {
  it("keeps VaultReaderView below the thermo-nuclear file-size tripwire", () => {
    const source = fs.readFileSync(path.join(root, "src", "reader", "reader-view.ts"), "utf8");
    const lineCount = source.split("\n").length;

    expect(lineCount).toBeLessThan(1000);
  });

  it("keeps reader-view runtime tests on public harness seams", () => {
    const testSource = fs.readFileSync(
      path.join(root, "tests", "integration", "reader-view-runtime.test.ts"),
      "utf8",
    );

    expect(testSource).not.toContain("sessionRunner");
  });
});
