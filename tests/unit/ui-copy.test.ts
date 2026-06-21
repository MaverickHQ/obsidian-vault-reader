import { describe, expect, it } from "vitest";

import { VAULT_READER_COPY, getStartReaderSessionFailureMessage } from "../../src/ui/copy";

describe("Vault Reader user-facing copy", () => {
  it("uses discoverable launch wording that does not require RSVP jargon", () => {
    expect(VAULT_READER_COPY.commands.startNoteSessionName).toBe(
      "Vault Reader: Start reading current note",
    );
    expect(VAULT_READER_COPY.commands.restartCurrentNoteName).toBe(
      "Vault Reader: Restart current note from beginning",
    );
    expect(VAULT_READER_COPY.commands.togglePlayPauseName).toBe("Vault Reader: Toggle play/pause");
    expect(VAULT_READER_COPY.commands.startNoteSessionName).not.toMatch(/\bRSVP\b/i);
  });

  it("gives actionable first-run guidance in the empty reader state", () => {
    expect(VAULT_READER_COPY.reader.emptyState).toContain(
      "Open a note, then run Vault Reader: Start reading current note.",
    );
    expect(VAULT_READER_COPY.reader.emptyState).toContain("Space");
    expect(VAULT_READER_COPY.reader.emptyState).toContain("Note Highlight");
    expect(VAULT_READER_COPY.reader.onboardingHint).toContain("Play or pause");
    expect(VAULT_READER_COPY.reader.onboardingHint).toContain("Restart");
    expect(VAULT_READER_COPY.reader.onboardingHint).not.toMatch(/\b(AI|device|paid|telemetry)\b/i);
    expect(VAULT_READER_COPY.reader.restartUnavailable).toBe(
      "Open Vault Reader from a note before using the restart command.",
    );
  });

  it("maps startup failures to one next-step message each", () => {
    expect(getStartReaderSessionFailureMessage("NO_ACTIVE_FILE")).toBe(
      "Open a note, then run Vault Reader: Start reading current note.",
    );
    expect(getStartReaderSessionFailureMessage("EMPTY_SOURCE_TEXT")).toBe(
      "This note has no readable text yet. Add content, or open another note and start Vault Reader again.",
    );
    expect(getStartReaderSessionFailureMessage("TOKENIZATION_EMPTY")).toBe(
      "Vault Reader could not find readable words in this source. Try selecting normal note text.",
    );
    expect(getStartReaderSessionFailureMessage("VIEW_UNAVAILABLE")).toBe(
      "Vault Reader could not open the reader panel. Try reopening Obsidian and starting again.",
    );
  });
});
