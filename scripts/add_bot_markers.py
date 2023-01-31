from pathlib import Path
from typing import List, Optional

SEPARATOR = "[comment]: # (mx-context)"
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

        current_context: Optional[Context] = None

        for index, line in enumerate(input_lines):
            if line.strip() == SEPARATOR:
                continue

            is_new_context_before_line = line.startswith("##")
            is_new_context_after_line = line == "---" and index > 0
            is_new_context = is_new_context_before_line or is_new_context_after_line

            if is_new_context:
                current_context = Context(md_file, len(output_lines))
                all_contexts.append(current_context)

            if is_new_context_before_line:
                output_lines.append(SEPARATOR)
                output_lines.append("")
                output_lines.append(line)
            elif is_new_context_after_line:
                output_lines.append(line)
                output_lines.append("")
                output_lines.append(SEPARATOR)
            else:
                if line.strip() == "" and output_lines[-1].strip() == "":
                    continue
                else:
                    output_lines.append(line)

            if current_context:
                current_context.lines.append(line)

        md_file.write_text("\n".join(output_lines + ['']))

    for context in all_contexts:
        score = context.measure_content()
        if score < WEAK_CONTENT_THRESHOLD:
            print(
                f"Warning! context with weak content: {score} on {context.file}:{context.line_index}")

    print("Num contexts: ", len(all_contexts))


if __name__ == "__main__":
    main()
