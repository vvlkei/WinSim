from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from utils import file_system as fs

router = APIRouter()


class CreateRequest(BaseModel):
    path: str
    isDirectory: bool = False


class RenameRequest(BaseModel):
    path: str
    newName: str


class WriteRequest(BaseModel):
    path: str
    content: str = ""


class RestoreRequest(BaseModel):
    name: str


@router.get("")
async def list_files(path: str = Query("/home")):
    try:
        return await fs.list_dir(path)
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except FileNotFoundError:
        return []
    except OSError as e:
        raise HTTPException(500, str(e))


@router.get("/read")
async def read_file(path: str = Query(...)):
    try:
        content = await fs.read_file(path)
        return {"content": content}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "File not found")
    except OSError as e:
        raise HTTPException(500, str(e))


@router.post("")
async def create_entry(body: CreateRequest):
    try:
        await fs.create(body.path, body.isDirectory)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except OSError as e:
        raise HTTPException(500, str(e))


@router.delete("")
async def delete_entry(path: str = Query(...)):
    try:
        await fs.remove(path)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "Not found")
    except OSError as e:
        raise HTTPException(500, str(e))


@router.put("/rename")
async def rename_entry(body: RenameRequest):
    try:
        await fs.rename(body.path, body.newName)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except OSError as e:
        raise HTTPException(500, str(e))


@router.put("/write")
async def write_entry(body: WriteRequest):
    try:
        await fs.write_file(body.path, body.content)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except OSError as e:
        raise HTTPException(500, str(e))


@router.get("/trash")
async def list_trash():
    try:
        return await fs.list_trash()
    except OSError as e:
        raise HTTPException(500, str(e))


@router.post("/trash/restore")
async def restore_item(body: RestoreRequest):
    try:
        await fs.restore_from_trash(body.name)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "Not found")
    except OSError as e:
        raise HTTPException(500, str(e))


@router.delete("/trash")
async def empty_trash():
    try:
        await fs.empty_trash()
        return {"success": True}
    except OSError as e:
        raise HTTPException(500, str(e))
