-- ============================================================
-- BANCO DE DADOS: SAFRASCAN
-- SGBD: PostgreSQL
-- ============================================================


-- ============================================================
-- 1. USUARIO
-- ============================================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,

    nome_usuario VARCHAR(100) NOT NULL,

    email_usuario VARCHAR(150) NOT NULL UNIQUE,

    telefone_usuario VARCHAR(20) NOT NULL,

    senha_hash VARCHAR(255) NOT NULL,

    tipo_usuario VARCHAR(30) NOT NULL,

    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ativo_usuario BOOLEAN NOT NULL DEFAULT TRUE
);


-- ============================================================
-- 2. CULTURA
-- ============================================================

CREATE TABLE cultura (
    id_cultura SERIAL PRIMARY KEY,

    nome_cultura VARCHAR(100) NOT NULL,

    ciclo_medio_dias INTEGER NOT NULL,

    CONSTRAINT chk_ciclo_medio_dias
        CHECK (ciclo_medio_dias > 0)
);


-- ============================================================
-- 3. PROPRIEDADE
-- ============================================================

CREATE TABLE propriedade (
    id_propriedade SERIAL PRIMARY KEY,

    id_usuario INTEGER NOT NULL,

    nome_propriedade VARCHAR(100) NOT NULL,

    municipio_propriedade VARCHAR(100) NOT NULL,

    estado_propriedade CHAR(2) NOT NULL,

    CONSTRAINT fk_propriedade_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 4. TALHAO
-- ============================================================

CREATE TABLE talhao (
    id_talhao SERIAL PRIMARY KEY,

    id_propriedade INTEGER NOT NULL,

    area_ha DECIMAL(10,2) NOT NULL,

    tipo_solo VARCHAR(100) NOT NULL,

    CONSTRAINT chk_area_talhao
        CHECK (area_ha > 0),

    CONSTRAINT fk_talhao_propriedade
        FOREIGN KEY (id_propriedade)
        REFERENCES propriedade(id_propriedade)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 5. PLANTIO
-- ============================================================

CREATE TABLE plantio (
    id_plantio SERIAL PRIMARY KEY,

    data_plantio DATE NOT NULL,

    id_talhao INTEGER NOT NULL,

    id_cultura INTEGER NOT NULL,

    data_colheita_prevista DATE NOT NULL,

    status VARCHAR(30) NOT NULL,

    CONSTRAINT chk_data_colheita
        CHECK (data_colheita_prevista >= data_plantio),

    CONSTRAINT fk_plantio_talhao
        FOREIGN KEY (id_talhao)
        REFERENCES talhao(id_talhao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_plantio_cultura
        FOREIGN KEY (id_cultura)
        REFERENCES cultura(id_cultura)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 6. SENSOR
-- ============================================================

CREATE TABLE sensor (
    id_sensor SERIAL PRIMARY KEY,

    id_talhao INTEGER NOT NULL,

    tipo_sensor VARCHAR(50) NOT NULL,

    identificador_dispositivo VARCHAR(100) NOT NULL UNIQUE,

    status_sensor VARCHAR(30) NOT NULL,

    data_instalacao_sensor TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    data_ultima_comunicacao TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sensor_talhao
        FOREIGN KEY (id_talhao)
        REFERENCES talhao(id_talhao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 7. GRANDEZA_FISICA
-- ============================================================

CREATE TABLE grandeza_fisica (
    id_grandeza SERIAL PRIMARY KEY,

    nome_grandeza VARCHAR(100) NOT NULL UNIQUE,

    unidade_medida VARCHAR(30) NOT NULL,

    descricao_grandeza VARCHAR(255)
);


-- ============================================================
-- 8. LEITURA_SENSOR
-- ============================================================

CREATE TABLE leitura_sensor (
    id_leitura BIGSERIAL PRIMARY KEY,

    timestamp_leitura TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    id_sensor INTEGER NOT NULL,

    id_grandeza INTEGER NOT NULL,

    valor_leitura DECIMAL(10,2) NOT NULL,

    outros_dados TEXT,

    CONSTRAINT fk_leitura_sensor
        FOREIGN KEY (id_sensor)
        REFERENCES sensor(id_sensor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_leitura_grandeza
        FOREIGN KEY (id_grandeza)
        REFERENCES grandeza_fisica(id_grandeza)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- ============================================================
-- 9. RECOMENDACAO
-- ============================================================

CREATE TABLE recomendacao (
    id_recomendacao SERIAL PRIMARY KEY,

    id_plantio INTEGER NOT NULL,

    timestamp_recomendacao TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    tipo VARCHAR(50) NOT NULL,

    mensagem_recomendacao TEXT NOT NULL,

    valor_detectado DECIMAL(10,2),

    data_geracao_recomendacao TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    lida_recomendacao BOOLEAN NOT NULL DEFAULT FALSE,

    status_recomendacao VARCHAR(30) NOT NULL,

    CONSTRAINT fk_recomendacao_plantio
        FOREIGN KEY (id_plantio)
        REFERENCES plantio(id_plantio)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
