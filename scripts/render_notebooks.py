import json
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Tuple

DIRECTIVE_BEGIN_NOTEBOOK = "BEGIN_NOTEBOOK"
DIRECTIVE_END_NOTEBOOK = "END_NOTEBOOK"
DOCS_ROOT = Path(__file__).parent.parent / "docs"
DOCS_URL_ROOT = "https://docs.multiversx.com"


cookbooks: List[Path] = [
    DOCS_ROOT / "sdk-and-tools/sdk-py/sdk-py-cookbook.md",
]


def main():
    for path in cookbooks:
        render_notebooks_into_file(path)


def render_notebooks_into_file(path: Path):
    should_copy_input_to_output = True
    input_lines = read_lines(path)
    output_lines: List[str] = []

    for line in input_lines:
        if DIRECTIVE_BEGIN_NOTEBOOK in line:
            output_lines.append(line)

            begin_directive = parse_directive(line)
            notebook_url = begin_directive["url"]
            render_notebook(notebook_url, output_lines)

            should_copy_input_to_output = False
        elif DIRECTIVE_END_NOTEBOOK in line:
            output_lines.append(line)
            should_copy_input_to_output = True
        else:
            if should_copy_input_to_output:
                output_lines.append(line)

    write_lines(path, output_lines)


def parse_directive(line: str) -> Dict[str, Any]:
    """
    Parses "directives", such as:

    <!-- BEGIN_NOTEBOOK { "url": "https://raw.githubusercontent.com/multiversx/.../Cookbook.ipynb" } -->
    """
    content = line.replace("<!--", "").replace("-->", "").strip()
    [_, payload_json] = content.split(maxsplit=1)
    payload = json.loads(payload_json)
    return payload


def render_notebook(url: str, output: List[str]):
    cells, _ = fetch_notebook(url)

    for cell in cells:
        cell_type = cell["cell_type"]
        cell_source = cell["source"]

        if cell_type == "markdown":
            render_cell_markdown(cell_source, output)
        elif cell_type == "code":
            render_cell_code(cell_source, output)

        output.append("\n")


def render_cell_markdown(source: List[str], output: List[str]):
    for item in source:
        item = item.replace(DOCS_URL_ROOT + "/", "/")
        output.append("\n")
        output.append(item.rstrip())


def render_cell_code(source: List[str], output: List[str]):
    output.append("\n```\n")

    for item in source:
        output.append(item)

    output.append("\n```")


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
