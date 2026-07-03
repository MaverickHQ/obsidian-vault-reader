// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  applyReaderVisualSettings,
  nextAccentTheme,
  nextInNoteHighlightColor,
} from "../../src/reader/view/reader-appearance-controller";
import { DEFAULT_TEST_READER_SETTINGS } from "../helpers/reader-view-harness";

describe("reader appearance controller", () => {
  it("cycles visual option values deterministically", () => {
    expect(nextAccentTheme("blue")).toBe("claude-orange");
    expect(nextAccentTheme("claude-orange")).toBe("blue");
    expect(nextInNoteHighlightColor("yellow")).toBe("orange");
    expect(nextInNoteHighlightColor("orange")).toBe("blue");
    expect(nextInNoteHighlightColor("blue")).toBe("yellow");
  });

  it("applies visual settings to the reader root element", () => {
    const contentEl = document.createElement("div");

    applyReaderVisualSettings(contentEl, {
      ...DEFAULT_TEST_READER_SETTINGS,
      typographyScale: 125,
      presentationMode: "tab",
      accentTheme: "claude-orange",
    });

    expect(contentEl.style.getPropertyValue("--vault-reader-token-size")).toBe("53px");
    expect(contentEl.getAttribute("data-presentation-mode")).toBe("tab");
    expect(contentEl.getAttribute("data-accent-theme")).toBe("claude-orange");
    expect(contentEl.style.getPropertyValue("--vault-reader-focus-color")).toBe("#D97757");
  });
});
