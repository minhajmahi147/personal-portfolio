from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, DIST_DIR
from app.db import init_db
from app.routes import router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Create the database before the server accepts requests."""
    init_db()
    yield


def create_app() -> FastAPI:
    """Build the API, attach CORS, and serve the built site if it exists."""
    app = FastAPI(title="Mahi Portfolio API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)
    _mount_frontend(app)
    return app


def _mount_frontend(app: FastAPI) -> None:
    """Serve the Vite build so one process can host the site and the API."""
    if not DIST_DIR.exists():
        return

    assets = DIST_DIR / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        """Return a built file, or index.html so client-side routes still work."""
        index = DIST_DIR / "index.html"
        target = (DIST_DIR / full_path).resolve()
        if full_path and target.is_file() and target.is_relative_to(DIST_DIR.resolve()):
            return FileResponse(target)
        if index.is_file():
            return FileResponse(index)
        raise HTTPException(status_code=404, detail="Frontend not built")


app = create_app()
