import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");

describe("community plugin QA policy", () => {
  it("documents the clean-vault release candidate checklist before public submission", () => {
    const qaPath = path.join(root, "docs", "community-plugin-qa.md");
    const qa = fs.readFileSync(qaPath, "utf8");

    expect(qa).toContain("# Community Plugin QA");
    expect(qa).toContain("Release Package Install Gate");
    expect(qa).toContain("Clean Temporary Vault");
    expect(qa).toContain("fixtures/manual-test-vault");
    expect(qa).toContain("Representative Notes");
    expect(qa).toContain("headings");
    expect(qa).toContain("lists");
    expect(qa).toContain("links");
    expect(qa).toContain("code blocks");
    expect(qa).toContain("frontmatter");
    expect(qa).toContain("long prose");
    expect(qa).toContain("repeated words");
    expect(qa).toContain("empty or unsupported contexts");
  });

  it("covers every public reader flow and known limitation", () => {
    const qa = fs.readFileSync(path.join(root, "docs", "community-plugin-qa.md"), "utf8");

    for (const expectedFlow of [
      "start",
      "play",
      "pause",
      "resume",
      "stop",
      "restart",
      "WPM",
      "ORP",
      "accent",
      "text size",
      "panel zoom",
      "note highlight",
      "highlight colour",
      "reload",
      "disable and re-enable",
    ]) {
      expect(qa).toContain(expectedFlow);
    }

    expect(qa).toContain("Known Limitations");
    expect(qa).toContain("Desktop-only");
    expect(qa).toContain("Preview mode");
    expect(qa).toContain("Follow-scroll");
    expect(qa).toContain("RSVP Nano");
    expect(qa).toContain("BYOK AI");
  });
});
