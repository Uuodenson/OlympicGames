import os
from pathlib import Path

PARENT_DIR = Path(__file__).parent


def create_js_file(txt_file_path, js_file_path):
    """Creates a JavaScript file with an object containing properties from a text file.

    Args:
      txt_file_path: The path to the text file.
      js_file_path: The path to the output JavaScript file.
    """

    with open(txt_file_path, 'r') as f:
        lines = f.readlines()

    content = ""
    for line in lines:
        line = line.strip()
        if line:
            property_name = line.replace(".", "_")
            content += f"{property_name}: '{line}',\n"

    js_code = "const obj ="+"{"+content+"}"

    with open(js_file_path, 'w') as f:
        f.write(js_code)


# Example usage
txt_file_path = PARENT_DIR / "input.txt"
js_file_path = PARENT_DIR / "output.js"
create_js_file(txt_file_path, js_file_path)
