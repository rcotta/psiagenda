from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from database import init_db
from routers import auth, clientes, pagamentos, sessoes, usuario

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="PsiAgenda API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/auth")
app.include_router(usuario.router,    prefix="/usuarios")
app.include_router(clientes.router,   prefix="/clientes")
app.include_router(sessoes.router,    prefix="/sessoes")
app.include_router(pagamentos.router, prefix="/pagamentos")

@app.get("/{full_path:path}", include_in_schema=False)
def spa_fallback(full_path: str):
    if full_path:
        file = (FRONTEND_DIR / full_path).resolve()
        if file.is_file() and file.is_relative_to(FRONTEND_DIR.resolve()):
            return FileResponse(file)
    return FileResponse(FRONTEND_DIR / "index.html")
