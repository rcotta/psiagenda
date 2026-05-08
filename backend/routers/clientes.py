from fastapi import APIRouter, Depends, HTTPException

from database import get_db, load_queries
from deps import get_usuario_atual
from models import ClienteCreate

router = APIRouter(tags=["clientes"])
Q = load_queries("cliente.sql")


@router.post("/", status_code=201)
def criar_cliente(body: ClienteCreate, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        cursor = conn.execute(
            Q["criar_cliente"],
            (usuario["id"], body.nome, body.email, body.telefone, body.notas),
        )
        row = conn.execute(Q["buscar_por_id"], (cursor.lastrowid, usuario["id"])).fetchone()
    return dict(row)


@router.get("/")
def listar_clientes(usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        rows = conn.execute(Q["listar_clientes"], (usuario["id"],)).fetchall()
    return [dict(r) for r in rows]


@router.get("/{id}")
def buscar_cliente(id: int, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        row = conn.execute(Q["buscar_por_id"], (id, usuario["id"])).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return dict(row)


@router.put("/{id}")
def atualizar_cliente(id: int, body: ClienteCreate, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        row = conn.execute(Q["buscar_por_id"], (id, usuario["id"])).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        conn.execute(
            Q["atualizar_cliente"],
            (body.nome, body.email, body.telefone, body.notas, id, usuario["id"]),
        )
    return {"ok": True}


@router.delete("/{id}")
def remover_cliente(id: int, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        row = conn.execute(Q["buscar_por_id"], (id, usuario["id"])).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        conn.execute(Q["desativar_cliente"], (id, usuario["id"]))
    return {"ok": True}
