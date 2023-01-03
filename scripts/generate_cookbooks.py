import json
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple

DIRECTIVE_BEGIN_NOTEBOOK = "BEGIN_NOTEBOOK"
DIRECTIVE_END_NOTEBOOK = "END_NOTEBOOK"
DOCS_ROOT = Path(__file__).parent.parent / "docs"
DOCS_URL_ROOT = "https://docs.elrond.com"


cookbooks: List[Path] = [
    DOCS_ROOT / "sdk-and-tools/erdpy/erdpy-cookbook.md",
]


def main():
    for path in cookbooks:
        should_copy = True
        input_lines = read_lines(path)
        output_lines: List[str] = []

        for line in input_lines:
            if DIRECTIVE_BEGIN_NOTEBOOK in line:
                output_lines.append(line)
                should_copy = False

                begin_directive = parse_directive(line)
                notebook_url = begin_directive["url"]
                render_notebook(notebook_url, output_lines)
            elif DIRECTIVE_END_NOTEBOOK in line:
                output_lines.append(line)
                should_copy = True
            else:
                if should_copy:
                    output_lines.append(line)

        write_lines(path, output_lines)


def parse_directive(line: str) -> Dict[str, Any]:
    content = line.replace("<!--", "").replace("-->", "").strip()
    [_, payload_json] = content.split(maxsplit=1)
    payload = json.loads(payload_json)
    return payload


def render_notebook(url: str, output_lines: List[str]):
    cells, _ = fetch_notebook(url)

    for cell in cells:
        cell_type = cell["cell_type"]
        cell_source = cell["source"]

        if cell_type == "markdown":
            for item in cell_source:
                item = item.replace(DOCS_URL_ROOT + "/", "/")
                output_lines.append("\n")
                output_lines.append(item.rstrip())
        elif cell_type == "code":
            output_lines.append("\n```\n")

            for item in cell_source:
                output_lines.append(item)

            output_lines.append("\n```")

        output_lines.append("\n")


def read_lines(path: Path) -> List[str]:
    with open(path) as f:
        return f.readlines()


def write_lines(path: Path, lines: List[str]):
    with open(path, "w") as f:
        f.writelines(lines)


def fetch_notebook(url: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    response = urllib.request.urlopen(url)
    data_bytes = response.read()
    data = json.loads(data_bytes.decode())

    return data["cells"], data["metadata"]


if __name__ == "__main__":
    main()
