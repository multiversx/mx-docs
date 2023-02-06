from pathlib import Path
from typing import List

ABSTRACT_MARKER = "[comment]: # (mx-abstract)"
EXCLUDE_FILE_MARKER = "[comment]: # (mx-exclude-file)"
EXCLUDE_CONTEXT_MARKER = "[comment]: # (mx-exclude-context)"
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
        md_file for md_file in md_files if "node_modules" not in str(md_file) and md_file.name not in ["README.md", "utils.md", "pull_request_template.md"]]

    all_contexts: List[Context] = []

    for md_file in md_files:
        print("Processing file", md_file)

        input_content = md_file.read_text()
        input_lines = input_content.splitlines()
        output_lines: List[str] = []
        state_in_code_block = False

        if should_skip_file(input_content):
            continue

        for index, line in enumerate(input_lines):
            one_line_before = input_lines[index -
                                          1].strip() if index > 0 else None
            two_lines_before = input_lines[index -
                                           2].strip() if index > 1 else None

            if line.strip() == SEPARATOR:
                continue

            if line.strip() == ABSTRACT_MARKER:
                output_lines.append(line)
                continue

            if line.strip() == EXCLUDE_CONTEXT_MARKER:
                output_lines.append(line)
                continue

            if looks_like_code_block(line):
                state_in_code_block = not state_in_code_block

            is_new_context = not state_in_code_block and looks_like_header(
                line) and ABSTRACT_MARKER not in [one_line_before, two_lines_before]

            if is_new_context:
                if should_skip_context(one_line_before, two_lines_before):
                    output_lines.append(line)
                    continue
                output_lines.append(SEPARATOR)
                output_lines.append("")
                output_lines.append(line)
            else:
                output_lines.append(line)

        output_lines = strip_duplicate_newlines(output_lines)
        md_file.write_text("\n".join(output_lines + ['']))

    for context in all_contexts:
        score = context.measure_content()
        if score < WEAK_CONTENT_THRESHOLD:
            print(
                f"Warning! context with weak content: {score} on {context.file}:{context.line_index}")

    for md_file in md_files:
        content = md_file.read_text()

        if should_skip_file(content):
            continue

        if ABSTRACT_MARKER not in content:
            print("Warning! no abstract marker in", md_file)


def should_skip_file(file_content: str) -> bool:
    return EXCLUDE_FILE_MARKER in file_content


def should_skip_context(one_line_before: str, two_lines_before: str) -> bool:
    return EXCLUDE_CONTEXT_MARKER in [one_line_before, two_lines_before]


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
