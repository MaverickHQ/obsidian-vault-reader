import type { ReaderSnapshot, ReaderSessionState } from "../reader-controller";
import { setDisabledIfChanged, setTextContentIfChanged, setValueIfChanged } from "../dom-writes";
import { buildOrpRenderParts, buildReaderProgress } from "../reader-view-model";
import type { SourceHighlightState } from "../source-highlight-state";
import type { ReadingToken } from "../tokenizer";
import type {
  ReaderAccentTheme,
  ReaderInNoteHighlightColor,
  VaultReaderSettings,
} from "../../settings/vault-reader-data-store";
import { VAULT_READER_COPY } from "../../ui/copy";
import type { ReaderViewElements } from "./reader-view-elements";

export interface ReaderViewRenderInput {
  elements: ReaderViewElements;
  sessionTitle: string;
  sessionSourceKey?: string | null;
  activeSourceKey?: string | null;
  canReadActiveSource?: boolean;
  snapshot: ReaderSnapshot;
  settings: VaultReaderSettings;
  resolvedPanelZoom: number;
  token: ReadingToken | null;
  sourceHighlightState?: SourceHighlightState;
}

export function renderReaderViewSnapshot(input: ReaderViewRenderInput): void {
  const {
    elements,
    sessionTitle,
    sessionSourceKey,
    activeSourceKey,
    canReadActiveSource,
    snapshot,
    settings,
    resolvedPanelZoom,
    token,
    sourceHighlightState,
  } = input;

  setTextContentIfChanged(elements.titleEl, sessionTitle);
  setTextContentIfChanged(
    elements.sourceLabelEl,
    toSourceLabel(sessionTitle, sessionSourceKey ?? null),
  );
  const sourceMismatch = hasActiveSourceMismatch(sessionSourceKey ?? null, activeSourceKey ?? null);
  elements.sourceMismatchEl.hidden = !sourceMismatch;
  setDisabledIfChanged(
    elements.readActiveNoteButtonEl,
    !sourceMismatch || canReadActiveSource !== true,
  );
  elements.onboardingEl.hidden = settings.onboardingDismissed;
  setTextContentIfChanged(elements.onboardingTextEl, VAULT_READER_COPY.reader.onboardingHint);

  const progress = buildReaderProgress(snapshot.currentIndex, snapshot.tokenCount);
  setTextContentIfChanged(elements.progressEl, `Progress ${progress.label} (${progress.percent}%)`);
  setTextContentIfChanged(elements.stateEl, toStateLabel(snapshot));
  setValueIfChanged(elements.wpmInputEl, String(snapshot.wpm));
  setTextContentIfChanged(elements.orpToggleButtonEl, settings.orpEnabled ? "ORP On" : "ORP Off");
  setTextContentIfChanged(elements.accentToggleButtonEl, toAccentLabel(settings.accentTheme));
  setTextContentIfChanged(
    elements.inNoteHighlightToggleButtonEl,
    toInNoteHighlightToggleLabel(settings.inNoteHighlightEnabled, sourceHighlightState),
  );
  setTextContentIfChanged(
    elements.inNoteHighlightColorButtonEl,
    toInNoteHighlightColorLabel(settings.inNoteHighlightColor),
  );
  setValueIfChanged(elements.typographyInputEl, String(settings.typographyScale));
  setValueIfChanged(elements.typographySliderEl, String(settings.typographyScale));
  setValueIfChanged(elements.panelZoomInputEl, String(resolvedPanelZoom));
  setValueIfChanged(elements.panelZoomSliderEl, String(resolvedPanelZoom));
  setPercentValueText(
    elements.typographyValueEl,
    elements.typographySliderEl,
    settings.typographyScale,
  );
  setPercentValueText(elements.panelZoomValueEl, elements.panelZoomSliderEl, resolvedPanelZoom);
  setTextContentIfChanged(elements.playPauseButtonEl, toPrimaryActionLabel(snapshot.state));
  setDisabledIfChanged(elements.restartButtonEl, !canRestart(snapshot));
  setDisabledIfChanged(elements.stopButtonEl, snapshot.state === "IDLE");
  elements.emptyStateEl.hidden = token !== null || snapshot.state !== "IDLE";
  setTextContentIfChanged(elements.emptyStateEl, VAULT_READER_COPY.reader.emptyState);

  if (!token) {
    setTextContentIfChanged(elements.tokenPrefixEl, "");
    setTextContentIfChanged(elements.tokenFocusEl, "");
    setTextContentIfChanged(elements.tokenSuffixEl, "");
    return;
  }

  const parts = settings.orpEnabled
    ? buildOrpRenderParts(token.spoken, token.orpIndex)
    : {
        prefix: "",
        focus: "",
        suffix: token.spoken,
      };
  setTextContentIfChanged(elements.tokenPrefixEl, parts.prefix);
  setTextContentIfChanged(elements.tokenFocusEl, parts.focus);
  setTextContentIfChanged(elements.tokenSuffixEl, parts.suffix);
}

function toSourceLabel(sessionTitle: string, sourceKey: string | null): string {
  if (!sourceKey) {
    return "No note loaded";
  }

  return `Reading: ${sessionTitle}`;
}

function hasActiveSourceMismatch(
  sessionSourceKey: string | null,
  activeSourceKey: string | null,
): boolean {
  if (!sessionSourceKey || !activeSourceKey) {
    return false;
  }

  return toBaseSourceKey(sessionSourceKey) !== toBaseSourceKey(activeSourceKey);
}

function toBaseSourceKey(sourceKey: string): string {
  return sourceKey.split("::selection::", 1)[0] ?? sourceKey;
}

function toPrimaryActionLabel(state: ReaderSessionState): string {
  switch (state) {
    case "PLAYING":
      return "Pause";
    case "PAUSED":
      return "Resume";
    case "COMPLETE":
      return "Replay";
    default:
      return "Play";
  }
}

function canRestart(snapshot: ReaderSnapshot): boolean {
  return snapshot.sourceKey !== null && snapshot.tokenCount > 0 && snapshot.state !== "ERROR";
}

function toStateLabel(snapshot: ReaderSnapshot): string {
  if (snapshot.state === "ERROR" && snapshot.errorMessage) {
    return `ERROR: ${snapshot.errorMessage}`;
  }
  return `${snapshot.state} at ${snapshot.wpm} WPM`;
}

function toAccentLabel(theme: ReaderAccentTheme): string {
  return theme === "claude-orange" ? "Accent Orange" : "Accent Blue";
}

function toInNoteHighlightToggleLabel(
  enabled: boolean,
  state: SourceHighlightState | undefined,
): string {
  if (!enabled || state?.status === "disabled") {
    return "Note Highlight Off";
  }

  switch (state?.status) {
    case "active":
      return "Note Highlight Active";
    case "ready":
      return "Note Highlight Ready";
    case "unavailable":
      return "Note Highlight Unavailable";
    default:
      return "Note Highlight On";
  }
}

function toInNoteHighlightColorLabel(color: ReaderInNoteHighlightColor): string {
  switch (color) {
    case "orange":
      return "Highlight Orange";
    case "blue":
      return "Highlight Blue";
    case "yellow":
    default:
      return "Highlight Yellow";
  }
}

function setPercentValueText(
  valueEl: HTMLOutputElement,
  sliderEl: HTMLInputElement,
  value: number,
): void {
  const label = `${value}%`;
  setTextContentIfChanged(valueEl, label);
  sliderEl.setAttribute("aria-valuetext", label);
}
