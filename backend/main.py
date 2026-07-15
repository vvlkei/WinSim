import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/api/health")
async def health():
    return {"status": "ok"}


def ensure_root():
    root = Path("files")
    root.mkdir(exist_ok=True)
    (root / "home").mkdir(exist_ok=True)
    (root / "home" / "projects").mkdir(exist_ok=True)
    (root / "home" / "documents").mkdir(exist_ok=True)


if __name__ == "__main__":
    import uvicorn
    ensure_root()
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
