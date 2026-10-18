-- ============================================================
-- DQL.SQL - SAFRASCAN
-- Consultas para validação da base de dados
-- SGBD: PostgreSQL
-- ============================================================


-- ============================================================
-- PERGUNTA 1
-- Quais propriedades estão cadastradas e quem é o responsável
-- por cada uma delas?
-- ============================================================

SELECT
    u.nome_usuario,
    p.nome_propriedade,
    p.municipio_propriedade,
    p.estado_propriedade,
    p.tamanho_ha
FROM usuario u
JOIN propriedade p ON p.id_usuario = u.id_usuario
ORDER BY u.nome_usuario;


-- ============================================================
-- PERGUNTA 2
-- Qual é a área total de talhões existente em cada propriedade?
-- ============================================================

SELECT
    p.nome_propriedade,
    COALESCE(SUM(t.area_ha), 0) AS area_total_talhoes_ha
FROM propriedade p
LEFT JOIN talhao t ON t.id_propriedade = p.id_propriedade
GROUP BY p.id_propriedade, p.nome_propriedade
ORDER BY area_total_talhoes_ha DESC;


-- ============================================================
-- PERGUNTA 3
-- Quais sensores estão instalados em cada talhão e qual é
-- seu status atual?
-- ============================================================

SELECT
    p.nome_propriedade,
    t.id_talhao,
    t.nome AS nome_talhao,
    s.identificador_dispositivo,
    s.tipo,
    s.status
FROM propriedade p
JOIN talhao t ON t.id_propriedade = p.id_propriedade
JOIN sensor s ON s.id_talhao = t.id_talhao
ORDER BY p.nome_propriedade, t.id_talhao, s.identificador_dispositivo;


-- ============================================================
-- PERGUNTA 4
-- Quais leituras de sensores foram registradas e quais
-- grandezas físicas foram medidas?
-- ============================================================

SELECT
    s.identificador_dispositivo,
    g.nome_grandeza,
    ls.valor_leitura,
    g.unidade_medida,
    ls.timestamp_leitura
FROM leitura_sensor ls
JOIN sensor s ON s.id_sensor = ls.id_sensor
JOIN grandeza_fisica g ON g.id_grandeza = ls.id_grandeza
ORDER BY ls.timestamp_leitura DESC;


-- ============================================================
-- PERGUNTA 5
-- Qual é a média das leituras de umidade do solo registradas
-- por sensor?
-- ============================================================

SELECT
    s.identificador_dispositivo,
    ROUND(AVG(ls.valor_leitura), 2) AS media_umidade_solo
FROM leitura_sensor ls
JOIN sensor s ON s.id_sensor = ls.id_sensor
JOIN grandeza_fisica g ON g.id_grandeza = ls.id_grandeza
WHERE LOWER(g.nome_grandeza) = LOWER('Umidade do Solo')
GROUP BY s.id_sensor, s.identificador_dispositivo
ORDER BY media_umidade_solo ASC;


-- ============================================================
-- PERGUNTA 6
-- Quais recomendações ainda não foram lidas pelos usuários?
-- ============================================================

SELECT
    r.id_recomendacao,
    c.nome_cultura,
    r.tipo,
    r.mensagem,
    r.valor_detectado,
    r.data_geracao,
    r.status
FROM recomendacao r
JOIN plantio pl ON pl.id_plantio = r.id_plantio
JOIN cultura c ON c.id_cultura = pl.id_cultura
WHERE r.lida = FALSE
ORDER BY r.data_geracao DESC;

-- ============================================================
-- PERGUNTA 7
-- Quantos sensores existem em cada situação operacional?
-- ============================================================

SELECT
    status,
    COUNT(*) AS quantidade_sensores
FROM sensor
GROUP BY status
ORDER BY quantidade_sensores DESC;


-- ============================================================
-- PERGUNTA 8
-- Quais culturas estão sendo cultivadas em cada propriedade?
-- ============================================================

SELECT
    p.nome_propriedade,
    t.nome AS nome_talhao,
    c.nome_cultura,
    pl.status,
    pl.data_plantio,
    pl.data_colheita_prevista
FROM plantio pl
JOIN cultura c ON c.id_cultura = pl.id_cultura
JOIN talhao t ON t.id_talhao = pl.id_talhao
JOIN propriedade p ON p.id_propriedade = t.id_propriedade
ORDER BY p.nome_propriedade, t.nome, c.nome_cultura;

-- ============================================================
-- PERGUNTA 9
-- Qual usuário possui a maior área cultivada?
-- ============================================================

SELECT
    u.id_usuario,
    u.nome_usuario,
    ROUND(COALESCE(SUM(t.area_ha), 0), 2) AS area_total_talhoes_ha
FROM usuario u
LEFT JOIN propriedade p ON p.id_usuario = u.id_usuario
LEFT JOIN talhao t ON t.id_propriedade = p.id_propriedade
GROUP BY u.id_usuario, u.nome_usuario
ORDER BY area_total_talhoes_ha DESC;


-- ============================================================
-- PERGUNTA 10
-- Quais sensores não estão ativos?
-- ============================================================

SELECT
    identificador_dispositivo,
    tipo,
    status,
    data_ultima_comunicacao
FROM sensor
WHERE UPPER(status) <> 'ATIVO'
ORDER BY identificador_dispositivo;
