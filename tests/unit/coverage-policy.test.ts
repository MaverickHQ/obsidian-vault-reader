import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const vitestConfigPath = path.join(root, "vitest.config.ts");

describe("coverage policy", () => {
  it("does not exclude reader-view orchestration from coverage gates", () => {
    const configSource = fs.readFileSync(vitestConfigPath, "utf8");
    expect(configSource).not.toContain('exclude: ["src/reader/reader-view.ts"]');
    expect(configSource).toContain('include: ["src/reader/**/*.ts"');
    expect(configSource).not.toContain("start-reader-session-use-case.ts");
    expect(configSource).not.toContain("reader-view-actions.ts");
  });
});
