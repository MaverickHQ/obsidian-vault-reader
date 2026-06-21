export function normalizeMarkdownToReadingText(markdown: string): string {
  const normalizedNewlines = markdown.replace(/\r\n/g, "\n");
  const withoutFrontmatter = stripLeadingFrontmatter(normalizedNewlines);
  const withoutCodeFenceLines = stripCodeFenceLines(withoutFrontmatter);

  const outputLines: string[] = [];
  for (const rawLine of withoutCodeFenceLines.split("\n")) {
    let line = rawLine;

    if (isReferenceDefinitionLine(line)) {
      continue;
    }

    line = line.replace(/^\s{0,3}(>\s*)+/, "");
    line = line.replace(/^\s*\[![^\]]+\]\s*/, "");
    line = line.replace(/^\s{0,3}#{1,6}\s+/, "");
    line = line.replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, "");
    line = line.replace(/^\s*[-*+]\s+/, "");
    line = line.replace(/^\s*\d+[.)]\s+/, "");

    line = normalizeInlineMarkdown(line);
    line = line.replace(/[ \t]+$/g, "");

    if (isHorizontalRule(line)) {
      outputLines.push("");
      continue;
    }

    outputLines.push(line);
  }

  return collapseAndTrim(outputLines.join("\n"));
}

function stripLeadingFrontmatter(input: string): string {
  if (!input.startsWith("---\n")) {
    return input;
  }

  const match = input.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? input.slice(match[0].length) : input;
}

function stripCodeFenceLines(input: string): string {
  return input.replace(/^[ \t]*(```|~~~)[^\n]*\n?/gm, "");
}

function isReferenceDefinitionLine(line: string): boolean {
  return /^\s*\[[^\]]+\]:\s+\S+/.test(line);
}

function isHorizontalRule(line: string): boolean {
  return /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line);
}

function normalizeInlineMarkdown(line: string): string {
  let result = line;

  result = result.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  result = result.replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1");

  result = result.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2");
  result = result.replace(/\[\[([^\]]+)\]\]/g, "$1");

  result = result.replace(/`([^`]+)`/g, "$1");

  result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");
  result = result.replace(/~~(.*?)~~/g, "$1");
  result = result.replace(
    /(^|[\s([{<"'“‘])\*([^\s*\n](?:[^*\n]*[^\s*\n])?)\*(?=$|[\s)\]}>".,;:!?'"”’])/g,
    "$1$2",
  );
  result = result.replace(/(^|[\s([{<"'“‘])_([^_\n]+)_(?=$|[\s)\]}>".,;:!?'"”’])/g, "$1$2");

  return result;
}

function collapseAndTrim(input: string): string {
  const collapsed = input
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return collapsed;
}
