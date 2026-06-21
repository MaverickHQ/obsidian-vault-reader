import type { ReaderViewElements } from "./reader-view-elements";

export const PANEL_ZOOM_MIN = 80;
export const PANEL_ZOOM_MAX = 140;
export const PANEL_ZOOM_STEP = 5;

export function renderReaderViewShell(contentEl: HTMLElement): ReaderViewElements {
  contentEl.replaceChildren();
  contentEl.className = "vault-reader-view";
  contentEl.tabIndex = 0;

  const shellEl = document.createElement("div");
  shellEl.className = "vault-reader-shell";
  contentEl.appendChild(shellEl);

  const headerEl = document.createElement("div");
  headerEl.className = "vault-reader-shell-header vault-reader-header";
  shellEl.appendChild(headerEl);

  const titleEl = document.createElement("div");
  titleEl.className = "vault-reader-title";
  headerEl.appendChild(titleEl);

  const sourceLabelEl = document.createElement("div");
  sourceLabelEl.className = "vault-reader-source-label";
  headerEl.appendChild(sourceLabelEl);

  const sourceMismatchEl = document.createElement("div");
  sourceMismatchEl.className = "vault-reader-source-mismatch";
  sourceMismatchEl.setAttribute("role", "status");
  sourceMismatchEl.hidden = true;
  headerEl.appendChild(sourceMismatchEl);

  const sourceMismatchTextEl = document.createElement("span");
  sourceMismatchTextEl.textContent = "Active note changed.";
  sourceMismatchEl.appendChild(sourceMismatchTextEl);

  const readActiveNoteButtonEl = createButton(
    "vault-reader-btn vault-reader-read-active-note",
    "Read current note",
    "Read the currently active note",
  );
  sourceMismatchEl.appendChild(readActiveNoteButtonEl);

  const onboardingEl = document.createElement("div");
  onboardingEl.className = "vault-reader-onboarding";
  onboardingEl.setAttribute("role", "note");
  shellEl.appendChild(onboardingEl);

  const onboardingTextEl = document.createElement("p");
  onboardingTextEl.className = "vault-reader-onboarding-text";
  onboardingEl.appendChild(onboardingTextEl);

  const onboardingDismissButtonEl = createButton(
    "vault-reader-btn vault-reader-onboarding-dismiss",
    "Got it",
    "Dismiss Vault Reader first-run hint",
  );
  onboardingEl.appendChild(onboardingDismissButtonEl);

  const progressEl = document.createElement("div");
  progressEl.className = "vault-reader-progress";
  headerEl.appendChild(progressEl);

  const stateEl = document.createElement("div");
  stateEl.className = "vault-reader-state";
  headerEl.appendChild(stateEl);

  const bodyEl = document.createElement("div");
  bodyEl.className = "vault-reader-shell-body";
  shellEl.appendChild(bodyEl);

  const tokenWrapEl = document.createElement("div");
  tokenWrapEl.className = "vault-reader-token-wrap";
  bodyEl.appendChild(tokenWrapEl);

  const emptyStateEl = document.createElement("p");
  emptyStateEl.className = "vault-reader-empty-state";
  tokenWrapEl.appendChild(emptyStateEl);

  const tokenEl = document.createElement("div");
  tokenEl.className = "vault-reader-token";
  tokenWrapEl.appendChild(tokenEl);

  const tokenPrefixEl = document.createElement("span");
  tokenPrefixEl.className = "vault-reader-token-prefix";
  tokenEl.appendChild(tokenPrefixEl);

  const tokenFocusEl = document.createElement("span");
  tokenFocusEl.className = "vault-reader-token-focus";
  tokenEl.appendChild(tokenFocusEl);

  const tokenSuffixEl = document.createElement("span");
  tokenSuffixEl.className = "vault-reader-token-suffix";
  tokenEl.appendChild(tokenSuffixEl);

  const controlsEl = document.createElement("div");
  controlsEl.className = "vault-reader-shell-controls vault-reader-controls";
  bodyEl.appendChild(controlsEl);

  const playPauseButtonEl = createButton("vault-reader-btn", "", "Play or pause reading");
  controlsEl.appendChild(playPauseButtonEl);

  const restartButtonEl = createButton(
    "vault-reader-btn vault-reader-restart",
    "Restart",
    "Restart reading from the beginning",
  );
  controlsEl.appendChild(restartButtonEl);

  const stopButtonEl = createButton("vault-reader-btn", "Stop", "Stop reading");
  controlsEl.appendChild(stopButtonEl);

  const slowerButtonEl = createButton("vault-reader-btn", "−", "Decrease reading speed");
  controlsEl.appendChild(slowerButtonEl);

  const wpmInputEl = document.createElement("input");
  wpmInputEl.type = "number";
  wpmInputEl.className = "vault-reader-wpm";
  wpmInputEl.min = "100";
  wpmInputEl.max = "600";
  wpmInputEl.step = "10";
  wpmInputEl.setAttribute("aria-label", "Words per minute");
  wpmInputEl.title = "Words per minute";
  controlsEl.appendChild(wpmInputEl);

  const fasterButtonEl = createButton("vault-reader-btn", "+", "Increase reading speed");
  controlsEl.appendChild(fasterButtonEl);

  const orpToggleButtonEl = createButton(
    "vault-reader-btn",
    "",
    "Toggle focus-letter highlighting",
  );
  controlsEl.appendChild(orpToggleButtonEl);

  const accentToggleButtonEl = createButton("vault-reader-btn", "", "Switch reader accent colour");
  controlsEl.appendChild(accentToggleButtonEl);

  const inNoteHighlightToggleButtonEl = createButton(
    "vault-reader-btn",
    "",
    "Toggle in-note word highlight",
  );
  controlsEl.appendChild(inNoteHighlightToggleButtonEl);

  const inNoteHighlightColorButtonEl = createButton(
    "vault-reader-btn",
    "",
    "Change in-note highlight colour",
  );
  controlsEl.appendChild(inNoteHighlightColorButtonEl);

  const typographyGroupEl = createControlGroup(controlsEl);
  const typographyLabelEl = createControlLabel("Text");
  typographyGroupEl.appendChild(typographyLabelEl);

  const typographySliderEl = createRangeInput("vault-reader-typography-slider", 70, 200, 5);
  typographySliderEl.title = "Text size %";
  typographySliderEl.setAttribute("aria-label", "Text size percentage");
  typographyGroupEl.appendChild(typographySliderEl);

  const typographyInputEl = createNumberInput("vault-reader-typography", 70, 200, 5);
  typographyInputEl.title = "Text size %";
  typographyInputEl.setAttribute("aria-label", "Text size percentage");
  typographyGroupEl.appendChild(typographyInputEl);

  const typographyValueEl = createValueOutput("100%");
  typographyGroupEl.appendChild(typographyValueEl);

  const panelZoomGroupEl = createControlGroup(controlsEl);
  const panelZoomLabelEl = createControlLabel("Zoom");
  panelZoomGroupEl.appendChild(panelZoomLabelEl);

  const panelZoomSliderEl = createRangeInput(
    "vault-reader-panel-zoom-slider",
    PANEL_ZOOM_MIN,
    PANEL_ZOOM_MAX,
    PANEL_ZOOM_STEP,
  );
  panelZoomSliderEl.title = "Panel zoom %";
  panelZoomSliderEl.setAttribute("aria-label", "Panel zoom percentage");
  panelZoomGroupEl.appendChild(panelZoomSliderEl);

  const panelZoomInputEl = createNumberInput(
    "vault-reader-panel-zoom",
    PANEL_ZOOM_MIN,
    PANEL_ZOOM_MAX,
    PANEL_ZOOM_STEP,
  );
  panelZoomInputEl.title = "Panel zoom %";
  panelZoomInputEl.setAttribute("aria-label", "Panel zoom percentage");
  panelZoomGroupEl.appendChild(panelZoomInputEl);

  const panelZoomValueEl = createValueOutput("100%");
  panelZoomGroupEl.appendChild(panelZoomValueEl);

  return {
    shellEl,
    titleEl,
    sourceLabelEl,
    sourceMismatchEl,
    readActiveNoteButtonEl,
    onboardingEl,
    onboardingTextEl,
    onboardingDismissButtonEl,
    progressEl,
    stateEl,
    tokenPrefixEl,
    tokenFocusEl,
    tokenSuffixEl,
    emptyStateEl,
    wpmInputEl,
    playPauseButtonEl,
    restartButtonEl,
    stopButtonEl,
    slowerButtonEl,
    fasterButtonEl,
    orpToggleButtonEl,
    typographyLabelEl,
    typographyInputEl,
    typographySliderEl,
    typographyValueEl,
    panelZoomLabelEl,
    panelZoomInputEl,
    panelZoomSliderEl,
    panelZoomValueEl,
    accentToggleButtonEl,
    inNoteHighlightToggleButtonEl,
    inNoteHighlightColorButtonEl,
  };
}

function createButton(
  className: string,
  textContent = "",
  accessibleName = textContent,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = textContent;
  if (accessibleName) {
    button.setAttribute("aria-label", accessibleName);
    button.title = accessibleName;
  }
  return button;
}

function createControlGroup(parentEl: HTMLElement): HTMLElement {
  const groupEl = document.createElement("div");
  groupEl.className = "vault-reader-control-group";
  parentEl.appendChild(groupEl);
  return groupEl;
}

function createControlLabel(textContent: string): HTMLElement {
  const labelEl = document.createElement("span");
  labelEl.className = "vault-reader-control-label";
  labelEl.textContent = textContent;
  return labelEl;
}

function createRangeInput(
  className: string,
  min: number,
  max: number,
  step: number,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "range";
  input.className = className;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  return input;
}

function createNumberInput(
  className: string,
  min: number,
  max: number,
  step: number,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "number";
  input.className = className;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  return input;
}

function createValueOutput(textContent: string): HTMLOutputElement {
  const output = document.createElement("output");
  output.className = "vault-reader-control-value";
  output.textContent = textContent;
  output.setAttribute("aria-live", "polite");
  return output;
}
