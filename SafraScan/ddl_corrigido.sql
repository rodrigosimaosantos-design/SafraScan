
CREATE TABLE "Página inicial" (
    id_pagina_inicial SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(100) NOT NULL,
    titulo_principal VARCHAR(10) NOT NULL,
    descricao_safrascan VARCHAR(255) NOT NULL,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_atualizacao DATE DEFAULT CURRENT_DATE,
    quantidade_acessos INT DEFAULT 0
);


CREATE TABLE Cadastro (
    id_cadastro SERIAL PRIMARY KEY,
    id_nome_usuario VARCHAR(100) NOT NULL,
    id_cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    id_nome_login VARCHAR(50) UNIQUE NOT NULL,
    id_senha_hash VARCHAR(255) NOT NULL,
    id_tipo_usuario VARCHAR(30) NOT NULL,
    status_cadastro BOOLEAN DEFAULT TRUE,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    quantidade_cadastro INT DEFAULT 0
);


CREATE TABLE Sensores (
    id_pagina_sensores SERIAL PRIMARY KEY,
    id_sensor INT,
    nome_sensor VARCHAR(100) NOT NULL,
    tipo_sensor VARCHAR(50) NOT NULL,
    status_sensor BOOLEAN NOT NULL,
    nivel_bateria INT NOT NULL,
    intensidade_sinal DECIMAL(10,2) NOT NULL,
    data_atualizacao DATE DEFAULT CURRENT_DATE,
    data_comunicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tempo_resposta TIME,
    quantidade_leitura INT DEFAULT 0
);


CREATE TABLE loja (
    id SERIAL PRIMARY KEY,
    id_sensor INT,
    nome_sensor VARCHAR(100) NOT NULL,
    descricao_sensor VARCHAR(255),
    especificacoes_tecnicas VARCHAR(500) NOT NULL,
    compatibilidade VARCHAR(150) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT NOT NULL,
    status_disponibilidade BOOLEAN NOT NULL,
    data_cadastro_produto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantidade_visualizacao INT DEFAULT 0
);


CREATE TABLE ajuda (
    id_ajuda SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    pergunta VARCHAR(500) NOT NULL,
    resposta VARCHAR(1000) NOT NULL,
    palavras_chave VARCHAR(500),
    status_publicacao BOOLEAN NOT NULL,
    data_publicacao DATE NOT NULL,
    data_ultima_atualizacao DATE DEFAULT CURRENT_DATE,
    quantidade_visualizacao INT DEFAULT 0
);


CREATE TABLE login (
    id_login SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    email_login VARCHAR(150) NOT NULL,
    status_login BOOLEAN NOT NULL,
    ip_acesso VARCHAR(45),
    data_hora_login TIMESTAMP NOT NULL,
    data_hora_logout TIMESTAMP,
    tempo_sessao INT,
    tempo_autenticacao INT,

    FOREIGN KEY (id_usuario)
        REFERENCES Cadastro(id_cadastro)
);


CREATE TABLE configuracao_da_conta (
    id_canfiguracao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tema_interface VARCHAR(20) DEFAULT 'claro',
    idioma VARCHAR(20) DEFAULT 'pt-BR',
    notificacao BOOLEAN DEFAULT TRUE,
    autenticacao_dois_fatores BOOLEAN DEFAULT FALSE,
    status_conta TEXT NOT NULL,
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_ultima_atualizacao DATE DEFAULT CURRENT_DATE,
    tempo_atualizacao INT,
    quantidade_atualizacao INT DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES Cadastro(id_cadastro)
);


CREATE TABLE dashboard (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sensor INT NOT NULL,
    nome_sensor VARCHAR(100) NOT NULL,
    status_sensor BOOLEAN NOT NULL,
    funcao_sensor VARCHAR(150) NOT NULL,
    grafico_funcionamento INT,
    dados_monitorados BOOLEAN NOT NULL,
    data_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantidade_sensores_ativo DECIMAL DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES Cadastro(id_cadastro),

    FOREIGN KEY (id_sensor)
        REFERENCES Sensores(id_pagina_sensores)
);


CREATE TABLE "Página de monitoramento" (
    id_monitoramento SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_sensor INT NOT NULL,
    tipo_dado VARCHAR(50) NOT NULL,
    valor_coletado DECIMAL(10,2) NOT NULL,
    umidade_solo_medida INT NOT NULL,
    temperatura_medida INT NOT NULL,
    umidade_ar_medida INT NOT NULL,
    data_hora_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_monitoramento BOOLEAN NOT NULL,
    quantidade_registros DECIMAL DEFAULT 0,

    FOREIGN KEY (id_usuario)
        REFERENCES Cadastro(id_cadastro),

    FOREIGN KEY (id_sensor)
        REFERENCES Sensores(id_pagina_sensores)
);
