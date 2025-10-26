from pathlib import Path
import re

ROOT = Path(r"c:\nnsproject\clinprecision\frontend\clinprecision\src\components")
PATTERN = re.compile(r"(?:\.\./)+services/")
TARGET_SUFFIXES = {".ts", ".tsx", ".js", ".jsx"}

updated_files = 0

for path in ROOT.rglob('*'):
    if path.is_dir() or path.suffix.lower() not in TARGET_SUFFIXES:
        continue
    text = path.read_text(encoding='utf-8')
    new_text = PATTERN.sub('services/', text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        updated_files += 1

print(f"Updated {updated_files} files")
