
CREATE TABLE Página inicial (
  id_pagina_inicial INT SERIAL PRIMARY KEY, NOT NULL, AUTO_INCREMENT
  nome_empresa VARCHAR(100) NOT NULL,
  titulo_principal VARCHAR(10) NOT NULL
  descricao_safrascan VARCHAR, NOT NULL
  data_criacao DATA NOT NULL, AUTOMATIC
  data_atualizacao DATA AUTOMATIC, NULL
  quantidade_acessos INT DEFAULT
);

CREATE TABLE Cadastro (
  id_cadastro INT, PRIMARY KEY, NOT NULL, AUTO_INCREMENT
  id_nome_usuario VARCHAR, NOT NULL,
  id_cpf CHAR UNIQUE, NOT NULL,
  email VARCHAR, UNIQUE, NOT NULL,
  telefone VARCHAR, NULL,
  id_nome_login VARCHAR, UNIQUE, NOT NULL,
  id_senha_hash VARCHAR, NOT NULL,
  id_tipo_usuario VARCHAR, NOT NULL,
  status_cadastro BOOLEAN, DEFAULT TRUE,
  data_cadastro DATA, AUTOMATIC, NOT NULL,
  quantidade_cadastro INT, DEFAULT VALUE
  );

CREATE TABLE login (
    id_login INT, AUTO_INCREMENT PRIMARY KEY NOT NULL,
    id_usuario INT, NOT NULL,
    email_login VARCHAR, NOT NULL,
    status_login BOOLEAN, NOT NULL,
    ip_acesso VARCHAR, NULL,
    data_hora_login DATETIME, NOT NULL,
    data_hora_logout DATETIME, NULL,
    tempo_sessao INT, NULL,
    tempo_autenticacao INT, NULL,
    FOREIGN KEY (id_usuario) REFERENCES Cadastro(id_usuario)
);

CREATE TABLE configuracao_da_conta (
    id_canfiguracao INT, CHAVE PRIMARIA, NOT NULL, AUTO_INCREMENT
    id_usuario INT, CHAVE ESTRANGEIRA, NOT NULL 
    tema_interface VARCHAR, DEFAULT
    idioma VARCHAR, DEFAULT
    notificacao BOOLEAN, DEFAULT
    autenticacao_dois_fatores BOOLEAN, DEFAULT
    status_conta TEXT, NOT NULL
    data_criacao DATA, AUTOMATIC
    data_ultima_atualizacao DATA, AUTOMATIC
    tempo_atualizacao INT, CALCULADO
    quantidade_atualizacao INT, VALOR PADRAO
)

CREATE TABLE loja (
    id SERIAL PRIMARY KEY, INT
    id_sensor SERIAL FOREIGN KEY, INT
    nome_sensor VARCHAR, NOT NULL
    descricao_sensor VARCHAR, NULL
    especificacoes_tecnicas VARCHAR, NOT NULL
    compatibilidade VARCHAR, NOT NULL
    preco DECIMAL, NOT NULL
    quantidade_estoque INT, NOT NULL
    status_disponibilidade BOOLEAN, NOT NULL
    data_cadastro_produto DATETIME, AUTOMATIC
    quantidade_visualizacao INT, DEFAULT
)

CREATE TABLE ajuda (
  id_ajuda INT SERIAL PRIMARY KEY
  titulo VARCHAR NOT NULL,
  categoria VARCHAR NOT NULL
  pergunta VARCHAR NOT NULL
  resposta VARCHAR NOT NULL
  palavras_chave VARCHAR NULL
  status_publicacao BOOLEAN NOT NULL
  data_publicacao DATA NOT NULL
  data_ultima_atualizacao DATA AUTOMATIC
  quantidade_visualizacao INT DEFAULT VALUE
);

CREATE TABLE ir_para_o_aplicativo (
    id_redirecionamento INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    id_usuario INT NOT NULL,
    url_aplicativo VARCHAR(255) NOT NULL,
    plataforma VARCHAR(100) NOT NULL,
    status_redirecionamento BOOLEAN NOT NULL,
    data_acesso DATE DEFAULT CURRENT_DATE,
    data_ultimo_acesso DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    quantidade_redirecionamento DECIMAL DEFAULT 0,
    FOREIGN KEY (id_usuario) REFERENCES Cadastro(id_cadastro)
);

CREATE TABLE dashboard (
  id SERIAL PRIMARY KEY, INT
  id_usuario SERIAL FOREIGN KEY, INT
  id_sensor SERIAL FOREIGN KEY, INT
  nome_sensor VARCHAR, NOT NULL
  status_sensor BOOLEAN, NOT NULL
  funcao_sensor VARCHAR, NOT NULL
  grafico_funcionamento INT, NULL
  dados_monitorados BOOLEAN, NOT NULL
  data_leitura DATETIME, AUTOMATIC
  data_atualizacao DATETIME, AUTOMATIC
  quantidade_sensores_ativo DECIMAL, DEFAULT
)

CREATE TABLE Página de monitoramento (
  id_monitoramento INT, SERIAL PRIMARY KEY
  id_usuario INT, FOREIGN KEY
  id_sensor INT, FOREIGN KEY
  tipo_dado VARCHAR, NOT NULL
  valor_coletado DECIMAL NOT NULL
  umidade_solo_medida INT, NOT NULL
  temperatura_medida INT, NOT NULL
  umidade_ar_medida INT, NOT NULL
  data_hora_coleta DATA, INT, AUTOMATIC
  status_monitoramento BOOLEAN, NOT NULL
  quantidade_registros DECIMAL, DEFAULT
);

CREATE TABLE Sensores (
  id_pagina_sensores INT, PRIMARY KEY,
  id_sensor INT, FOREIGN KEY,
  nome_sensor VARCHAR, NOT NULL,
  tipo_sensor VARCHAR, NOT NULL,
  status_sensor BOOLEAN, NOT NULL,
  nivel_bateria INT, NOT NULL,
  intensidade_sinal DECIMAL, NOT NULL,
  data_atualizacao DATA, AUTOMATIC,
  data_comunicacao DATETIME, AUTOMATIC,
  tempo_resposta TIME GENERATED ALWAYS AS (TIMEDIFF(data_comunicacao, NOW())) VIRTUAL,
  quantidade_leitura INT TEXT, DEFAULT VALUE
);
