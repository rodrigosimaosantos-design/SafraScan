# SafraScan
# Projeto FastAPI com Front-end HTML

## Descrição

Este projeto demonstra uma aplicação simples utilizando **Python com FastAPI** no back-end e **HTML, CSS e JavaScript** no front-end.

A proposta é:

- servir um arquivo `index.html` usando o FastAPI;
- configurar **CORS** para permitir comunicação entre front-end e back-end;
- disponibilizar uma rota de API para teste;
- organizar o projeto em duas pastas:
  - `backend`
  - `frontend`

---

# Estrutura do projeto

```bash
projeto/
├─ backend/
│  ├─ venv/
│  ├─ main.py
│  └─ requirements.txt
└─ frontend/
   ├─ index.html
   ├─ style.css
   └─ script.js
```

---

# Tecnologias utilizadas

- Python
- FastAPI
- Uvicorn
- HTML
- CSS
- JavaScript

---

# Objetivo do projeto

O objetivo é criar um projeto simples em que:

- o **FastAPI** funcione como back-end;
- o **HTML** seja aberto por uma rota GET;
- o front-end consiga consumir uma rota da API;
- o projeto fique organizado para facilitar o entendimento da separação entre **front-end** e **back-end**.

---

# 1. Criação da estrutura de pastas

No terminal, crie a estrutura do projeto:

```bash
mkdir projeto
cd projeto
mkdir backend frontend
```

---

# 2. Criando o ambiente virtual

Entre na pasta `backend`:

```bash
cd backend
```

Agora crie o ambiente virtual.

## Windows

```bash
python -m venv venv
```

## macOS / Linux

```bash
python3 -m venv venv
```

---

# 3. Ativando o ambiente virtual

## Windows

```bash
venv\Scripts\activate
```

## macOS / Linux

```bash
source venv/bin/activate
```

Quando o ambiente estiver ativo, o terminal normalmente exibirá algo como:

```bash
(venv)
```

---

# 4. Instalando as dependências

Com o ambiente virtual ativado, instale:

```bash
pip install fastapi uvicorn
```

Depois gere o arquivo `requirements.txt`:

```bash
pip freeze > requirements.txt
```

---

# 5. Arquivo `main.py`

Dentro da pasta `backend`, crie o arquivo `main.py` com o seguinte conteúdo:

```python
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminhos do projeto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))   # pasta backend
PROJECT_DIR = os.path.dirname(BASE_DIR)                 # pasta raiz do projeto
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")    # pasta frontend
INDEX_FILE = os.path.join(FRONTEND_DIR, "index.html")   # arquivo index.html

# Monta a pasta frontend como estática
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

# Rota principal que abre o HTML
@app.get("/")
def home():
    return FileResponse(INDEX_FILE)

# Rota de exemplo da API
@app.get("/api/alunos")
def listar_alunos():
    return [
        {"id": 1, "nome": "Ana", "turma": "1º IA"},
        {"id": 2, "nome": "Carlos", "turma": "1º IA"},
        {"id": 3, "nome": "Mariana", "turma": "1º IA"}
    ]
```

---

# 6. Arquivo `index.html`

Dentro da pasta `frontend`, crie o arquivo `index.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>FastAPI com Front-end</title>
  <link rel="stylesheet" href="/frontend/style.css">
</head>
<body>
  <h1>Projeto FastAPI com HTML</h1>

  <button onclick="buscarAlunos()">Buscar alunos</button>

  <ul id="lista-alunos"></ul>

  <script src="/frontend/script.js"></script>
</body>
</html>
```

---

# 7. Arquivo `style.css`

Dentro da pasta `frontend`, crie o arquivo `style.css`:

```css
body {
  font-family: Arial, sans-serif;
  margin: 40px;
  background-color: #f4f4f4;
}

h1 {
  color: #333;
}

button {
  padding: 10px 15px;
  cursor: pointer;
}

li {
  margin-top: 10px;
}
```

---

# 8. Arquivo `script.js`

Dentro da pasta `frontend`, crie o arquivo `script.js`:

```javascript
async function buscarAlunos() {
  const resposta = await fetch("/api/alunos");
  const alunos = await resposta.json();

  const lista = document.getElementById("lista-alunos");
  lista.innerHTML = "";

  alunos.forEach(aluno => {
    const item = document.createElement("li");
    item.textContent = `${aluno.nome} - ${aluno.turma}`;
    lista.appendChild(item);
  });
}
```

---

# 9. Explicação do funcionamento do back-end

## 9.1 `app = FastAPI()`

Cria a aplicação FastAPI.

```python
app = FastAPI()
```

---

## 9.2 Configuração do CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Essa configuração permite que o navegador aceite requisições entre front-end e back-end.

### Significado dos parâmetros:

