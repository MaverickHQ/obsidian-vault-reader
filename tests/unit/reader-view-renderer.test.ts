// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { renderReaderViewShell } from "../../src/reader/view/reader-view-shell";
import { renderReaderViewSnapshot } from "../../src/reader/view/reader-view-renderer";
import { tokenizeReadingText } from "../../src/reader/tokenizer";
import { DEFAULT_TEST_READER_SETTINGS } from "../helpers/reader-view-harness";

describe("renderReaderViewSnapshot", () => {
  it("updates shell text, controls, ORP token parts, and disabled states", () => {
    const elements = renderReaderViewShell(document.createElement("div"));
    const [token] = tokenizeReadingText("Reader");

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "Daily Note",
      sessionSourceKey: "notes/daily.md",
      snapshot: {
        state: "READY",
        sourceKey: "notes/daily.md",
        currentIndex: 0,
        tokenCount: 1,
        wpm: 320,
        currentDelayMs: 188,
        errorMessage: null,
      },
      settings: {
        ...DEFAULT_TEST_READER_SETTINGS,
        accentTheme: "claude-orange",
        inNoteHighlightColor: "orange",
      },
      resolvedPanelZoom: 115,
      token,
    });

    expect(elements.titleEl.textContent).toBe("Daily Note");
    expect(elements.sourceLabelEl.textContent).toBe("Reading: Daily Note");
    expect(elements.sourceMismatchEl.hidden).toBe(true);
    expect(elements.progressEl.textContent).toBe("Progress 1 / 1 (100%)");
    expect(elements.stateEl.textContent).toBe("READY at 320 WPM");
    expect(elements.wpmInputEl.value).toBe("320");
    expect(elements.orpToggleButtonEl.textContent).toBe("ORP On");
    expect(elements.accentToggleButtonEl.textContent).toBe("Accent Orange");
    expect(elements.inNoteHighlightToggleButtonEl.textContent).toBe("Note Highlight On");
    expect(elements.inNoteHighlightColorButtonEl.textContent).toBe("Highlight Orange");
    expect(elements.typographyInputEl.value).toBe("100");
    expect(elements.panelZoomInputEl.value).toBe("115");
    expect(elements.typographyValueEl.textContent).toBe("100%");
    expect(elements.panelZoomValueEl.textContent).toBe("115%");
    expect(elements.typographySliderEl.getAttribute("aria-valuetext")).toBe("100%");
    expect(elements.panelZoomSliderEl.getAttribute("aria-valuetext")).toBe("115%");
    expect(elements.playPauseButtonEl.textContent).toBe("Play");
    expect(elements.stopButtonEl.disabled).toBe(false);
    expect(elements.restartButtonEl.disabled).toBe(false);
    expect(
      `${elements.tokenPrefixEl.textContent}${elements.tokenFocusEl.textContent}${elements.tokenSuffixEl.textContent}`,
    ).toBe("Reader");
  });

  it("disables restart when no session is loaded", () => {
    const elements = renderReaderViewShell(document.createElement("div"));

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "No source loaded",
      snapshot: {
        state: "IDLE",
        sourceKey: null,
        currentIndex: 0,
        tokenCount: 0,
        wpm: 300,
        currentDelayMs: null,
        errorMessage: null,
      },
      settings: DEFAULT_TEST_READER_SETTINGS,
      resolvedPanelZoom: 100,
      token: null,
    });

    expect(elements.restartButtonEl.disabled).toBe(true);
    expect(elements.onboardingEl.hidden).toBe(false);
    expect(elements.onboardingTextEl.textContent).toContain("Play or pause");
    expect(elements.onboardingTextEl.textContent).not.toMatch(/\b(AI|device|paid|telemetry)\b/i);
    expect(elements.emptyStateEl.hidden).toBe(false);
    expect(elements.emptyStateEl.textContent).toContain(
      "Open a note, then run Vault Reader: Start reading current note.",
    );
    expect(elements.emptyStateEl.textContent).toContain("Space");
  });

  it("hides empty state once a readable session is loaded while keeping onboarding visible", () => {
    const elements = renderReaderViewShell(document.createElement("div"));
    const [token] = tokenizeReadingText("Reader");

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "Daily Note",
      snapshot: {
        state: "READY",
        sourceKey: "notes/daily.md",
        currentIndex: 0,
        tokenCount: 1,
        wpm: 320,
        currentDelayMs: 188,
        errorMessage: null,
      },
      settings: DEFAULT_TEST_READER_SETTINGS,
      resolvedPanelZoom: 100,
      token,
    });

    expect(elements.emptyStateEl.hidden).toBe(true);
    expect(elements.onboardingEl.hidden).toBe(false);
  });

  it("hides first-run onboarding after it has been dismissed", () => {
    const elements = renderReaderViewShell(document.createElement("div"));

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "No source loaded",
      snapshot: {
        state: "IDLE",
        sourceKey: null,
        currentIndex: 0,
        tokenCount: 0,
        wpm: 300,
        currentDelayMs: null,
        errorMessage: null,
      },
      settings: {
        ...DEFAULT_TEST_READER_SETTINGS,
        onboardingDismissed: true,
      },
      resolvedPanelZoom: 100,
      token: null,
    });

    expect(elements.onboardingEl.hidden).toBe(true);
  });

  it("shows an explicit rebind action when the active note differs from the reader session", () => {
    const elements = renderReaderViewShell(document.createElement("div"));
    const [token] = tokenizeReadingText("Reader");

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "Daily Note",
      sessionSourceKey: "notes/daily.md",
      activeSourceKey: "notes/new-note.md",
      canReadActiveSource: true,
      snapshot: {
        state: "READY",
        sourceKey: "notes/daily.md",
        currentIndex: 0,
        tokenCount: 1,
        wpm: 320,
        currentDelayMs: 188,
        errorMessage: null,
      },
      settings: DEFAULT_TEST_READER_SETTINGS,
      resolvedPanelZoom: 100,
      token,
    });

    expect(elements.sourceMismatchEl.hidden).toBe(false);
    expect(elements.sourceMismatchEl.textContent).toContain("Active note changed.");
    expect(elements.readActiveNoteButtonEl.disabled).toBe(false);
  });

  it("shows degraded in-note highlight state in the controls", () => {
    const elements = renderReaderViewShell(document.createElement("div"));
    const [token] = tokenizeReadingText("Reader");

    renderReaderViewSnapshot({
      elements,
      sessionTitle: "Daily Note",
      snapshot: {
        state: "PLAYING",
        sourceKey: "notes/daily.md",
        currentIndex: 0,
        tokenCount: 1,
        wpm: 320,
        currentDelayMs: 188,
        errorMessage: null,
      },
      settings: DEFAULT_TEST_READER_SETTINGS,
      resolvedPanelZoom: 100,
      token,
      sourceHighlightState: {
        status: "unavailable",
        reason: "missing editor view",
        notified: true,
      },
    });

    expect(elements.inNoteHighlightToggleButtonEl.textContent).toBe("Note Highlight Unavailable");
  });
});
