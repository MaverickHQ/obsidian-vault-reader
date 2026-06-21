import { RangeSetBuilder, StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view";

import type { EditorHighlightRange } from "./source-highlight-map";
import type { ReaderInNoteHighlightColor } from "../settings/vault-reader-data-store";

const setVaultReaderHighlight = StateEffect.define<EditorHighlightRange | null>();
const DEFAULT_HIGHLIGHT_COLOR: ReaderInNoteHighlightColor = "yellow";

const vaultReaderHighlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (value, transaction) => {
    let nextValue = value.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(setVaultReaderHighlight)) {
        nextValue = toDecorationSet(effect.value);
      }
    }

    return nextValue;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const vaultReaderHighlightExtension: Extension = [vaultReaderHighlightField];

export function applyVaultReaderEditorHighlight(
  editorView: EditorView,
  range: EditorHighlightRange | null,
): void {
  if (!hasVaultReaderEditorHighlightExtension(editorView)) {
    if (!range) {
      return;
    }

    editorView.dispatch({
      effects: StateEffect.appendConfig.of(vaultReaderHighlightExtension),
    });
  }

  editorView.dispatch({
    effects: setVaultReaderHighlight.of(range),
  });
}

export function hasVaultReaderEditorHighlightExtension(editorView: EditorView): boolean {
  return editorView.state.field(vaultReaderHighlightField, false) !== undefined;
}

function toDecorationSet(range: EditorHighlightRange | null): DecorationSet {
  if (!range || range.from >= range.to) {
    return Decoration.none;
  }

  const color = toHighlightColor(range.color);
  const builder = new RangeSetBuilder<Decoration>();
  builder.add(
    range.from,
    range.to,
    Decoration.mark({
      class: `vault-reader-editor-highlight vault-reader-editor-highlight-${color}`,
    }),
  );
  return builder.finish();
}

function toHighlightColor(color: EditorHighlightRange["color"]): ReaderInNoteHighlightColor {
  return color === "yellow" || color === "orange" || color === "blue"
    ? color
    : DEFAULT_HIGHLIGHT_COLOR;
}
