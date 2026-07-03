import { describe, expect, it } from "vitest";

import { buildReadingSourceKey } from "../../src/reader/source-key";

describe("buildReadingSourceKey", () => {
  it("includes selection range metadata when available", () => {
    const key = buildReadingSourceKey({
      kind: "editor-selection",
      filePath: "notes/a.md",
      text: "Repeated text",
      selectionRangeKey: "from:1:2-to:1:15",
    });

    expect(key).toContain("from:1:2-to:1:15");
  });

  it("uses fallback marker when selection range metadata is unavailable", () => {
    const key = buildReadingSourceKey({
      kind: "editor-selection",
      filePath: "notes/a.md",
      text: "Repeated text",
      selectionContextKey: "cursor:8:4",
    });

    expect(key).toContain("cursor:8:4");
  });

  it("uses stable unknown marker when both range and context are unavailable", () => {
    const key = buildReadingSourceKey({
      kind: "editor-selection",
      filePath: "notes/a.md",
      text: "Repeated text",
    });

    expect(key).toContain("context:unknown");
  });

  it("uses selection start offset when range and context metadata are unavailable", () => {
    const key = buildReadingSourceKey({
      kind: "editor-selection",
      filePath: "notes/a.md",
      text: "Repeated text",
      highlightStartOffset: 42,
    });

    expect(key).toContain("offset:42");
    expect(key).not.toContain("context:unknown");
  });
});
