from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.files import router as files_router
from utils.file_system import ROOT as FS_ROOT

WALLPAPER_DIR = FS_ROOT / "wallpapers"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    FS_ROOT.mkdir(exist_ok=True)
    (FS_ROOT / "home").mkdir(exist_ok=True)
    (FS_ROOT / "home" / "projects").mkdir(exist_ok=True)
    (FS_ROOT / "home" / "documents").mkdir(exist_ok=True)
    WALLPAPER_DIR.mkdir(exist_ok=True)
    yield


app = FastAPI(title="PixelDesktop Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix="/api/files")

app.mount("/wallpapers", StaticFiles(directory=str(WALLPAPER_DIR)), name="wallpapers")

MAX_WALLPAPER_SIZE = 10 * 1024 * 1024


@app.post("/api/wallpaper")
async def upload_wallpaper(file: UploadFile = File(...)):
    if file.size and file.size > MAX_WALLPAPER_SIZE:
        raise HTTPException(413, "File too large (max 10MB)")
    for f in WALLPAPER_DIR.iterdir():
        f.unlink()
    ext = Path(file.filename or "").suffix or ".jpg"
    dest = WALLPAPER_DIR / f"wallpaper{ext}"
    dest.write_bytes(await file.read())
    return {"path": f"/wallpapers/wallpaper{ext}"}


@app.get("/api/wallpaper")
async def get_wallpaper():
    for f in sorted(WALLPAPER_DIR.iterdir()):
        return {"path": f"/wallpapers/{f.name}"}
    return {"path": None}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
