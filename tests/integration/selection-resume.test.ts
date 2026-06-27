import { describe, expect, it } from "vitest";

import type { ReadingSource } from "../../src/reader/source-resolver";
import { buildReadingSourceKey } from "../../src/reader/source-key";

function createSelectionSource(text: string): ReadingSource {
  return {
    kind: "editor-selection",
    filePath: "notes/example.md",
    fileName: "example.md",
    fileBaseName: "example",
    text,
    charLength: text.length,
    highlightSourceText: text,
    highlightDocumentText: text,
    highlightStartOffset: 0,
  };
}

function createSelectionSourceWithRange(text: string, selectionRangeKey: string): ReadingSource {
  return {
    ...createSelectionSource(text),
    selectionRangeKey,
  };
}

function createSelectionSourceWithContext(
  text: string,
  selectionContextKey: string,
): ReadingSource {
  return {
    ...createSelectionSource(text),
    selectionContextKey,
  };
}

describe("selection resume source keys", () => {
  it("creates different keys for different selections in the same note", () => {
    const first = buildReadingSourceKey(createSelectionSource("one two"));
    const second = buildReadingSourceKey(createSelectionSource("three four"));

    expect(first).not.toBe(second);
  });

  it("creates stable keys for identical selections in the same note", () => {
    const first = buildReadingSourceKey(createSelectionSource("repeat me"));
    const second = buildReadingSourceKey(createSelectionSource("repeat me"));

    expect(first).toBe(second);
  });

  it("creates different keys for identical selection text at different ranges", () => {
    const first = buildReadingSourceKey(
      createSelectionSourceWithRange("repeat me", "from:1:2-to:1:11"),
    );
    const second = buildReadingSourceKey(
      createSelectionSourceWithRange("repeat me", "from:5:0-to:5:9"),
    );

    expect(first).not.toBe(second);
  });

  it("creates stable keys for identical selection text and identical ranges", () => {
    const first = buildReadingSourceKey(
      createSelectionSourceWithRange("repeat me", "from:1:2-to:1:11"),
    );
    const second = buildReadingSourceKey(
      createSelectionSourceWithRange("repeat me", "from:1:2-to:1:11"),
    );

    expect(first).toBe(second);
  });

  it("creates different keys for identical selection text with different context keys", () => {
    const first = buildReadingSourceKey(
      createSelectionSourceWithContext("repeat me", "cursor:4:2"),
    );
    const second = buildReadingSourceKey(
      createSelectionSourceWithContext("repeat me", "cursor:12:1"),
    );

    expect(first).not.toBe(second);
  });

  it("creates stable keys for identical selection text and identical context keys", () => {
    const first = buildReadingSourceKey(
      createSelectionSourceWithContext("repeat me", "cursor:4:2"),
    );
    const second = buildReadingSourceKey(
      createSelectionSourceWithContext("repeat me", "cursor:4:2"),
    );

    expect(first).toBe(second);
  });
});
