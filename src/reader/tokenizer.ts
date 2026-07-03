import { getOrpIndex } from "./orp-engine";

export type TokenPauseClass = "none" | "clause" | "sentence" | "paragraph";

export interface ReadingToken {
  index: number;
  raw: string;
  spoken: string;
  orpIndex: number;
  trailingPunctuation: string;
  pauseClass: TokenPauseClass;
  pauseMultiplier: number;
  sourceStart: number;
  sourceEnd: number;
}

const TOKEN_WITH_SPACING = /(\S+)(\s*)/g;
const LEADING_PUNCTUATION = /^[([{<"“”'‘’.,;:!?…]+/;
const TRAILING_PUNCTUATION = /([,;:!?.…]+[)\]}>"'”’]*)$/;
const TRAILING_EDGE_PUNCTUATION = /[)\]}>"“”'‘’.,;:!?…]+$/;

export function tokenizeReadingText(input: string): ReadingToken[] {
  const normalized = input.replace(/\r\n/g, "\n");
  const tokens: ReadingToken[] = [];

  let tokenMatch: RegExpExecArray | null = TOKEN_WITH_SPACING.exec(normalized);
  while (tokenMatch) {
    const raw = tokenMatch[1] ?? "";
    const trailingWhitespace = tokenMatch[2] ?? "";
    const sourceStart = tokenMatch.index;
    const sourceEnd = sourceStart + raw.length;

    const spoken = toSpokenToken(raw);
    const trailingPunctuation = getTrailingPunctuation(raw);
    const pauseClass = classifyPause(trailingPunctuation, trailingWhitespace);

    tokens.push({
      index: tokens.length,
      raw,
      spoken,
      orpIndex: getOrpIndex(spoken),
      trailingPunctuation,
      pauseClass,
      pauseMultiplier: pauseMultiplierForClass(pauseClass),
      sourceStart,
      sourceEnd,
    });

    tokenMatch = TOKEN_WITH_SPACING.exec(normalized);
  }

  return tokens;
}

function toSpokenToken(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const withoutLeading = trimmed.replace(LEADING_PUNCTUATION, "");
  const withoutEdges = withoutLeading.replace(TRAILING_EDGE_PUNCTUATION, "");

  if (withoutEdges.length > 0) {
    return withoutEdges;
  }

  if (withoutLeading.length > 0) {
    return withoutLeading;
  }

  return trimmed;
}

function getTrailingPunctuation(raw: string): string {
  const match = raw.match(TRAILING_PUNCTUATION);
  return match?.[1] ?? "";
}

function classifyPause(trailingPunctuation: string, trailingWhitespace: string): TokenPauseClass {
  if (trailingWhitespace.includes("\n\n")) {
    return "paragraph";
  }

  if (/[.!?…]/.test(trailingPunctuation)) {
    return "sentence";
  }

  if (/[,;:]/.test(trailingPunctuation)) {
    return "clause";
  }

  return "none";
}

function pauseMultiplierForClass(pauseClass: TokenPauseClass): number {
  switch (pauseClass) {
    case "clause":
      return 1.35;
    case "sentence":
      return 1.75;
    case "paragraph":
      return 2.2;
    default:
      return 1;
  }
}
