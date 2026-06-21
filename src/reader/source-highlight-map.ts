import type { ReaderSessionState } from "./reader-controller";
import type { ReadingToken } from "./tokenizer";
import type { ReaderInNoteHighlightColor } from "../settings/vault-reader-data-store";

export interface EditorHighlightRange {
  from: number;
  to: number;
  color?: ReaderInNoteHighlightColor;
}

export interface TokenHighlightRange extends EditorHighlightRange {
  index: number;
}

export type TokenHighlightMap =
  | {
      ok: true;
      sourceKey: string;
      ranges: TokenHighlightRange[];
    }
  | {
      ok: false;
      sourceKey: string;
      reason: "EMPTY_TOKENS" | "INVALID_SOURCE_RANGE" | "TOKEN_RANGE_UNRESOLVED";
      unresolvedTokenIndex?: number;
    };

export interface TokenHighlightMapInput {
  sourceKey: string;
  sourceText: string;
  documentText: string;
  sourceStartOffset: number;
  tokens: ReadingToken[];
}

const ACTIVE_HIGHLIGHT_STATES = new Set<ReaderSessionState>(["READY", "PLAYING", "PAUSED"]);

export function buildTokenHighlightMap(input: TokenHighlightMapInput): TokenHighlightMap {
  if (input.tokens.length === 0) {
    return {
      ok: false,
      sourceKey: input.sourceKey,
      reason: "EMPTY_TOKENS",
    };
  }

  const sourceStartOffset = Math.floor(input.sourceStartOffset);
  const sourceEndOffset = sourceStartOffset + input.sourceText.length;
  if (
    !Number.isFinite(sourceStartOffset) ||
    sourceStartOffset < 0 ||
    sourceEndOffset > input.documentText.length
  ) {
    return {
      ok: false,
      sourceKey: input.sourceKey,
      reason: "INVALID_SOURCE_RANGE",
    };
  }

  const ranges: TokenHighlightRange[] = [];
  let searchOffset = sourceStartOffset;
  for (const token of input.tokens) {
    const range = resolveTokenRange(input.documentText, token, searchOffset, sourceEndOffset);
    if (!range) {
      return {
        ok: false,
        sourceKey: input.sourceKey,
        reason: "TOKEN_RANGE_UNRESOLVED",
        unresolvedTokenIndex: token.index,
      };
    }

    ranges.push({
      index: token.index,
      ...range,
    });
    searchOffset = range.to;
  }

  return {
    ok: true,
    sourceKey: input.sourceKey,
    ranges,
  };
}

export function resolveTokenHighlightRange(
  map: TokenHighlightMap,
  state: ReaderSessionState,
  currentIndex: number,
): EditorHighlightRange | null {
  if (!map.ok || !ACTIVE_HIGHLIGHT_STATES.has(state)) {
    return null;
  }

  const range = map.ranges.find((candidate) => candidate.index === currentIndex);
  if (!range || range.from >= range.to) {
    return null;
  }

  return {
    from: range.from,
    to: range.to,
  };
}

function resolveTokenRange(
  documentText: string,
  token: ReadingToken,
  searchOffset: number,
  sourceEndOffset: number,
): EditorHighlightRange | null {
  const candidates = uniqueCandidates([token.raw, token.spoken]);
  for (const candidate of candidates) {
    const from = documentText.indexOf(candidate, searchOffset);
    if (from < 0) {
      continue;
    }

    const to = from + candidate.length;
    if (to <= sourceEndOffset) {
      return {
        from,
        to,
      };
    }
  }

  return null;
}

function uniqueCandidates(candidates: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const candidate of candidates) {
    if (candidate.length === 0 || seen.has(candidate)) {
      continue;
    }

    seen.add(candidate);
    unique.push(candidate);
  }

  return unique;
}
