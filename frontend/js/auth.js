
// auth.js - autenticação e cadastro do SafraScan.

const API = window.SAFRASCAN_API_URL ?? (
  window.location.port === "8000"
    ? ""
    : `${window.location.protocol}//${window.location.hostname}:8000`
);

// Envia requisições de autenticação para a API.
async function enviarAuth(endpoint, dados) {
  const resposta = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      corpo.detail || `Erro HTTP ${resposta.status}`
    );
  }

  return corpo;
}

// Verifica se o usuário já possui uma propriedade cadastrada.
async function redirecionarUsuario(usuario) {
  const resposta = await fetch(
    `${API}/propriedade?id_usuario=${encodeURIComponent(usuario.id_usuario)}`
  );

  const propriedades = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível verificar os cadastros da sua propriedade."
    );
  }

  if (!Array.isArray(propriedades)) {
    throw new Error(
      "O servidor retornou uma resposta inválida ao consultar suas propriedades."
    );
  }

  // Usuário que já possui propriedade:
  // segue para o dashboard.
  if (propriedades.length > 0) {
    window.location.replace("dashboard.html");
    return;
  }

  // Usuário sem propriedade:
  // continua o cadastro inicial.
  window.location.replace("cad_propriedade.html");
}


// Identifica os formulários presentes na página.
const loginForm = document.querySelector("#form-login");
const cadastroForm = document.querySelector("#form-cadastro");


// ============================================
// LOGIN
// ============================================

if (loginForm) {

  // Se já estiver autenticado, verifica suas propriedades.
  if (window.Sessao?.logado()) {
    redirecionarUsuario(window.Sessao.usuario())
      .catch(erro => {
        const aviso = document.querySelector("#login-message");

        aviso.hidden = false;
        aviso.textContent = erro.message;
        aviso.className = "ss-note error";
      });
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const aviso = document.querySelector("#login-message");
    const botao = loginForm.querySelector(
      'button[type="submit"]'
    );

    aviso.hidden = false;
    aviso.textContent = "Verificando seus dados...";
    aviso.className = "ss-note";

    botao.disabled = true;

    try {
      // Autentica o usuário.
      const resultado = await enviarAuth("/auth/login", {
        email_usuario: document
          .querySelector("#email-login")
          .value
          .trim(),

        senha: document
          .querySelector("#senha-login")
          .value
      });

      // Salva o token JWT e os dados do usuário.
      window.Sessao.salvar(
        resultado.access_token,
        resultado.usuario
      );

      aviso.textContent =
        `Bem-vindo(a), ${resultado.usuario.nome_usuario}!`;

      aviso.className = "ss-note success";

      // Decide para qual página o usuário deve ir.
      await redirecionarUsuario(resultado.usuario);

    } catch (erro) {
      aviso.textContent = erro.message;
      aviso.className = "ss-note error";

      botao.disabled = false;
    }
  });
}


// ============================================
// CADASTRO ALTERNATIVO
// ============================================

// Mantém o comportamento do formulário de cadastro
// caso essa estrutura também seja utilizada em outra página.

if (cadastroForm) {

  cadastroForm.addEventListener("submit", async event => {
    event.preventDefault();

    const aviso = document.querySelector("#cadastro-message");

    const botao = cadastroForm.querySelector(
      'button[type="submit"]'
    );

    const senha = document
      .querySelector("#senha-cadastro")
      .value;

    const confirmar = document
      .querySelector("#confirmar-cadastro")
      .value;

    if (senha !== confirmar) {
      aviso.textContent =
        "As senhas informadas não coincidem.";

      aviso.className = "ss-note error";
      return;
    }

    const dados = {
      nome_usuario: document
        .querySelector("#nome-cadastro")
        .value
        .trim(),

      email_usuario: document
        .querySelector("#email-cadastro")
        .value
        .trim(),

      telefone_usuario: document
        .querySelector("#telefone-cadastro")
        .value
        .trim(),

      tipo_usuario: document
        .querySelector("#tipo-cadastro")
        .value,

      senha
    };

    botao.disabled = true;

    aviso.textContent = "Enviando cadastro...";
    aviso.className = "ss-note";

    try {
      const resultado = await enviarAuth(
        "/auth/cadastro",
        dados
      );

      aviso.textContent =
        resultado.mensagem ||
        "Cadastro realizado com sucesso. Você já pode entrar.";

      aviso.className = "ss-note success";

      cadastroForm.reset();

    } catch (erro) {
      aviso.textContent = erro.message;
      aviso.className = "ss-note error";

    } finally {
      botao.disabled = false;
    }
  });
}
