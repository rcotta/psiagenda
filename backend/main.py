from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import auth, clientes, pagamentos, sessoes, usuario


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
