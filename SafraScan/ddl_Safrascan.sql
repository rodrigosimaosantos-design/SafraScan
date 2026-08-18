
CREATE TABLE pagina_inicial (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(100) NOT NULL,
    titulo_principal VARCHAR(150) NOT NULL,
    descricao_safrascan TEXT NOT NULL,
    data_criacao DATE NOT NULL,
    data_atualizacao DATE,
    quantidade_acessos INT DEFAULT 0
);


CREATE TABLE cadastro (
    id SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    nome_login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(30) NOT NULL,
    status_cadastro BOOLEAN DEFAULT TRUE,
    data_cadastro DATE NOT NULL,
    quantidade_cadastro INT DEFAULT 0
);

CREATE TABLE sensores (
    id SERIAL PRIMARY KEY,
    nome_sensor VARCHAR(100) NOT NULL,
    tipo_sensor VARCHAR(50) NOT NULL,
    status_sensor BOOLEAN NOT NULL DEFAULT FALSE,
    nivel_bateria INT,
    intensidade_sinal NUMERIC(5,2),
    data_atualizacao DATE,
    data_comunicacao TIMESTAMP,
    tempo_resposta INT DEFAULT 0,
    quantidade_leitura INT DEFAULT 0
);


CREATE TABLE loja (
    id SERIAL PRIMARY KEY,
    nome_sensor VARCHAR(100) NOT NULL,
    descricao_sensor TEXT,
    especificacoes_tecnicas TEXT NOT NULL,
    compatibilidade VARCHAR(150) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    quantidade_estoque INT NOT NULL,
    status_disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro_produto DATE NOT NULL,
    quantidade_visualizacao INT DEFAULT 0
);


CREATE TABLE ajuda (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    palavras_chave TEXT,
    status_publicacao BOOLEAN NOT NULL DEFAULT TRUE,
    data_publicacao DATE NOT NULL,
    data_ultima_atualizacao DATE,
    quantidade_visualizacao INT DEFAULT 0
);


CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    email_login VARCHAR(150) NOT NULL,
    status_login BOOLEAN NOT NULL DEFAULT TRUE,
    ip_acesso VARCHAR(45),
    data_hora_login TIMESTAMP NOT NULL,
    data_hora_logout TIMESTAMP,
    tempo_sessao INT,
    tempo_autenticacao INT,

    FOREIGN KEY (id_usuario)
        REFERENCES cadastro(id)
);

CREATE TABLE configuracao_da_conta (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tema_interface VARCHAR(20) DEFAULT 'claro',
    idioma VARCHAR(20) DEFAULT 'pt-BR',
    notificacao BOOLEAN DEFAULT TRUE,
    autenticacao_dois_fatores BOOLEAN DEFAULT FALSE,
    status_conta VARCHAR(20) NOT NULL DEFAULT 'ativa',
    data_criacao DATE NOT NULL,
    data_ultima_atualizacao DATE,
    tempo_atualizacao INT DEFAULT 0,
    quantidade_atualizacao INT DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES cadastro(id)
);


CREATE TABLE dashboard (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sensor INT NOT NULL,
    nome_sensor VARCHAR(100) NOT NULL,
    status_sensor BOOLEAN NOT NULL DEFAULT FALSE,
    funcao_sensor VARCHAR(150) NOT NULL,
    grafico_funcionamento TEXT,
    dados_monitorados BOOLEAN NOT NULL DEFAULT TRUE,
    data_leitura TIMESTAMP,
    data_atualizacao TIMESTAMP,
    quantidade_sensores_ativos INT DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES cadastro(id),

    FOREIGN KEY (id_sensor)
        REFERENCES sensores(id)
);


CREATE TABLE pagina_monitoramento (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sensor INT NOT NULL,
    tipo_dado VARCHAR(50) NOT NULL,
    valor_coletado NUMERIC(10,2) NOT NULL,
    umidade_solo_medida NUMERIC(5,2) NOT NULL,
    temperatura_medida NUMERIC(5,2) NOT NULL,
    umidade_ar_medida NUMERIC(5,2) NOT NULL,
    data_hora_coleta TIMESTAMP NOT NULL,
    status_monitoramento BOOLEAN NOT NULL DEFAULT TRUE,
    quantidade_registros INT DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES cadastro(id),

    FOREIGN KEY (id_sensor)
        REFERENCES sensores(id)
);