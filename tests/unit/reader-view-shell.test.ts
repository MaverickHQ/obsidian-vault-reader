// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { renderReaderViewShell } from "../../src/reader/view/reader-view-shell";

describe("renderReaderViewShell", () => {
  it("creates the stable reader shell structure and controls", () => {
    const contentEl = document.createElement("div");
    const elements = renderReaderViewShell(contentEl);

    expect(contentEl.className).toBe("vault-reader-view");
    expect(contentEl.tabIndex).toBe(0);
    expect(contentEl.querySelector(".vault-reader-shell")).toBe(elements.shellEl);
    expect(contentEl.querySelector(".vault-reader-shell-header")).toBeTruthy();
    expect(contentEl.querySelector(".vault-reader-shell-body")).toBeTruthy();
    expect(contentEl.querySelector(".vault-reader-shell-controls")).toBeTruthy();
    expect(elements.titleEl.className).toBe("vault-reader-title");
    expect(elements.sourceLabelEl.className).toBe("vault-reader-source-label");
    expect(elements.sourceMismatchEl.className).toBe("vault-reader-source-mismatch");
    expect(elements.onboardingEl.className).toBe("vault-reader-onboarding");
    expect(elements.onboardingDismissButtonEl.textContent).toBe("Got it");
    expect(elements.progressEl.className).toBe("vault-reader-progress");
    expect(elements.stateEl.className).toBe("vault-reader-state");
    expect(elements.tokenPrefixEl.className).toBe("vault-reader-token-prefix");
    expect(elements.tokenFocusEl.className).toBe("vault-reader-token-focus");
    expect(elements.tokenSuffixEl.className).toBe("vault-reader-token-suffix");
    expect(elements.restartButtonEl.className).toContain("vault-reader-restart");
    expect(elements.restartButtonEl.textContent).toBe("Restart");
    expect(elements.readActiveNoteButtonEl.textContent).toBe("Read current note");
    expect(elements.slowerButtonEl.textContent).toBe("−");
    expect(elements.fasterButtonEl.textContent).toBe("+");
    expect(elements.typographyLabelEl.textContent).toBe("Text");
    expect(elements.panelZoomLabelEl.textContent).toBe("Zoom");
  });

  it("adds accessible names, labels, and value readouts for public controls", () => {
    const contentEl = document.createElement("div");
    const elements = renderReaderViewShell(contentEl);

    expect(elements.playPauseButtonEl.getAttribute("aria-label")).toBe("Play or pause reading");
    expect(elements.restartButtonEl.getAttribute("aria-label")).toBe(
      "Restart reading from the beginning",
    );
    expect(elements.readActiveNoteButtonEl.getAttribute("aria-label")).toBe(
      "Read the currently active note",
    );
    expect(elements.stopButtonEl.getAttribute("aria-label")).toBe("Stop reading");
    expect(elements.slowerButtonEl.getAttribute("aria-label")).toBe("Decrease reading speed");
    expect(elements.fasterButtonEl.getAttribute("aria-label")).toBe("Increase reading speed");
    expect(elements.orpToggleButtonEl.getAttribute("aria-label")).toBe(
      "Toggle focus-letter highlighting",
    );
    expect(elements.accentToggleButtonEl.getAttribute("aria-label")).toBe(
      "Switch reader accent colour",
    );
    expect(elements.inNoteHighlightToggleButtonEl.getAttribute("aria-label")).toBe(
      "Toggle in-note word highlight",
    );
    expect(elements.inNoteHighlightColorButtonEl.getAttribute("aria-label")).toBe(
      "Change in-note highlight colour",
    );
    expect(elements.onboardingDismissButtonEl.getAttribute("aria-label")).toBe(
      "Dismiss Vault Reader first-run hint",
    );

    expect(elements.wpmInputEl.getAttribute("aria-label")).toBe("Words per minute");
    expect(elements.typographySliderEl.getAttribute("aria-label")).toBe("Text size percentage");
    expect(elements.typographyInputEl.getAttribute("aria-label")).toBe("Text size percentage");
    expect(elements.panelZoomSliderEl.getAttribute("aria-label")).toBe("Panel zoom percentage");
    expect(elements.panelZoomInputEl.getAttribute("aria-label")).toBe("Panel zoom percentage");
    expect(elements.typographyValueEl.textContent).toBe("100%");
    expect(elements.panelZoomValueEl.textContent).toBe("100%");
    expect(elements.typographyValueEl.getAttribute("aria-live")).toBe("polite");
    expect(elements.panelZoomValueEl.getAttribute("aria-live")).toBe("polite");
  });

  it("does not leave any public interactive control without an accessible name", () => {
    const contentEl = document.createElement("div");
    renderReaderViewShell(contentEl);

    const controls = Array.from(contentEl.querySelectorAll("button, input"));
    expect(controls.length).toBeGreaterThan(0);
    for (const control of controls) {
      const accessibleName =
        control.getAttribute("aria-label") ??
        control.getAttribute("title") ??
        control.textContent?.trim();
      expect(accessibleName).toBeTruthy();
    }
  });
});
