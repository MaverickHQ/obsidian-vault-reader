const LEADING_TRIM = /^[([{<"“”'‘’]+/;
const TRAILING_TRIM = /[)\]}>"“”'‘’.,;:!?…]+$/;

export function getOrpIndex(token: string): number {
  const spoken = toOrpWord(token);
  if (spoken.length <= 1) {
    return 0;
  }

  let index: number;
  if (spoken.length <= 5) {
    index = 1;
  } else if (spoken.length <= 9) {
    index = 2;
  } else if (spoken.length <= 13) {
    index = 3;
  } else {
    index = 4;
  }

  return Math.min(index, spoken.length - 1);
}

function toOrpWord(rawToken: string): string {
  const trimmed = rawToken.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const withoutEdges = trimmed.replace(LEADING_TRIM, "").replace(TRAILING_TRIM, "");
  return withoutEdges.length > 0 ? withoutEdges : trimmed;
}
