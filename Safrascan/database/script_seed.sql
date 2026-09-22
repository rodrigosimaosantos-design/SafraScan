-- ============================================================
-- SEED.SQL - SAFRASCAN
-- Dados iniciais para testes do banco de dados
-- SGBD: PostgreSQL
-- ============================================================


-- ============================================================
-- 1. USUARIO
-- ============================================================

INSERT INTO usuario (
    nome_usuario,
    email_usuario,
    telefone_usuario,
    senha_hash,
    tipo_usuario,
    ativo_usuario
)
VALUES
(
    'Carlos Mendes',
    'carlos.mendes@email.com',
    '(44) 99999-1111',
    'hash_exemplo_carlos_123',
    'Produtor Rural',
    TRUE
),
(
    'Ana Souza',
    'ana.souza@email.com',
    '(44) 99999-2222',
    'hash_exemplo_ana_456',
    'Engenheira Agronoma',
    TRUE
),
(
    'Joao Oliveira',
    'joao.oliveira@email.com',
    '(44) 99999-3333',
    'hash_exemplo_joao_789',
    'Produtor Rural',
    TRUE
);


-- ============================================================
-- 2. CULTURA
-- ============================================================

INSERT INTO cultura (
    nome_cultura,
    ciclo_medio_dias
)
VALUES
(
    'Soja',
    120
),
(
    'Milho',
    130
),
(
    'Trigo',
    110
);


-- ============================================================
-- 3. GRANDEZA FISICA
-- ============================================================

INSERT INTO grandeza_fisica (
    nome_grandeza,
    unidade_medida,
    descricao_grandeza
)
VALUES
(
    'Umidade do Solo',
    '%',
    'Quantidade de umidade presente no solo.'
),
(
    'Temperatura',
    '°C',
    'Temperatura medida no ambiente ou na lavoura.'
),
(
    'Umidade do Ar',
    '%',
    'Quantidade de umidade presente no ar.'
);


-- ============================================================
-- 4. PROPRIEDADE
-- ============================================================

INSERT INTO propriedade (
    id_usuario,
    nome_propriedade,
    municipio_propriedade,
    estado_propriedade
)
VALUES
(
    1,
    'Fazenda Boa Esperanca',
    'Maringa',
    'PR'
),
(
    2,
    'Sitio Santa Clara',
    'Londrina',
    'PR'
),
(
    3,
    'Fazenda Sao Jose',
    'Campo Mourao',
    'PR'
);


-- ============================================================
-- 5. TALHAO
-- ============================================================

INSERT INTO talhao (
    id_propriedade,
    area_ha,
    tipo_solo
)
VALUES
(
    1,
    25.50,
    'Latossolo Vermelho'
),
(
    1,
    18.75,
    'Nitossolo Vermelho'
),
(
    2,
    30.00,
    'Latossolo Vermelho'
),
(
    3,
    22.50,
    'Argissolo'
);


-- ============================================================
-- 6. PLANTIO
-- ============================================================

INSERT INTO plantio (
    data_plantio,
    id_talhao,
    id_cultura,
    data_colheita_prevista,
    status
)
VALUES
(
    '2026-09-10',
    1,
    1,
    '2027-01-08',
    'ATIVO'
),
(
    '2026-09-12',
    2,
    2,
    '2027-01-20',
    'ATIVO'
),
(
    '2026-09-15',
    3,
    3,
    '2027-01-03',
    'ATIVO'
),
(
    '2026-09-05',
    4,
    1,
    '2027-01-03',
    'ATIVO'
);


-- ============================================================
-- 7. SENSOR
-- ============================================================

INSERT INTO sensor (
    id_talhao,
    tipo_sensor,
    identificador_dispositivo,
    status_sensor,
    data_instalacao_sensor,
    data_ultima_comunicacao
)
VALUES
(
    1,
    'Umidade do Solo',
    'SENSOR-001',
    'ATIVO',
    '2026-09-10 08:00:00',
    '2026-09-18 07:30:00'
),
(
    1,
    'Temperatura',
    'SENSOR-002',
    'ATIVO',
    '2026-09-10 08:10:00',
    '2026-09-18 07:30:00'
),
(
    2,
    'Umidade do Solo',
    'SENSOR-003',
    'ATIVO',
    '2026-09-12 09:00:00',
    '2026-09-18 07:25:00'
),
(
    3,
    'Umidade do Ar',
    'SENSOR-004',
    'ATIVO',
    '2026-09-15 08:30:00',
    '2026-09-18 07:20:00'
),
(
    4,
    'Umidade do Solo',
    'SENSOR-005',
    'INATIVO',
    '2026-09-05 10:00:00',
    '2026-09-17 18:00:00'
);


-- ============================================================
-- 8. LEITURA_SENSOR
-- ============================================================

INSERT INTO leitura_sensor (
    timestamp_leitura,
    id_sensor,
    id_grandeza,
    valor_leitura,
    outros_dados
)
VALUES
(
    '2026-09-18 07:30:00',
    1,
    1,
    42.50,
    'Umidade abaixo do nivel recomendado.'
),
(
    '2026-09-18 07:35:00',
    2,
    2,
    24.80,
    'Temperatura registrada no inicio da manha.'
),
(
    '2026-09-18 07:25:00',
    3,
    1,
    61.30,
    'Umidade adequada para a cultura.'
),
(
    '2026-09-18 07:20:00',
    4,
    3,
    73.40,
    'Umidade do ar dentro da faixa esperada.'
),
(
    '2026-09-17 18:00:00',
    5,
    1,
    35.20,
    'Ultima leitura antes da perda de comunicacao.'
),
(
    '2026-09-18 08:00:00',
    1,
    1,
    40.80,
    'Reducao da umidade do solo.'
),
(
    '2026-09-18 08:05:00',
    2,
    2,
    26.10,
    'Aumento da temperatura.'
);


-- ============================================================
-- 9. RECOMENDACAO
-- ============================================================

INSERT INTO recomendacao (
    id_plantio,
    timestamp_recomendacao,
    tipo,
    mensagem_recomendacao,
    valor_detectado,
    data_geracao_recomendacao,
    lida_recomendacao,
    status_recomendacao
)
VALUES
(
    1,
    '2026-09-18 07:40:00',
    'IRRIGACAO',
    'A umidade do solo esta abaixo do nivel recomendado. Verifique a necessidade de irrigacao.',
    42.50,
    '2026-09-18 07:40:00',
    FALSE,
    'ATIVA'
),
(
    1,
    '2026-09-18 08:10:00',
    'IRRIGACAO',
    'A umidade do solo apresentou nova reducao. Avalie a realizacao de irrigacao no talhao.',
    40.80,
    '2026-09-18 08:10:00',
    FALSE,
    'ATIVA'
),
(
    2,
    '2026-09-18 07:30:00',
    'MONITORAMENTO',
    'A umidade do solo esta dentro da faixa adequada para o plantio.',
    61.30,
    '2026-09-18 07:30:00',
    TRUE,
    'CONCLUIDA'
),
(
    3,
    '2026-09-18 07:25:00',
    'MONITORAMENTO',
    'A umidade do ar esta dentro da faixa esperada. Continue acompanhando as condicoes da lavoura.',
    73.40,
    '2026-09-18 07:25:00',
    TRUE,
    'CONCLUIDA'
),
(
    4,
    '2026-09-17 18:05:00',
    'SENSOR',
    'O sensor apresentou perda de comunicacao. Verifique o dispositivo instalado no talhao.',
    35.20,
    '2026-09-17 18:05:00',
    FALSE,
    'ATIVA'
);

-- ============================================================
-- FIM DO SEED
-- ============================================================