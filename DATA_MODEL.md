# Modelo de Dados — PsiAgenda

## Visão Geral

Sistema de gestão de agenda para psicólogos. Cada psicólogo gerencia seus próprios clientes, sessões e pagamentos de forma independente (multi-tenant por usuário).

## Diagrama de Relacionamentos

```
usuario (psicólogo)
  ├── cliente (1:N)
  └── grupo_sessao (1:N)
        ├── sessao (1:N)
        └── pagamento (1:1)
```

## Regras de Negócio

- Cada psicólogo enxerga apenas seus próprios clientes e sessões.
- Toda sessão pertence a um `grupo_sessao`. Sessões individuais geram um grupo com `qtd_sessoes = 1`.
- Um pacote (`tipo = pacote`) agrupa múltiplas sessões com datas pré-definidas no momento da criação.
- Cada `grupo_sessao` tem exatamente um `pagamento` associado.
- A exclusão de clientes e grupos de sessão é lógica (`ativo = 0`). O status das sessões cobre os casos de cancelamento.

---

## Entidades

### usuario

Representa o psicólogo usuário do sistema.

| Campo        | Tipo         | Obrigatório | Descrição                           |
|--------------|--------------|-------------|-------------------------------------|
| id           | INTEGER PK   | sim         | Identificador único (auto)          |
| nome         | TEXT         | sim         | Nome completo                       |
| login        | TEXT UNIQUE  | sim         | Login de acesso (único)             |
| hash_senha   | TEXT         | sim         | Hash bcrypt da senha                |
| ts_criacao   | DATETIME     | sim         | Data de criação (auto)              |
| ts_atualizacao | DATETIME   | sim         | Data da última atualização (auto)   |

> Senhas armazenadas com bcrypt, que inclui o salt internamente — sem campo `salt` separado.

---

### cliente

Paciente cadastrado por um psicólogo.

| Campo          | Tipo       | Obrigatório | Descrição                                   |
|----------------|------------|-------------|---------------------------------------------|
| id             | INTEGER PK | sim         | Identificador único (auto)                  |
| id_usuario     | INTEGER FK | sim         | Psicólogo responsável → `usuario.id`        |
| nome           | TEXT       | sim         | Nome completo do paciente                   |
| email          | TEXT       | não         | E-mail de contato                           |
| telefone       | TEXT       | não         | Telefone de contato                         |
| notas          | TEXT       | não         | Observações livres                          |
| ativo          | INTEGER    | sim         | `1` = ativo, `0` = excluído (soft delete)   |
| ts_criacao     | DATETIME   | sim         | Data de criação (auto)                      |
| ts_atualizacao | DATETIME   | sim         | Data da última atualização (auto)           |

---

### grupo_sessao

Agrupa sessões de um mesmo cliente sob um único tipo de atendimento e um único pagamento.

| Campo          | Tipo       | Obrigatório | Descrição                                        |
|----------------|------------|-------------|--------------------------------------------------|
| id             | INTEGER PK | sim         | Identificador único (auto)                       |
| id_usuario     | INTEGER FK | sim         | Psicólogo responsável → `usuario.id`             |
| id_cliente     | INTEGER FK | sim         | Paciente atendido → `cliente.id`                 |
| tipo           | TEXT       | sim         | `individual` ou `pacote`                         |
| qtd_sessoes    | INTEGER    | sim         | Número de sessões do grupo (1 para individual)   |
| ativo          | INTEGER    | sim         | `1` = ativo, `0` = excluído (soft delete)        |
| ts_criacao     | DATETIME   | sim         | Data de criação (auto)                           |
| ts_atualizacao | DATETIME   | sim         | Data da última atualização (auto)                |

---

### sessao

Sessão terapêutica individual, sempre vinculada a um `grupo_sessao`.

| Campo            | Tipo       | Obrigatório | Descrição                                                              |
|------------------|------------|-------------|------------------------------------------------------------------------|
| id               | INTEGER PK | sim         | Identificador único (auto)                                             |
| id_grupo_sessao  | INTEGER FK | sim         | Grupo ao qual pertence → `grupo_sessao.id`                             |
| dt_sessao        | DATETIME   | sim         | Data e hora agendada                                                   |
| duracao          | INTEGER    | sim         | Duração em minutos (default 50)                                        |
| status           | TEXT       | sim         | `pendente`, `finalizada`, `cancelada`, `cancelada_ausencia`            |
| notas            | TEXT       | não         | Anotações da sessão                                                    |
| ts_criacao       | DATETIME   | sim         | Data de criação (auto)                                                 |
| ts_atualizacao   | DATETIME   | sim         | Data da última atualização (auto)                                      |

---

### pagamento

Cobrança associada a um `grupo_sessao`. Um grupo tem exatamente um pagamento.

| Campo            | Tipo       | Obrigatório | Descrição                                      |
|------------------|------------|-------------|------------------------------------------------|
| id               | INTEGER PK | sim         | Identificador único (auto)                     |
| id_grupo_sessao  | INTEGER FK | sim         | Grupo ao qual pertence → `grupo_sessao.id`     |
| status           | TEXT       | sim         | `pendente`, `realizado`, `cancelado`           |
| dt_vencimento    | DATE       | não         | Data de vencimento                             |
| dt_pagamento     | DATE       | não         | Data em que o pagamento foi efetivado          |
| valor            | REAL       | sim         | Valor original cobrado                         |
| valor_pagamento  | REAL       | não         | Valor efetivamente pago pelo cliente           |
| notas            | TEXT       | não         | Observações livres                             |
| ts_criacao       | DATETIME   | sim         | Data de criação (auto)                         |
| ts_atualizacao   | DATETIME   | sim         | Data da última atualização (auto)              |
