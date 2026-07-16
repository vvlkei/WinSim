from pathlib import Path
import shutil

ROOT = Path("files").resolve()


def _sanitize(user_path: str) -> Path:
    clean = user_path.lstrip("/")
    resolved = (ROOT / clean).resolve()
    if not str(resolved).startswith(str(ROOT)):
        raise PermissionError("Path traversal denied")
    return resolved


async def list_dir(user_path: str) -> list[dict]:
    target = _sanitize(user_path)
    entries = []
    for entry in sorted(target.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower())):
        stat = entry.stat()
        entries.append({
            "name": entry.name,
            "path": "/" + str(entry.relative_to(ROOT)),
            "type": "directory" if entry.is_dir() else "file",
            "size": stat.st_size if entry.is_file() else None,
        })
    return entries


async def create(user_path: str, is_directory: bool):
    target = _sanitize(user_path)
    if is_directory:
        target.mkdir(parents=True, exist_ok=True)
    else:
        target.write_text("", encoding="utf-8")


async def remove(user_path: str):
    target = _sanitize(user_path)
    if target.is_dir():
        shutil.rmtree(target)
    else:
        target.unlink()


async def rename(user_path: str, new_name: str):
    target = _sanitize(user_path)
    if "/" in new_name or "\\" in new_name:
        raise PermissionError("Invalid name")
    new_path = (target.parent / new_name).resolve()
    if not str(new_path).startswith(str(ROOT)):
        raise PermissionError("Path traversal denied")
    target.rename(new_path)


async def read_file(user_path: str) -> str:
    target = _sanitize(user_path)
    return target.read_text(encoding="utf-8")


async def write_file(user_path: str, content: str):
    target = _sanitize(user_path)
    target.write_text(content, encoding="utf-8")