- `allow_origins=["*"]`  
  Permite acesso de qualquer origem.

- `allow_credentials=True`  
  Permite envio de credenciais, como cookies e headers de autenticação.

- `allow_methods=["*"]`  
  Permite todos os métodos HTTP, como GET, POST, PUT e DELETE.

- `allow_headers=["*"]`  
  Permite todos os cabeçalhos HTTP.

---

## 9.3 Caminhos do projeto

```python
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")
INDEX_FILE = os.path.join(FRONTEND_DIR, "index.html")
```

Essas variáveis servem para localizar corretamente o front-end, mesmo com o `main.py` dentro da pasta `backend`.

### Exemplo

Se a estrutura for:

```bash
projeto/
├─ backend/
│  └─ main.py
└─ frontend/
   └─ index.html
```

então:

- `BASE_DIR` → pasta `backend`
- `PROJECT_DIR` → pasta raiz `projeto`
- `FRONTEND_DIR` → pasta `frontend`
- `INDEX_FILE` → arquivo `frontend/index.html`

---

## 9.4 `app.mount(...)`

```python
app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")
```

Esse comando faz o FastAPI servir arquivos estáticos da pasta `frontend`, como:

- `style.css`
- `script.js`
- imagens
- ícones
- outros arquivos estáticos

Por isso, no HTML, o CSS e o JS são carregados com:

```html
<link rel="stylesheet" href="/frontend/style.css">
<script src="/frontend/script.js"></script>
```

---

## 9.5 Rota `/`

```python
@app.get("/")
def home():
    return FileResponse(INDEX_FILE)
```

Essa rota abre o arquivo `index.html` quando o usuário acessa:

```bash
http://127.0.0.1:8000/
```

---

## 9.6 Rota `/api/alunos`

```python
@app.get("/api/alunos")
def listar_alunos():
    return [
        {"id": 1, "nome": "Ana", "turma": "1º IA"},
        {"id": 2, "nome": "Carlos", "turma": "1º IA"},
        {"id": 3, "nome": "Mariana", "turma": "1º IA"}
    ]
```

Essa rota retorna uma lista de alunos em formato JSON.

---

# 10. Explicação do funcionamento do front-end

## 10.1 `index.html`

O arquivo HTML contém:

- um título;
- um botão;
- uma lista vazia (`ul`) para receber os alunos;
- a importação do CSS e do JavaScript.

---

## 10.2 `script.js`

```javascript
async function buscarAlunos() {
  const resposta = await fetch("/api/alunos");
  const alunos = await resposta.json();

  const lista = document.getElementById("lista-alunos");
  lista.innerHTML = "";

  alunos.forEach(aluno => {
    const item = document.createElement("li");
    item.textContent = `${aluno.nome} - ${aluno.turma}`;
    lista.appendChild(item);
  });
}
```

Esse código faz o seguinte:

1. envia uma requisição GET para `/api/alunos`;
2. recebe os dados em JSON;
3. limpa a lista da página;
4. cria um `<li>` para cada aluno;
5. mostra os alunos no HTML.

---

# 11. Como executar o projeto

Entre na pasta `backend`:

```bash
cd backend
```

Ative o ambiente virtual.

## Windows

```bash
venv\Scripts\activate
```

## macOS / Linux

```bash
source venv/bin/activate
```

Agora execute o servidor:

```bash
uvicorn main:app --reload
```

---

# 12. Acessando o sistema

Com o servidor rodando, abra no navegador:

## Página principal

```bash
http://127.0.0.1:8000/
```

## Rota da API

```bash
http://127.0.0.1:8000/api/alunos
```

---

# 13. Resultado esperado

Ao acessar a página principal, será exibido o HTML.

Ao clicar no botão **Buscar alunos**, o JavaScript fará uma requisição à rota da API e mostrará os alunos na tela.

---

# 14. Comandos resumidos

## Criar estrutura
```bash
mkdir projeto
cd projeto
mkdir backend frontend
```

## Criar e ativar o ambiente virtual

### Windows
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

## Instalar dependências
```bash
pip install fastapi uvicorn
pip freeze > requirements.txt
```

## Rodar o projeto
```bash
uvicorn main:app --reload
```

---

# 15. Melhorias futuras

Esse projeto pode ser expandido com:

- rotas POST, PUT e DELETE;
- conexão com banco de dados;
- autenticação;
- separação em camadas (`routes`, `controllers`, `models`);
- uso de templates;
- integração com Vue ou React;
- organização do front-end em componentes.

---

# 16. Observação final

Este projeto foi pensado como uma base didática para compreender:

- como o FastAPI funciona;
- como servir um HTML pelo back-end;
- como configurar CORS;
- como conectar front-end e back-end em uma aplicação simples.
