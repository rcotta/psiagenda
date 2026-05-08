from fastapi import APIRouter, Depends

from database import get_db, load_queries
from deps import get_usuario_atual
from models import UsuarioUpdate

router = APIRouter(tags=["usuario"])
Q = load_queries("usuario.sql")


@router.get("/me")
def meu_perfil(usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        row = conn.execute(Q["buscar_por_id"], (usuario["id"],)).fetchone()
    return dict(row)


@router.put("/me")
def atualizar_perfil(body: UsuarioUpdate, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        conn.execute(Q["atualizar_usuario"], (body.nome, usuario["id"]))
    return {"ok": True}
