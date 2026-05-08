# PsiAgenda

Sistema de gestão de agenda para psicólogos. Permite cadastrar pacientes, agendar sessões individuais ou em pacotes e acompanhar pagamentos.

## Funcionalidades

- Cadastro de pacientes com histórico de sessões e pagamentos
- Agendamento de sessões individuais ou em pacotes com datas pré-definidas
- Controle de pagamentos (pendente / realizado / cancelado)
- Remarcar e cancelar sessões (com distinção de cancelamento por ausência)
- Agenda semanal
- Suporte a múltiplos psicólogos — cada um enxerga apenas seus próprios dados

## Estrutura do projeto

```
/
├── frontend/       Interface web (HTML + CSS + jQuery), servida pelo backend
├── backend/        API REST em Python (FastAPI + SQLite)
└── DATA_MODEL.md   Documentação do modelo de dados
```

## Como rodar

### Pré-requisitos

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) instalado

### Instalação e execução

```bash
cd backend

# Instala dependências
uv sync

# Cria o banco de dados e o usuário inicial (renata / 123456)
uv run python seed.py

# Sobe a aplicação (frontend + API na mesma porta)
uv run uvicorn main:app --reload
```

Acesse `http://localhost:8000` — o frontend é servido diretamente pelo FastAPI como arquivos estáticos.
Documentação interativa da API (Swagger) em `http://localhost:8000/docs`.

**Telas disponíveis:**
- Login e Home
- Lista de Pacientes e Perfil do Paciente
- Nova Sessão e Novo Pacote
- Remarcar e Cancelar Sessão
- Pagamentos
- Agenda Semanal
- Meu Perfil

## Backend

API REST construída com FastAPI e SQLite. Autenticação via JWT Bearer token.

### Principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Autenticação, retorna JWT |
| GET | `/clientes/` | Lista pacientes |
| POST | `/clientes/` | Cadastra paciente |
| POST | `/sessoes/individual` | Agenda sessão individual |
| POST | `/sessoes/pacote` | Cria pacote de sessões |
| GET | `/sessoes/agenda` | Sessões em um intervalo de datas |
| PUT | `/sessoes/{id}/reagendar` | Remarca uma sessão |
| PUT | `/sessoes/{id}/cancelar` | Cancela uma sessão |
| GET | `/pagamentos/` | Lista pagamentos |
| PUT | `/pagamentos/{id}` | Registra recebimento |

### Tecnologias

- **FastAPI** — framework web
- **SQLite** — banco de dados (arquivo `backend/psiagenda.db`)
- **PyJWT** — autenticação JWT
- **bcrypt** — hash de senhas
- **uv** — gerenciador de pacotes e ambiente virtual

## Modelo de dados

Documentado em detalhes em [DATA_MODEL.md](DATA_MODEL.md).

Entidades principais: `usuario`, `cliente`, `grupo_sessao`, `sessao`, `pagamento`.
