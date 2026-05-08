from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    login: str
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ClienteCreate(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    notas: Optional[str] = None


class SessaoIndividualCreate(BaseModel):
    id_cliente: int
    dt_sessao: datetime
    duracao: int = 50
    valor: float
    dt_vencimento: Optional[date] = None


class PacoteCreate(BaseModel):
    id_cliente: int
    sessoes: list[datetime]
    duracao: int = 50
    valor: float
    dt_vencimento: Optional[date] = None


class RagendarSessao(BaseModel):
    dt_sessao: datetime


class CancelarSessao(BaseModel):
    status: Literal["cancelada", "cancelada_ausencia"] = "cancelada"
    notas: Optional[str] = None


class PagamentoUpdate(BaseModel):
    status: Optional[Literal["pendente", "realizado", "cancelado"]] = None
    dt_pagamento: Optional[date] = None
    valor_pagamento: Optional[float] = None
    notas: Optional[str] = None


class UsuarioUpdate(BaseModel):
    nome: str
