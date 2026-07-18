from pathlib import Path
from datetime import datetime
import shutil

ROOT = Path("files").resolve()
TRASH_DIR = ROOT / "trash"


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
    TRASH_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    trash_name = f"{ts}_{target.name}"
    trash_path = TRASH_DIR / trash_name
    rel_path = str(target.relative_to(ROOT))
    target.rename(trash_path)
    (TRASH_DIR / f"{trash_name}.meta").write_text(rel_path, encoding="utf-8")


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


async def list_trash() -> list[dict]:
    TRASH_DIR.mkdir(exist_ok=True)
    entries = []
    for f in sorted(TRASH_DIR.iterdir(), key=lambda e: e.stat().st_mtime, reverse=True):
        if f.suffix == ".meta":
            continue
        meta = TRASH_DIR / f"{f.name}.meta"
        original = meta.read_text(encoding="utf-8") if meta.exists() else ""
        stat = f.stat()
        entries.append({
            "name": f.name,
            "original_path": "/" + original if original else "",
            "type": "directory" if f.is_dir() else "file",
            "size": stat.st_size if f.is_file() else None,
        })
    return entries


async def restore_from_trash(trash_name: str):
    trash_path = TRASH_DIR / trash_name
    if not trash_path.exists():
        raise FileNotFoundError("Not found in trash")
    meta = TRASH_DIR / f"{trash_name}.meta"
    if meta.exists():
        original = meta.read_text(encoding="utf-8")
        target = (ROOT / original).resolve()
        if not str(target).startswith(str(ROOT)):
            raise PermissionError("Path traversal denied")
        target.parent.mkdir(parents=True, exist_ok=True)
        trash_path.rename(target)
        meta.unlink()
    else:
        target = ROOT / "home" / trash_name
        trash_path.rename(target)


async def empty_trash():
    TRASH_DIR.mkdir(exist_ok=True)
    for f in TRASH_DIR.iterdir():
        if f.is_dir():
            shutil.rmtree(f)
        else:
            f.unlink()
