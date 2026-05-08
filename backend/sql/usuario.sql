-- [buscar_por_login]
SELECT id, nome, login, hash_senha
FROM usuario
WHERE login = ?;

-- [buscar_por_id]
SELECT id, nome, login, ts_criacao, ts_atualizacao
FROM usuario
WHERE id = ?;

-- [criar_usuario]
INSERT INTO usuario (nome, login, hash_senha)
VALUES (?, ?, ?);

-- [atualizar_usuario]
UPDATE usuario
SET nome = ?, ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?;
