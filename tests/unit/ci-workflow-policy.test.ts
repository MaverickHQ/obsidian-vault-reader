import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const ciWorkflowPath = path.join(root, ".github", "workflows", "ci.yml");

describe("ci workflow policy", () => {
  it("defines a CI workflow with required quality gates", () => {
    const exists = fs.existsSync(ciWorkflowPath);
    expect(exists).toBe(true);

    if (!exists) {
      return;
    }

    const workflow = fs.readFileSync(ciWorkflowPath, "utf8");
    expect(workflow).toContain("npm run format:check");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run test -- --coverage");
    expect(workflow).toContain("npm audit --audit-level=high");
    expect(workflow).toContain("npm run check:secrets");
    expect(workflow).toContain("npm run build:release");
  });
});
