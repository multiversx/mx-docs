// parser.ts — extract fenced code blocks from a Markdown / MDX string.
//
// This is the TypeScript counterpart of ../extract-tutorial-code/src/parser.rs
// (the Rust tutorial CI). It keeps the same idea and the same fence-info
// convention, so a maintainer who knows the Rust one already knows this one:
//
//   ```ts title="src/main.ts"     -> language "ts",  title "src/main.ts"
//   ```rust filename="Cargo.toml"  -> language "rust", title "Cargo.toml"
//   ```Cargo.toml                  -> title "Cargo.toml", language "toml"
//
// The Rust version leans on the `pulldown-cmark` CommonMark parser. We only need
// fenced code blocks (never indented ones, never inline code) out of our own
// recipe MDX, which is authored to a fixed convention, so a small, dependency-
// free line scanner is enough — and keeps the extractor install-light.

export interface CodeBlock {
  /** The `title=`/`filename=` value, or a bare `foo.ext` info string. */
  title?: string;
  /** The first info-string token (e.g. "ts", "tsx", "bash"). */
  language?: string;
  /** The verbatim code between the fences (trailing newline preserved). */
  content: string;
}

/** Matches an opening or closing fence line: 3+ backticks or 3+ tildes. */
const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/;

/**
 * Extract every fenced code block from a Markdown / MDX document.
 *
 * YAML frontmatter (a leading `---` … `---` block) is stripped first so its
 * contents can never be mistaken for fences.
 */
export function extractCodeBlocksFromMarkdown(markdown: string): CodeBlock[] {
  const lines = stripFrontmatter(markdown).split(/\r?\n/);
  const blocks: CodeBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const open = lines[i]!.match(FENCE_RE);
    if (!open) {
      i += 1;
      continue;
    }

    // An opening fence. Remember its exact marker so we only close on a fence
    // of the same character and at least the same length (CommonMark rule).
    const fenceChar = open[2]![0]!;
    const fenceLen = open[2]!.length;
    const info = open[3]!.trim();

    const contentLines: string[] = [];
    i += 1;
    while (i < lines.length) {
      const close = lines[i]!.match(FENCE_RE);
      const isClose =
        close !== null &&
        close[3]!.trim() === "" &&
        close[2]![0] === fenceChar &&
        close[2]!.length >= fenceLen;
      if (isClose) {
        break;
      }
      contentLines.push(lines[i]!);
      i += 1;
    }

    if (i >= lines.length) {
      throw new Error(
        `Unclosed ${fenceChar.repeat(fenceLen)} code fence opened on line ${
          i - contentLines.length
        }.`,
      );
    }

    const { language, title } = parseCodeBlockInfo(info);
    blocks.push({
      ...(title !== undefined ? { title } : {}),
      ...(language !== undefined ? { language } : {}),
      // Re-join with a trailing newline so extracted files end cleanly.
      content: contentLines.length > 0 ? contentLines.join("\n") + "\n" : "",
    });

    i += 1; // step over the closing fence
  }

  return blocks;
}

/**
 * Parse a fence info string into { language, title }.
 *
 * Mirrors `parse_code_block_info` in parser.rs, including the `foo.ext`
 * shorthand where the first token is itself a filename.
 */
export function parseCodeBlockInfo(info: string): {
  language?: string;
  title?: string;
} {
  if (info === "") {
    return {};
  }

  const firstWhitespace = info.search(/\s/);
  const first = firstWhitespace === -1 ? info : info.slice(0, firstWhitespace);
  const attributes = firstWhitespace === -1 ? "" : info.slice(firstWhitespace).trim();

  let language: string | undefined;
  let title: string | undefined;

  // A first token that looks like a filename (`foo.ext`) is treated as the
  // title, and the extension becomes the language — same as the Rust parser.
  if (
    first.includes(".") &&
    !first.startsWith("title=") &&
    !first.startsWith("filename=")
  ) {
    title = first;
    const ext = first.split(".").at(-1);
    if (ext) {
      language = ext;
    }
  } else {
    language = first;
  }

  if (attributes !== "") {
    const attributePattern =
      /(?:^|\s+)(title|filename)=(?:"([^"]*)"|'([^']*)'|([^\s"']*))/gy;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = attributePattern.exec(attributes)) !== null) {
      if (match.index !== cursor) {
        throw new Error(`Malformed code fence info string: ${info}`);
      }
      if (title !== undefined) {
        throw new Error(`Multiple file titles in code fence info string: ${info}`);
      }
      title = match[2] ?? match[3] ?? match[4] ?? "";
      cursor = attributePattern.lastIndex;
    }

    if (cursor !== attributes.length) {
      throw new Error(`Malformed code fence info string: ${info}`);
    }
  }

  return {
    ...(language !== undefined ? { language } : {}),
    ...(title !== undefined ? { title } : {}),
  };
}

/** Drop a leading YAML frontmatter block (`---` … `---`) if present. */
function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) {
    return markdown;
  }
  const lines = markdown.split(/\r?\n/);
  // lines[0] is the opening "---"; find the next closing "---".
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i]!.trim() === "---") {
      return lines.slice(i + 1).join("\n");
    }
  }
  return markdown;
}
