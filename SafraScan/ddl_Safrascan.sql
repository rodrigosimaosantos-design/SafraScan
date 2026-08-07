
CREATE TABLE Página inicial (
  id_pagina_inicial INT SERIAL PRIMARY KEY, NOT NULL, AUTO_INCREMENT
  nome_empresa VARCHAR(100) NOT NULL,
  titulo_principal VARCHAR(10) NOT NULL
  descricao_safrascan TEXT NOT NULL
  data_criacao DATA NOT NULL, AUTOMATIC
  data_atualizacao DATA AUTOMATIC, NULl
  quantidade_acessos INT DEFAULT
);

CREATE TABLE Cadastro (
  id_cadastro INT PRIMARY KEY, NOT NULL, AUTO_INCREMENT
  id_nome_usuario VARCHAR NOT NULL,
  cpf CHAR UNIQUE, NOT NULL,
  email VARCHAR UNIQUE, NOT NULL,
  telefone VARCHAR NULL,
  id_nome_login VARCHAR UNIQUE, NOT NULL,
  id_senha_hash VARCHAR NOT NULL,
  id_tipo_usuario VARCHAR NOT NULL,

);

CREATE TABLE cardapio (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  descricao VARCHAR(200) NOT NULL,
  itens_utilizados TEXT
);

CREATE TABLE restricao (
  id SERIAL PRIMARY KEY,
  descricao VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE login (
    id_login INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    id_usuario INT NOT NULL,
    email_login TEXT NOT NULL,
    status_login BOOLEAN NOT NULL,
    ip_acesso TEXT NULL,
    data_hora_login DATETIME NOT NULL,
    data_hora_logout DATETIME NULL,
    tempo_sessao INT NULL,
    tempo_autenticacao INT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Cadastro(id_usuario)
);

CREATE TABLE configuracao_da_conta (
    id_canfiguracao INT,  
    id_usuario
    tema_interface
    idioma
    notificacao
    autenticacao_dois_fatores
    status_conta
    data_criacao
    data_ultima_atualizacao
    tempo_atualizacao
    quantidade_atualizacao
)

CREATE TABLE loja (
    id SERIAL PRIMARY KEY, INT
    id_sensor SERIAL FOREIGN KEY, INT
    nome_sensor TEXT, NOT NULL
    descricao_sensor TEXT, NULL
    especificacoes_tecnicas TEXT, NOT NULL
    compatibilidade TEXT, NOT NULL
    preco DECIMAL, NOT NULL
    quantidade_estoque INT, NOT NULL
    status_disponibilidade BOOLEAN, NOT NULL
    data_cadastro_produto DATETIME, AUTOMATIC
    quantidade_visualizacao INT, DEFAULT
)

CREATE TABLE Ajuda (
  id_ajuda INT SERIAL PRIMARY KEY
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL
  pergunta TEXT NOT NULL
  resposta TEXT NOT NULL
  palavras_chave TEXT NULL
  status_publicacao BOOLEAN NOT NULL
  data_publicacao DATA NOT NULL
  data_ultima_atualizacao DATA AUTOMATIC
  quantidade_visualizacao INT DEFAULT VALUE
);


