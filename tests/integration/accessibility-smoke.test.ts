// @vitest-environment jsdom

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { renderReaderViewShell } from "../../src/reader/view/reader-view-shell";

const root = path.resolve(import.meta.dirname, "../..");

describe("reader accessibility smoke", () => {
  it("keeps reader controls keyboard-reachable and named", () => {
    const elements = renderReaderViewShell(document.createElement("div"));
    const controls = [
      elements.playPauseButtonEl,
      elements.restartButtonEl,
      elements.stopButtonEl,
      elements.slowerButtonEl,
      elements.fasterButtonEl,
      elements.orpToggleButtonEl,
      elements.accentToggleButtonEl,
      elements.inNoteHighlightToggleButtonEl,
      elements.inNoteHighlightColorButtonEl,
      elements.wpmInputEl,
      elements.typographySliderEl,
      elements.typographyInputEl,
      elements.panelZoomSliderEl,
      elements.panelZoomInputEl,
    ];

    for (const control of controls) {
      expect(control.getAttribute("aria-label")).toBeTruthy();
      expect(control.tabIndex).not.toBeLessThan(0);
    }
  });

  it("exposes focus-visible and highlight contrast hooks in CSS", () => {
    const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

    expect(styles).toContain(".vault-reader-view :is(button, input):focus-visible");
    expect(styles).toContain("--vault-reader-focus-ring");
    expect(styles).toContain(".vault-reader-editor-highlight-yellow");
    expect(styles).toContain(".vault-reader-editor-highlight-orange");
    expect(styles).toContain(".vault-reader-editor-highlight-blue");
  });
});
