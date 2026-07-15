from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from utils import file_system as fs

router = APIRouter()


class CreateRequest(BaseModel):
    path: str
    isDirectory: bool = False


class DeleteRequest(BaseModel):
    path: str


class RenameRequest(BaseModel):
    path: str
    newName: str


class WriteRequest(BaseModel):
    path: str
    content: str = ""


@router.get("")
async def list_files(path: str = Query("/home")):
    try:
        return await fs.list_dir(path)
    except PermissionError as e:
        raise HTTPException(400, str(e))
    except FileNotFoundError:
        return []


@router.get("/read")
async def read_file(path: str = Query(...)):
    try:
        content = await fs.read_file(path)
        return {"content": content}
    except PermissionError as e:
        raise HTTPException(400, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "File not found")


@router.post("")
async def create_entry(body: CreateRequest):
    try:
        await fs.create(body.path, body.isDirectory)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(400, str(e))


@router.delete("")
async def delete_entry(body: DeleteRequest):
    try:
        await fs.remove(body.path)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(400, str(e))
    except FileNotFoundError:
        raise HTTPException(404, "Not found")


@router.put("/rename")
async def rename_entry(body: RenameRequest):
    try:
        await fs.rename(body.path, body.newName)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(400, str(e))


@router.put("/write")
async def write_entry(body: WriteRequest):
    try:
        await fs.write_file(body.path, body.content)
        return {"success": True}
    except PermissionError as e:
        raise HTTPException(400, str(e))
