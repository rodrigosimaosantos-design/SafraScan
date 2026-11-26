/*
 * Sessão do usuário, compartilhada por todas as páginas.
 * Carregue em cada página:  <script src="../js/sessao.js" defer></script>
 * - Guarda/lê o token e os dados do usuário (devolvidos por /auth/login).
 * - Mostra "Olá, <nome>" em qualquer página com login; o nome leva à tela Minha Conta
 *   (é lá que fica o logout).
 * - Páginas que não devem mostrar o nome: <body data-sem-usuario>.
 */
(() => {
  const CHAVE_TOKEN = "safrascan_token";
  const CHAVE_USUARIO = "safrascan_usuario";
  const PAGINA_CONTA = "ajustes_perfil.html";
  const PAGINA_SAIDA = "saindo.html"; // tela de transição que leva ao index.html

  function tokenValido(token) {
    try {
      const corpo = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(corpo)).exp * 1000 > Date.now();
    } catch { return false; }
  }

  const Sessao = {
    token() {
      try { return localStorage.getItem(CHAVE_TOKEN); } catch { return null; }
    },
    usuario() {
      try {
        if (!tokenValido(this.token())) { this.limpar(); return null; }
        return JSON.parse(localStorage.getItem(CHAVE_USUARIO));
      } catch { return null; }
    },
    logado() { return this.usuario() !== null; },
    salvar(token, usuario) {
      localStorage.setItem(CHAVE_TOKEN, token);
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    },
    limpar() {
      try {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_USUARIO);
      } catch { /* sem acesso ao armazenamento */ }
    },
    // replace (e não href) tira a página protegida do histórico: o botão Voltar
    // não leva de volta a uma tela que exige login.
    sair() { this.limpar(); window.location.replace(PAGINA_SAIDA); },
  };
  window.Sessao = Sessao;

  function mostrarUsuario() {
    const usuario = Sessao.usuario();
    const corpo = document.body;
    if (!usuario || corpo.classList.contains("pagina-login") || corpo.hasAttribute("data-sem-usuario")) return;

    const estilo = document.createElement("style");
    estilo.textContent = `
      .ss-usuario { position: fixed; top: 12px; right: 12px; z-index: 1000;
        display: inline-flex; align-items: center; padding: 8px 16px;
        font: 600 14px/1.2 var(--font-family, Arial, sans-serif);
        color: var(--text-main, #201e1a); text-decoration: none;
        background: var(--bg-card, #f3eee6);
        border: 1px solid var(--border-color, #d8d2c8); border-radius: 999px;
        box-shadow: var(--shadow-floating, 0 6px 16px rgba(0,0,0,.12));
        transition: background .15s ease; }
      .ss-usuario:hover { background: color-mix(in srgb, var(--cor-primaria, #305c0e) 10%, var(--bg-card, #f3eee6)); }
      .ss-usuario--nav { position: static; box-shadow: none; }`;
    document.head.appendChild(estilo);

    const link = document.createElement("a");
    link.className = "ss-usuario";
    link.href = PAGINA_CONTA;
    link.title = "Minha conta";
    link.textContent = "Olá, " + usuario.nome_usuario.trim().split(/\s+/)[0]; // textContent evita injeção de HTML

    // Na página inicial o nome ocupa o lugar de "Login / Registre-se".
    const navInicio = document.querySelector(".inicio-nav");
    if (navInicio) {
      link.classList.add("ss-usuario--nav");
      navInicio.replaceChildren(link);
    } else {
      corpo.appendChild(link);
    }
  }

  mostrarUsuario();
})();
