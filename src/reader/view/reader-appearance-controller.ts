import type {
  ReaderAccentTheme,
  ReaderInNoteHighlightColor,
  VaultReaderSettings,
} from "../../settings/vault-reader-data-store";

export const CLAUDE_ORANGE_FOCUS_COLOR = "#D97757";

export function applyReaderVisualSettings(
  contentEl: HTMLElement,
  settings: VaultReaderSettings,
): void {
  const tokenSizePx = Math.round(42 * (settings.typographyScale / 100));
  contentEl.style.setProperty("--vault-reader-token-size", `${tokenSizePx}px`);
  contentEl.setAttribute("data-presentation-mode", settings.presentationMode);
  contentEl.setAttribute("data-accent-theme", settings.accentTheme);

  if (settings.accentTheme === "claude-orange") {
    contentEl.style.setProperty("--vault-reader-focus-color", CLAUDE_ORANGE_FOCUS_COLOR);
    return;
  }

  contentEl.style.removeProperty("--vault-reader-focus-color");
}

export function nextAccentTheme(current: ReaderAccentTheme): ReaderAccentTheme {
  return current === "blue" ? "claude-orange" : "blue";
}

export function nextInNoteHighlightColor(
  current: ReaderInNoteHighlightColor,
): ReaderInNoteHighlightColor {
  switch (current) {
    case "yellow":
      return "orange";
    case "orange":
      return "blue";
    case "blue":
    default:
      return "yellow";
  }
}
