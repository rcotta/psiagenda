from fastapi import APIRouter, HTTPException

from auth import criar_token, verificar_senha
from database import get_db, load_queries
from models import LoginRequest, TokenResponse

router = APIRouter(tags=["autenticacao"])
Q = load_queries("usuario.sql")


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    with get_db() as conn:
        row = conn.execute(Q["buscar_por_login"], (body.login,)).fetchone()

    if not row or not verificar_senha(body.senha, row["hash_senha"]):
        raise HTTPException(status_code=401, detail="Login ou senha incorretos")

    return TokenResponse(access_token=criar_token(row["id"], row["login"]))
