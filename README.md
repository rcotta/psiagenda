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
├── frontend/   Protótipo HTML navegável (HTML + CSS + jQuery)
├── backend/    API REST em Python (FastAPI + SQLite)
└── DATA_MODEL.md   Documentação do modelo de dados
```

## Frontend

Protótipo navegável em HTML puro, sem dependências de build. Todas as telas estão em um único arquivo `frontend/index.html`.

**Para abrir:** basta abrir `frontend/index.html` no navegador. Qualquer login/senha é aceito no protótipo.

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

# Sobe a API
uv run uvicorn main:app --reload
```

A API fica disponível em `http://localhost:8000`.
Documentação interativa (Swagger) em `http://localhost:8000/docs`.

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
