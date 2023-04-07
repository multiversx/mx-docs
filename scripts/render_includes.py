import json
import urllib.request
from pathlib import Path
from typing import Any, Dict, List

DIRECTIVE_BEGIN_INCLUDE_FILE = "BEGIN_INCLUDE_FILE"
DIRECTIVE_END_INCLUDE_FILE = "END_INCLUDE_FILE"
DOCS_ROOT = Path(__file__).parent.parent / "docs"

doc_pages_of_interest: List[Path] = [
    DOCS_ROOT / "sdk-and-tools/sdk-js/sdk-js-cookbook.md"
]


def main():
    for path in doc_pages_of_interest:
        input_content = path.read_text()
        input_lines = input_content.splitlines()
        output_lines = remove_content_between_include_directives(input_lines)
        output_lines = render_inline_includes(output_lines)
        output_lines.append("")

        output_content = "\n".join(output_lines)
        path.write_text(output_content)


def remove_content_between_include_directives(input_lines: List[str]) -> List[str]:
    output_lines: List[str] = []
    should_copy_input_to_output = True

    for line in input_lines:
        if DIRECTIVE_BEGIN_INCLUDE_FILE in line:
            output_lines.append(line)
            should_copy_input_to_output = False
        elif DIRECTIVE_END_INCLUDE_FILE in line:
            output_lines.append(line)
            should_copy_input_to_output = True
        else:
            if should_copy_input_to_output:
                output_lines.append(line)

    return output_lines


def render_inline_includes(input_lines: List[str]) -> List[str]:
    output_lines: List[str] = []

    for line in input_lines:
        if DIRECTIVE_BEGIN_INCLUDE_FILE in line:
            output_lines.append(line)

            begin_directive = parse_directive(line)
            file_url = begin_directive["url"]
            lines_to_include = fetch_lines_to_include(file_url)

            output_lines.extend(lines_to_include)
            output_lines.append("")
        else:
            output_lines.append(line)

    return output_lines


def parse_directive(line: str) -> Dict[str, Any]:
    """
    Parses "directives", such as:

    <!-- BEGIN_INCLUDE_FILE { "url": "https://raw.githubusercontent.com/multiversx/.../part.md" } -->
    """
    content = line.replace("<!--", "").replace("-->", "").strip()
    [_, payload_json] = content.split(maxsplit=1)
    payload = json.loads(payload_json)
    return payload


def fetch_lines_to_include(url: str) -> List[str]:
    response = urllib.request.urlopen(url)
    data_bytes = response.read()
    data = data_bytes.decode("utf-8")
    lines = data.splitlines()
    return lines


if __name__ == "__main__":
    main()
