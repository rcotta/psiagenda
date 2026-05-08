CREATE TABLE IF NOT EXISTS usuario (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL,
    login           TEXT    NOT NULL UNIQUE,
    hash_senha      TEXT    NOT NULL,
    ts_criacao      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ts_atualizacao  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cliente (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario      INTEGER NOT NULL REFERENCES usuario(id),
    nome            TEXT    NOT NULL,
    email           TEXT,
    telefone        TEXT,
    notas           TEXT,
    ativo           INTEGER NOT NULL DEFAULT 1,
    ts_criacao      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ts_atualizacao  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupo_sessao (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario      INTEGER NOT NULL REFERENCES usuario(id),
    id_cliente      INTEGER NOT NULL REFERENCES cliente(id),
    tipo            TEXT    NOT NULL CHECK(tipo IN ('individual', 'pacote')),
    qtd_sessoes     INTEGER NOT NULL DEFAULT 1,
    ativo           INTEGER NOT NULL DEFAULT 1,
    ts_criacao      DATETIME DEFAULT CURRENT_TIMESTAMP,
    ts_atualizacao  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessao (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_grupo_sessao  INTEGER NOT NULL REFERENCES grupo_sessao(id),
    dt_sessao        DATETIME NOT NULL,
    duracao          INTEGER  NOT NULL DEFAULT 50,
    status           TEXT     NOT NULL DEFAULT 'pendente'
                              CHECK(status IN ('pendente', 'finalizada', 'cancelada', 'cancelada_ausencia')),
    notas            TEXT,
    ts_criacao       DATETIME DEFAULT CURRENT_TIMESTAMP,
    ts_atualizacao   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pagamento (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_grupo_sessao  INTEGER NOT NULL REFERENCES grupo_sessao(id),
    status           TEXT    NOT NULL DEFAULT 'pendente'
                             CHECK(status IN ('pendente', 'realizado', 'cancelado')),
    dt_vencimento    DATE,
    dt_pagamento     DATE,
    valor            REAL    NOT NULL,
    valor_pagamento  REAL,
    notas            TEXT,
    ts_criacao       DATETIME DEFAULT CURRENT_TIMESTAMP,
    ts_atualizacao   DATETIME DEFAULT CURRENT_TIMESTAMP
);
