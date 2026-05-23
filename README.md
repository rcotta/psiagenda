# PsiAgenda

Sistema de gestão de agenda para psicólogos. Permite cadastrar pacientes, agendar sessões individuais ou em pacotes e acompanhar pagamentos.

**IMPORTANTE**: este sistema é um protótipo desenvolvido no escopo da disciplina Projeto Integrador I da UNIVESP. O protótipo tem débitos técnicos conhecidos, não considere - em hipótese alguma - como um sistema pronto para produção.

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

## Testes E2E

Testes de ponta a ponta com [Playwright](https://playwright.dev/), localizados em `e2e-tests/`.

O suite cobre o fluxo completo: login → cadastro de pacientes → nova sessão → novo pacote → pagamentos → remarcar sessão → marcar como realizada.

### Pré-requisitos

- Node.js 18+
- Aplicação rodando em `http://localhost:8000` (veja [Como rodar](#como-rodar))

### Instalação

```bash
cd e2e-tests
npm install
npx playwright install chromium
```

### Execução

```bash
# Headless (padrão) — gera vídeo em test-results/
npm test

# Com janela visível
npm run test:headed

# Abrir relatório HTML após a execução
npm run report
```

### Opções

| Variável de ambiente | Padrão | Descrição |
|----------------------|--------|-----------|
| `PSIAGENDA_DELAY_MS` | `1000` | Pausa (ms) entre trocas de tela. Delay por campo = valor ÷ 4. |

Exemplo com delay maior para gravação em vídeo:

```bash
PSIAGENDA_DELAY_MS=2000 npm test
```

### Vídeo gerado

Cada execução grava um vídeo WebM em `e2e-tests/test-results/`. Para converter para MP4 (requer ffmpeg):

```bash
ffmpeg -i test-results/<pasta>/video.webm -c:v libx264 -crf 18 -preset slow -c:a aac output.mp4
```

---

## Modelo de dados

Documentado em detalhes em [DATA_MODEL.md](DATA_MODEL.md).

Entidades principais: `usuario`, `cliente`, `grupo_sessao`, `sessao`, `pagamento`.
