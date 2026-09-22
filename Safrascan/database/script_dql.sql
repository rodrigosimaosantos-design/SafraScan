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
    p.estado_propriedade
FROM usuario u
INNER JOIN propriedade p
    ON u.id_usuario = p.id_usuario
ORDER BY u.nome_usuario;


-- ============================================================
-- PERGUNTA 2
-- Qual é a área total de talhões existente em cada propriedade?
-- ============================================================

SELECT
    p.nome_propriedade,
    SUM(t.area_ha) AS area_total_hectares
FROM propriedade p
INNER JOIN talhao t
    ON p.id_propriedade = t.id_propriedade
GROUP BY p.nome_propriedade
ORDER BY area_total_hectares DESC;


-- ============================================================
-- PERGUNTA 3
-- Quais sensores estão instalados em cada talhão e qual é
-- seu status atual?
-- ============================================================

SELECT
    p.nome_propriedade,
    t.id_talhao,
    s.identificador_dispositivo,
    s.tipo_sensor,
    s.status_sensor
FROM propriedade p
INNER JOIN talhao t
    ON p.id_propriedade = t.id_propriedade
INNER JOIN sensor s
    ON t.id_talhao = s.id_talhao
ORDER BY p.nome_propriedade,
         t.id_talhao;


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
INNER JOIN sensor s
    ON ls.id_sensor = s.id_sensor
INNER JOIN grandeza_fisica g
    ON ls.id_grandeza = g.id_grandeza
ORDER BY ls.timestamp_leitura DESC;


-- ============================================================
-- PERGUNTA 5
-- Qual é a média das leituras de umidade do solo registradas
-- por sensor?
-- ============================================================

SELECT
    s.identificador_dispositivo,
    ROUND(AVG(ls.valor_leitura),2) AS media_umidade
FROM leitura_sensor ls
INNER JOIN sensor s
    ON ls.id_sensor = s.id_sensor
INNER JOIN grandeza_fisica g
    ON ls.id_grandeza = g.id_grandeza
WHERE g.nome_grandeza = 'Umidade do Solo'
GROUP BY s.identificador_dispositivo
ORDER BY media_umidade ASC;


-- ============================================================
-- PERGUNTA 6
-- Quais recomendações ainda não foram lidas pelos usuários?
-- ============================================================

SELECT
    r.id_recomendacao,
    c.nome_cultura,
    r.tipo,
    r.mensagem_recomendacao,
    r.valor_detectado
FROM recomendacao r
INNER JOIN plantio pl
    ON r.id_plantio = pl.id_plantio
INNER JOIN cultura c
    ON pl.id_cultura = c.id_cultura
WHERE r.lida_recomendacao = FALSE
ORDER BY r.timestamp_recomendacao DESC;


-- ============================================================
-- PERGUNTA 7
-- Quantos sensores existem em cada situação operacional?
-- ============================================================

SELECT
    status_sensor,
    COUNT(*) AS quantidade
FROM sensor
GROUP BY status_sensor
ORDER BY quantidade DESC;


-- ============================================================
-- PERGUNTA 8
-- Quais culturas estão sendo cultivadas em cada propriedade?
-- ============================================================

SELECT
    p.nome_propriedade,
    c.nome_cultura,
    pl.status,
    pl.data_plantio,
    pl.data_colheita_prevista
FROM plantio pl
INNER JOIN cultura c
    ON pl.id_cultura = c.id_cultura
INNER JOIN talhao t
    ON pl.id_talhao = t.id_talhao
INNER JOIN propriedade p
    ON t.id_propriedade = p.id_propriedade
ORDER BY p.nome_propriedade;


-- ============================================================
-- PERGUNTA 9
-- Qual usuário possui a maior área cultivada?
-- ============================================================

SELECT
    u.nome_usuario,
    ROUND(SUM(t.area_ha),2) AS area_total
FROM usuario u
INNER JOIN propriedade p
    ON u.id_usuario = p.id_usuario
INNER JOIN talhao t
    ON p.id_propriedade = t.id_propriedade
GROUP BY u.nome_usuario
ORDER BY area_total DESC;


-- ============================================================
-- PERGUNTA 10
-- Quais sensores não estão ativos?
-- ============================================================

SELECT
    identificador_dispositivo,
    tipo_sensor,
    status_sensor,
    data_ultima_comunicacao
FROM sensor
WHERE status_sensor <> 'ATIVO';