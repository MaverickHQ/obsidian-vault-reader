import { describe, expect, it } from "vitest";

import {
  buildTokenHighlightMap,
  resolveTokenHighlightRange,
} from "../../src/reader/source-highlight-map";
import { normalizeMarkdownToReadingText } from "../../src/reader/markdown-normalizer";
import { tokenizeReadingText } from "../../src/reader/tokenizer";

describe("source highlight offset mapping", () => {
  it("maps punctuation, newlines, and repeated tokens to deterministic editor ranges", () => {
    const sourceText = "First line.\n\nFirst line again.";
    const tokens = tokenizeReadingText(normalizeMarkdownToReadingText(sourceText));

    const map = buildTokenHighlightMap({
      sourceKey: "notes/repeated.md",
      sourceText,
      documentText: sourceText,
      sourceStartOffset: 0,
      tokens,
    });

    expect(map.ok).toBe(true);
    if (!map.ok) {
      throw new Error("expected highlight map to resolve");
    }

    expect(map.ranges.map((range) => sourceText.slice(range.from, range.to))).toEqual([
      "First",
      "line.",
      "First",
      "line",
      "again.",
    ]);
    expect(map.ranges[0]).toEqual({ index: 0, from: 0, to: 5 });
    expect(map.ranges[2]).toEqual({ index: 2, from: 13, to: 18 });
  });

  it("maps normalized markdown tokens back into their original source locations", () => {
    const sourceText = "# Title\n\nThis has **bold** and [link label](https://example.com).";
    const tokens = tokenizeReadingText(normalizeMarkdownToReadingText(sourceText));

    const map = buildTokenHighlightMap({
      sourceKey: "notes/markdown.md",
      sourceText,
      documentText: sourceText,
      sourceStartOffset: 0,
      tokens,
    });

    expect(map.ok).toBe(true);
    if (!map.ok) {
      throw new Error("expected highlight map to resolve");
    }

    const highlightedText = map.ranges.map((range) => sourceText.slice(range.from, range.to));
    expect(highlightedText).toContain("bold");
    expect(highlightedText).toContain("link");
    expect(highlightedText).toContain("label");
  });

  it("adds selection start offsets so selection tokens highlight the full editor document", () => {
    const documentText = "Before\nSelected repeated Selected\nAfter";
    const sourceText = "Selected repeated Selected";
    const sourceStartOffset = documentText.indexOf(sourceText);
    const tokens = tokenizeReadingText(sourceText);

    const map = buildTokenHighlightMap({
      sourceKey: "notes/selection.md",
      sourceText,
      documentText,
      sourceStartOffset,
      tokens,
    });

    expect(map.ok).toBe(true);
    if (!map.ok) {
      throw new Error("expected highlight map to resolve");
    }

    expect(map.ranges[0]).toEqual({ index: 0, from: 7, to: 15 });
    expect(map.ranges[2]).toEqual({ index: 2, from: 25, to: 33 });
  });

  it("returns an explicit fallback when an exact range cannot be guaranteed", () => {
    const map = buildTokenHighlightMap({
      sourceKey: "notes/stale.md",
      sourceText: "Original text",
      documentText: "Original text",
      sourceStartOffset: 0,
      tokens: tokenizeReadingText("Missing token"),
    });

    expect(map.ok).toBe(false);
    if (map.ok) {
      throw new Error("expected highlight map to fail");
    }

    expect(map.reason).toBe("TOKEN_RANGE_UNRESOLVED");
  });

  it("resolves a highlight range only for active reading states", () => {
    const sourceText = "One two";
    const map = buildTokenHighlightMap({
      sourceKey: "notes/state.md",
      sourceText,
      documentText: sourceText,
      sourceStartOffset: 0,
      tokens: tokenizeReadingText(sourceText),
    });
    if (!map.ok) {
      throw new Error("expected highlight map to resolve");
    }

    expect(resolveTokenHighlightRange(map, "PLAYING", 1)).toEqual({ from: 4, to: 7 });
    expect(resolveTokenHighlightRange(map, "PAUSED", 1)).toEqual({ from: 4, to: 7 });
    expect(resolveTokenHighlightRange(map, "READY", 0)).toEqual({ from: 0, to: 3 });
    expect(resolveTokenHighlightRange(map, "IDLE", 0)).toBeNull();
    expect(resolveTokenHighlightRange(map, "COMPLETE", 1)).toBeNull();
    expect(resolveTokenHighlightRange(map, "ERROR", 1)).toBeNull();
  });
});
