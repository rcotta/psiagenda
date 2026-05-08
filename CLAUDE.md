# PsiAgenda — Contexto para Claude

## O que é este projeto

Aplicação de gestão de agenda para psicólogos. Permite cadastrar pacientes, agendar sessões individuais ou em pacotes, e acompanhar pagamentos. Cada psicólogo tem sua visão isolada dos próprios dados (multi-tenant por usuário).

**Fase atual:** protótipo navegável HTML + backend FastAPI recém criado. O frontend ainda usa dados mock — a integração frontend ↔ backend ainda não foi feita.

---

## Estrutura do projeto

```
/
├── frontend/          # Protótipo HTML estático (index.html, styles.css, app.js)
├── backend/           # API FastAPI + SQLite
│   ├── main.py        # Entrypoint, CORS, registro dos routers
│   ├── database.py    # Conexão SQLite, load_queries(), init_db()
│   ├── auth.py        # bcrypt + JWT
│   ├── deps.py        # Dependência get_usuario_atual (guard JWT)
│   ├── models.py      # Pydantic request/response models
│   ├── seed.py        # Popula banco com usuários iniciais
│   ├── sql/           # Queries SQL externalizadas (1 arquivo por tópico)
│   │   ├── schema.sql
│   │   ├── usuario.sql
│   │   ├── cliente.sql
│   │   ├── sessao.sql    # inclui queries de grupo_sessao
│   │   └── pagamento.sql
│   └── routers/
│       ├── auth.py
│       ├── usuario.py
│       ├── clientes.py
│       ├── sessoes.py
│       └── pagamentos.py
├── DATA_MODEL.md      # Documentação do modelo de dados (PT-BR)
└── CLAUDE.md          # Este arquivo
```

---

## Frontend

- Protótipo em HTML/CSS/JS puro, tudo em `frontend/index.html`.
- Usa jQuery para navegação entre telas (show/hide de divs).
- Dados são todos hardcodados — nenhuma chamada de API real ainda.
- Detalhes em [frontend/README.md](frontend/README.md).

**Telas implementadas:** Login, Home, Cadastro de Paciente, Nova Sessão, Novo Pacote, Pagamentos, Remarcar Sessão, Cancelar Sessão, Lista de Pacientes, Perfil do Paciente, Agenda (semanal), Meu Perfil.

---

## Backend

### Como rodar

```bash
cd backend
uv run python seed.py               # cria banco + usuário renata/123456
uv run uvicorn main:app --reload    # sobe API em http://localhost:8000
# docs interativos em http://localhost:8000/docs
```

### Pacote manager: uv

Sempre usar `uv run` para executar scripts Python no backend. Para adicionar dependências: `uv add <pacote>`.

### Padrões do código

- **SQL externalizado**: todas as queries ficam em `backend/sql/`. Nunca escrever SQL inline nos routers.
- **Queries nomeadas**: cada query tem um comentário `-- [nome_da_query]` no arquivo SQL. `load_queries("arquivo.sql")` retorna um dict e é chamado uma vez no topo de cada módulo.
- **Autenticação**: JWT Bearer token. Todo endpoint protegido usa `Depends(get_usuario_atual)`. O dict retornado tem `{"id": int, "login": str}`.
- **Banco**: `get_db()` é um context manager — faz commit automático ao sair sem exceção, rollback se houver erro.
- **Soft delete**: `cliente` e `grupo_sessao` usam `ativo = 0`. Sessões usam o campo `status`.
- **Senhas**: hash bcrypt via o pacote `bcrypt` diretamente (não usar `passlib` — incompatível com bcrypt 4.x).
- **Sem ORM**: sqlite3 puro com `row_factory = sqlite3.Row`. Converter para dict com `dict(row)`.

### Modelo de dados resumido

- `usuario` → psicólogo (tem login/senha)
- `cliente` → paciente do psicólogo
- `grupo_sessao` → agrupa sessões (tipo: `individual` ou `pacote`) + tem 1 pagamento associado
- `sessao` → sessão terapêutica (tem `dt_sessao`, `duracao`, `status`)
- `pagamento` → cobrança do grupo (1:1 com grupo_sessao)

Documentação completa em [DATA_MODEL.md](DATA_MODEL.md).

### Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Retorna JWT |
| GET/PUT | `/usuarios/me` | Perfil do psicólogo logado |
| GET/POST | `/clientes/` | Lista / cadastra paciente |
| GET/PUT/DELETE | `/clientes/{id}` | Busca / atualiza / remove paciente |
| POST | `/sessoes/individual` | Cria sessão individual + grupo + pagamento |
| POST | `/sessoes/pacote` | Cria pacote de sessões + grupo + pagamento |
| GET | `/sessoes/agenda?inicio=&fim=` | Sessões no intervalo (agenda semanal) |
| GET | `/sessoes/cliente/{id}` | Histórico de sessões do paciente |
| PUT | `/sessoes/{id}/reagendar` | Atualiza dt_sessao |
| PUT | `/sessoes/{id}/cancelar` | Status: cancelada / cancelada_ausencia |
| PUT | `/sessoes/{id}/finalizar` | Status: finalizada |
| GET | `/pagamentos/` | Lista pagamentos do psicólogo |
| GET | `/pagamentos/cliente/{id}` | Pagamentos de um paciente |
| PUT | `/pagamentos/{id}` | Registra pagamento recebido |
