from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from database import get_db, load_queries
from deps import get_usuario_atual
from models import CancelarSessao, PacoteCreate, RagendarSessao, SessaoIndividualCreate

router = APIRouter(tags=["sessoes"])
Q = load_queries("sessao.sql")
Q_PAG = load_queries("pagamento.sql")


@router.post("/individual", status_code=201)
def criar_sessao_individual(body: SessaoIndividualCreate, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        cursor = conn.execute(Q["criar_grupo"], (usuario["id"], body.id_cliente, "individual", 1))
        grupo_id = cursor.lastrowid
        conn.execute(Q["criar_sessao"], (grupo_id, body.dt_sessao.isoformat(), body.duracao))
        conn.execute(Q_PAG["criar_pagamento"], (grupo_id, body.valor, body.dt_vencimento))
    return {"id_grupo_sessao": grupo_id}


@router.post("/pacote", status_code=201)
def criar_pacote(body: PacoteCreate, usuario=Depends(get_usuario_atual)):
    if not body.sessoes:
        raise HTTPException(status_code=400, detail="Pacote deve ter ao menos uma sessão")
    with get_db() as conn:
        cursor = conn.execute(
            Q["criar_grupo"], (usuario["id"], body.id_cliente, "pacote", len(body.sessoes))
        )
        grupo_id = cursor.lastrowid
        for dt in body.sessoes:
            conn.execute(Q["criar_sessao"], (grupo_id, dt.isoformat(), body.duracao))
        conn.execute(Q_PAG["criar_pagamento"], (grupo_id, body.valor, body.dt_vencimento))
    return {"id_grupo_sessao": grupo_id}


@router.get("/agenda")
def agenda(inicio: datetime, fim: datetime, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        rows = conn.execute(
            Q["agenda_semana"], (usuario["id"], inicio.isoformat(), fim.isoformat())
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/cliente/{id_cliente}")
def sessoes_por_cliente(id_cliente: int, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        rows = conn.execute(Q["sessoes_por_cliente"], (usuario["id"], id_cliente)).fetchall()
    return [dict(r) for r in rows]


@router.put("/{id}/reagendar")
def reagendar(id: int, body: RagendarSessao, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        if not conn.execute(Q["buscar_sessao"], (id, usuario["id"])).fetchone():
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        conn.execute(Q["reagendar_sessao"], (body.dt_sessao.isoformat(), id))
    return {"ok": True}


@router.put("/{id}/cancelar")
def cancelar(id: int, body: CancelarSessao, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        if not conn.execute(Q["buscar_sessao"], (id, usuario["id"])).fetchone():
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        conn.execute(Q["cancelar_sessao"], (body.status, id))
    return {"ok": True}


@router.put("/{id}/finalizar")
def finalizar(id: int, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        if not conn.execute(Q["buscar_sessao"], (id, usuario["id"])).fetchone():
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        conn.execute(Q["finalizar_sessao"], (id,))
    return {"ok": True}
