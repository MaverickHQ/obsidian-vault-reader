import packageJson from "../../package.json";
import { describe, expect, it } from "vitest";

describe("package metadata", () => {
  it("contains professional GitHub project metadata", () => {
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.author).toBe("MaverickHQ");
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "git+https://github.com/MaverickHQ/obsidian-vault-reader-clean-public.git",
    });
    expect(packageJson.bugs).toEqual({
      url: "https://github.com/MaverickHQ/obsidian-vault-reader-clean-public/issues",
    });
    expect(packageJson.homepage).toBe(
      "https://github.com/MaverickHQ/obsidian-vault-reader-clean-public#readme",
    );
    expect(packageJson.keywords).toEqual(
      expect.arrayContaining(["obsidian", "plugin", "speed-reading", "rsvp"]),
    );
  });
});
