
import re
from typing import Optional

def extract_primary_function_name(code_content: str) -> Optional[str]:
    """
    Extract the first non-private top-level function name from the code.
    """
    match = re.search(r"def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", code_content)
    if not match:
        return None
    name = match.group(1)
    
    if name.startswith("_"):
        for m in re.finditer(r"def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", code_content):
            nm = m.group(1)
            if not nm.startswith("_"):
                return nm
    return name
