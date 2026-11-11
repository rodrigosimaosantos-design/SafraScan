SafraScan — telas atualizadas

Estrutura

backend/: backend enviado nesta conversa (FastAPI + Supabase).

frontend/templates/: telas Início, Sobre, Plantios, Login e Cadastro.

frontend/css/base.css: estilos compartilhados e estilos das novas telas.

frontend/js/plantio.js: integração CRUD da tela de plantios.

frontend/js/auth.js: validação visual das telas de login/cadastro.

Como executar

Configure SUPABASE_URL e SUPABASE_KEY em um arquivo .env dentro de backend/.

Instale as dependências: pip install -r backend/requirements.txt.

Inicie a API a partir da pasta backend: uvicorn main:app --reload.

Abra frontend/templates/index.html pelo Live Server do VS Code na porta 5500.

A tela de plantios consome os endpoints GET/POST/PUT/DELETE /plantio, além de GET /talhao e GET /cultura. A API deve estar disponível em http://127.0.0.1:8000. Se necessário, altere window.SAFRASCAN_API_URL no navegador antes de carregar a tela.

Observação importante sobre login e cadastro

O backend recebido possui CRUD de usuários (/usuario), mas não possui rota de login, verificação de senha ou geração de hash seguro no servidor. Por segurança, as telas de login e cadastro foram construídas visualmente e validam os campos no navegador, mas não enviam nem armazenam senhas. Para ativar autenticação real, é necessário implementar no backend hash de senha seguro e endpoints próprios de cadastro/autenticação. O campo senha_hash existente não deve receber uma senha em texto puro.
