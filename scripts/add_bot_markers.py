from pathlib import Path
from typing import List, Optional

ABSTRACT_MARKER = "[comment]: # (mx-abstract)"
SEPARATOR = "[comment]: # (mx-context-auto)"
WEAK_CONTENT_THRESHOLD = 10
DOCS_ROOT = Path(__file__).parent.parent / "docs"


class Context:
    def __init__(self, file: Path, line_index: int):
        self.lines: List[str] = []
        self.file = file
        self.line_index = line_index

    def measure_content(self):
        tokens: List[str] = []

        for line in self.lines:
            tokens.extend(line.split())

        tokens = [token for token in tokens if token != ""]
        return len(tokens)


def main():
    md_files = DOCS_ROOT.rglob("*.md")
    md_files = [
        md_file for md_file in md_files if "node_modules" not in str(md_file) and "README.md" not in str(md_file) and "utils.md" not in str(md_file)]

    all_contexts: List[Context] = []

    for md_file in md_files:
        print("Processing file", md_file)

        input_lines = md_file.read_text().splitlines()
        output_lines: List[str] = []
        state_in_code_block = False

        current_context: Optional[Context] = None

        for _, line in enumerate(input_lines):
            if line.strip() == SEPARATOR:
                continue

            if looks_like_code_block(line):
                state_in_code_block = not state_in_code_block

            is_new_context_before_line = not state_in_code_block and looks_like_header(
                line)
            is_new_context = is_new_context_before_line

            if is_new_context:
                current_context = Context(md_file, len(output_lines))
                all_contexts.append(current_context)

            if is_new_context_before_line:
                output_lines.append(SEPARATOR)
                output_lines.append("")
                output_lines.append(line)
            else:
                output_lines.append(line)

            if current_context:
                current_context.lines.append(line)

        output_lines = strip_duplicate_newlines(output_lines)
        md_file.write_text("\n".join(output_lines + ['']))

    for context in all_contexts:
        score = context.measure_content()
        if score < WEAK_CONTENT_THRESHOLD:
            print(
                f"Warning! context with weak content: {score} on {context.file}:{context.line_index}")

    for md_file in md_files:
        content = md_file.read_text()
        if ABSTRACT_MARKER not in content:
            print("Warning! no abstract marker in", md_file)

    print("Num contexts: ", len(all_contexts))


def looks_like_code_block(line: str):
    return line.startswith("```")


def looks_like_header(line: str):
    return line.startswith("# ") or line.startswith("## ") or line.startswith("### ") or line.startswith("#### ")


def strip_duplicate_newlines(lines: List[str]) -> List[str]:
    output_lines: List[str] = []

    for index, line in enumerate(lines):
        if index == len(lines) - 1:
            output_lines.append(line)
            break

        next_line = lines[index + 1]

        if line.strip() == "" and next_line.strip() == "":
            pass
        else:
            output_lines.append(line)

    return output_lines


if __name__ == "__main__":
    main()
