-- Queries de grupo_sessao e sessao (criados sempre juntos)

-- [criar_grupo]
INSERT INTO grupo_sessao (id_usuario, id_cliente, tipo, qtd_sessoes)
VALUES (?, ?, ?, ?);

-- [criar_sessao]
INSERT INTO sessao (id_grupo_sessao, dt_sessao, duracao, status)
VALUES (?, ?, ?, 'pendente');

-- [agenda_semana]
-- Retorna todas as sessões não canceladas de um psicólogo em um intervalo de datas
SELECT
    s.id,
    s.dt_sessao,
    s.duracao,
    s.status,
    s.notas,
    c.id   AS id_cliente,
    c.nome AS nome_cliente,
    g.tipo,
    g.id   AS id_grupo_sessao
FROM sessao s
JOIN grupo_sessao g ON g.id = s.id_grupo_sessao
JOIN cliente c      ON c.id = g.id_cliente
WHERE g.id_usuario = ?
  AND s.dt_sessao >= ?
  AND s.dt_sessao <  ?
  AND s.status NOT IN ('cancelada', 'cancelada_ausencia')
ORDER BY s.dt_sessao;

-- [sessoes_por_cliente]
-- Histórico completo de sessões de um cliente
SELECT
    s.id,
    s.dt_sessao,
    s.duracao,
    s.status,
    s.notas,
    g.tipo,
    g.id AS id_grupo_sessao
FROM sessao s
JOIN grupo_sessao g ON g.id = s.id_grupo_sessao
WHERE g.id_usuario = ?
  AND g.id_cliente = ?
ORDER BY s.dt_sessao DESC;

-- [buscar_sessao]
-- Busca uma sessão garantindo que pertence ao psicólogo logado
SELECT s.id, s.id_grupo_sessao, s.dt_sessao, s.duracao, s.status, s.notas
FROM sessao s
JOIN grupo_sessao g ON g.id = s.id_grupo_sessao
WHERE s.id = ? AND g.id_usuario = ?;

-- [reagendar_sessao]
UPDATE sessao
SET dt_sessao = ?, ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?;

-- [cancelar_sessao]
-- status deve ser 'cancelada' ou 'cancelada_ausencia'
UPDATE sessao
SET status = ?, ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?;

-- [finalizar_sessao]
UPDATE sessao
SET status = 'finalizada', ts_atualizacao = CURRENT_TIMESTAMP
WHERE id = ?;
