from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes.files import router as files_router

app = FastAPI(title="PixelDesktop Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix="/api/files")

ROOT = Path("files")
WALLPAPER_DIR = ROOT / "wallpapers"
WALLPAPER_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/wallpapers", StaticFiles(directory=str(WALLPAPER_DIR)), name="wallpapers")

@app.post("/api/wallpaper")
async def upload_wallpaper(file: UploadFile = File(...)):
    for f in WALLPAPER_DIR.iterdir():
        f.unlink()
    ext = Path(file.filename).suffix if file.filename else ".jpg"
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

def ensure_root():
    ROOT.mkdir(exist_ok=True)
    (ROOT / "home").mkdir(exist_ok=True)
    (ROOT / "home" / "projects").mkdir(exist_ok=True)
    (ROOT / "home" / "documents").mkdir(exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    ensure_root()
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
