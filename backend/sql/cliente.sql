-- [criar_cliente]
INSERT INTO cliente (id_usuario, nome, email, telefone, notas)
VALUES (?, ?, ?, ?, ?);

-- [listar_clientes]
SELECT id, nome, email, telefone, notas, ts_criacao, ts_atualizacao
FROM cliente
WHERE id_usuario = ? AND ativo = 1
ORDER BY nome;

-- [buscar_por_id]
SELECT id, nome, email, telefone, notas, ts_criacao, ts_atualizacao
FROM cliente
WHERE id = ? AND id_usuario = ? AND ativo = 1;

-- [atualizar_cliente]
UPDATE cliente
SET nome = ?, email = ?, telefone = ?, notas = ?,
    ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ? AND id_usuario = ?;

-- [desativar_cliente]
UPDATE cliente
SET ativo = 0, ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ? AND id_usuario = ?;
