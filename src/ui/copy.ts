export type StartReaderSessionFailureCode =
  | "NO_ACTIVE_FILE"
  | "EMPTY_SOURCE_TEXT"
  | "READ_FAILED"
  | "TOKENIZATION_EMPTY"
  | "VIEW_UNAVAILABLE";

export const VAULT_READER_COPY = {
  commands: {
    startNoteSessionName: "Vault Reader: Start reading current note",
    restartCurrentNoteName: "Vault Reader: Restart current note from beginning",
    togglePlayPauseName: "Vault Reader: Toggle play/pause",
  },
  reader: {
    onboardingHint:
      "Play or pause, adjust WPM, toggle Note Highlight, or use Restart to begin again from the top.",
    emptyState:
      "Open a note, then run Vault Reader: Start reading current note. Use Space to play or pause, Esc to stop, arrow keys to adjust speed, and Note Highlight to follow along in the source note.",
    highlightUnavailable:
      "Vault Reader could not highlight this note exactly; playback will continue in the reader panel.",
    restartUnavailable: "Open Vault Reader from a note before using the restart command.",
    toggleUnavailable: "Open Vault Reader from a note before using the play/pause command.",
  },
  session: {
    noActiveFile: "Open a note, then run Vault Reader: Start reading current note.",
    emptySource:
      "This note has no readable text yet. Add content, or open another note and start Vault Reader again.",
    readFailed:
      "Vault Reader could not read this note from disk. Try reopening the note or checking file permissions.",
    tokenizationEmpty:
      "Vault Reader could not find readable words in this source. Try selecting normal note text.",
    viewUnavailable:
      "Vault Reader could not open the reader panel. Try reopening Obsidian and starting again.",
  },
} as const;

export function getStartReaderSessionFailureMessage(code: StartReaderSessionFailureCode): string {
  switch (code) {
    case "NO_ACTIVE_FILE":
      return VAULT_READER_COPY.session.noActiveFile;
    case "EMPTY_SOURCE_TEXT":
      return VAULT_READER_COPY.session.emptySource;
    case "READ_FAILED":
      return VAULT_READER_COPY.session.readFailed;
    case "TOKENIZATION_EMPTY":
      return VAULT_READER_COPY.session.tokenizationEmpty;
    case "VIEW_UNAVAILABLE":
      return VAULT_READER_COPY.session.viewUnavailable;
  }
}
