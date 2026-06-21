import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const scriptPath = path.join(root, "tests", "no-secrets.sh");

describe("no-secrets policy", () => {
  it("uses null-delimited scanning and skips moved files during refactors", () => {
    const script = fs.readFileSync(scriptPath, "utf8");
    expect(script).toContain("git ls-files -z");
    expect(script).toContain("read -r -d '' file");
    expect(script).toContain('[[ -f "$file" ]]');
  });
});
