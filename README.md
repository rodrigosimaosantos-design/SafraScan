# SafraScan — integração frontend, API e Supabase

## Estrutura
- `backend/`: API FastAPI e acesso ao Supabase.
- `frontend/templates/`: páginas HTML.
- `frontend/css/`: estilos.
- `frontend/js/`: scripts do navegador.

## 1. Configurar o banco Supabase
1. Abra o projeto Supabase usado pelo SafraScan.
2. Em **Project Settings → API**, copie a Project URL e a chave `anon`/publishable.
3. Copie `backend/.env.example` para `backend/.env`.
4. Preencha `SUPABASE_URL` e `SUPABASE_KEY`.
5. Defina `JWT_SECRET_KEY` com uma chave aleatória longa. Não compartilhe nem envie o arquivo `.env`.

O banco precisa conter as tabelas e colunas usadas pelos modelos e controllers deste projeto (`usuario`, `propriedade`, `talhao`, `cultura`, `plantio`, `sensor`, `grandeza_fisica` e `leitura_sensor`). Este pacote não executa migrações nem altera o esquema do banco.

## 2. Instalar dependências
No terminal, entre na pasta `backend` e execute:

```powershell
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

## 3. Iniciar o sistema
Ainda dentro de `backend`:

```powershell
uvicorn main:app --reload
```

Abra **http://127.0.0.1:8000**. O FastAPI entrega as páginas, os arquivos CSS/JS/imagens e os endpoints da API no mesmo endereço. A documentação da API fica em **http://127.0.0.1:8000/docs**.

## 4. O que está conectado
- A página inicial consulta `/api/health` para verificar a API e o banco.
- A tela Plantio consulta `/talhao`, `/cultura` e `/plantio`, e realiza cadastro, edição e exclusão.
- Cadastro e login usam `/auth/cadastro` e `/auth/login`. A senha é transformada em hash `scrypt` no servidor; o hash não é devolvido nas respostas.
- O login emite um token JWT com validade de 8 horas.

## Observações de segurança e funcionamento
- O token de login é guardado em `sessionStorage`. Os endpoints CRUD existentes ainda não exigem esse token; portanto, o login identifica o usuário, mas a proteção de cada operação por sessão/perfil ainda precisa ser implementada antes de disponibilizar o sistema publicamente.
- Nunca publique o arquivo `.env` nem use a chave `service_role` no navegador. A chave do Supabase fica somente no backend.
- Se aparecer erro 502, consulte o corpo da resposta e o terminal do Uvicorn. O endpoint `/api/health` também ajuda a identificar falha de comunicação com o Supabase.
- O código pressupõe que o esquema real do Supabase corresponde aos nomes de tabelas e campos dos modelos Python. Se houver divergência, será necessário ajustar o modelo ou o banco.
