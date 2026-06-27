import type { ReadingSource } from "./source-resolver";

export type ReadingSourceKeyInput = Pick<
  ReadingSource,
  "kind" | "filePath" | "text" | "selectionRangeKey" | "selectionContextKey"
> &
  Partial<Pick<ReadingSource, "highlightStartOffset">>;

export function buildReadingSourceKey(source: ReadingSourceKeyInput): string {
  if (source.kind === "editor-selection") {
    const normalizedSelection = source.text.replace(/\r\n/g, "\n");
    const selectionHash = hashStringFNV1a(normalizedSelection);
    const selectionScopeKey = source.selectionRangeKey
      ? `range:${source.selectionRangeKey}`
      : source.selectionContextKey
        ? `context:${source.selectionContextKey}`
        : isFiniteNumber(source.highlightStartOffset)
          ? `offset:${Math.max(0, Math.floor(source.highlightStartOffset))}`
          : "context:unknown";
    return `${source.filePath}::selection::${selectionScopeKey}::${normalizedSelection.length}:${selectionHash}`;
  }

  return source.filePath;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hashStringFNV1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
