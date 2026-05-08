-- [criar_pagamento]
INSERT INTO pagamento (id_grupo_sessao, valor, dt_vencimento)
VALUES (?, ?, ?);

-- [listar_pagamentos]
-- Todos os pagamentos do psicólogo com nome do cliente e tipo de sessão
SELECT
    p.id,
    p.id_grupo_sessao,
    p.status,
    p.dt_vencimento,
    p.dt_pagamento,
    p.valor,
    p.valor_pagamento,
    p.notas,
    c.nome AS nome_cliente,
    g.tipo AS tipo_sessao
FROM pagamento p
JOIN grupo_sessao g ON g.id = p.id_grupo_sessao
JOIN cliente c      ON c.id = g.id_cliente
WHERE g.id_usuario = ?
ORDER BY p.dt_vencimento;

-- [pagamentos_por_cliente]
SELECT
    p.id,
    p.id_grupo_sessao,
    p.status,
    p.dt_vencimento,
    p.dt_pagamento,
    p.valor,
    p.valor_pagamento,
    p.notas,
    g.tipo AS tipo_sessao
FROM pagamento p
JOIN grupo_sessao g ON g.id = p.id_grupo_sessao
WHERE g.id_usuario = ?
  AND g.id_cliente = ?
ORDER BY p.dt_vencimento DESC;

-- [buscar_pagamento]
-- Busca um pagamento garantindo que pertence ao psicólogo logado
SELECT p.id, p.id_grupo_sessao, p.status, p.dt_vencimento,
       p.dt_pagamento, p.valor, p.valor_pagamento, p.notas
FROM pagamento p
JOIN grupo_sessao g ON g.id = p.id_grupo_sessao
WHERE p.id = ? AND g.id_usuario = ?;

-- [atualizar_pagamento]
UPDATE pagamento
SET status = ?, dt_pagamento = ?, valor_pagamento = ?, notas = ?,
    ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?;
