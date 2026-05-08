from fastapi import APIRouter, Depends, HTTPException

from database import get_db, load_queries
from deps import get_usuario_atual
from models import PagamentoUpdate

router = APIRouter(tags=["pagamentos"])
Q = load_queries("pagamento.sql")


@router.get("/")
def listar_pagamentos(usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        rows = conn.execute(Q["listar_pagamentos"], (usuario["id"],)).fetchall()
    return [dict(r) for r in rows]


@router.get("/cliente/{id_cliente}")
def pagamentos_por_cliente(id_cliente: int, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        rows = conn.execute(
            Q["pagamentos_por_cliente"], (usuario["id"], id_cliente)
        ).fetchall()
    return [dict(r) for r in rows]


@router.put("/{id}")
def atualizar_pagamento(id: int, body: PagamentoUpdate, usuario=Depends(get_usuario_atual)):
    with get_db() as conn:
        pag = conn.execute(Q["buscar_pagamento"], (id, usuario["id"])).fetchone()
        if not pag:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        conn.execute(
            Q["atualizar_pagamento"],
            (
                body.status or pag["status"],
                body.dt_pagamento or pag["dt_pagamento"],
                body.valor_pagamento if body.valor_pagamento is not None else pag["valor_pagamento"],
                body.notas if body.notas is not None else pag["notas"],
                id,
            ),
        )
    return {"ok": True}
