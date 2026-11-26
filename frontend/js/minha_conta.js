/*
 * Minha Conta: mostra os dados do usuário logado e da sua propriedade.
 * Carregue com defer, depois do sessao.js.
 */
(() => {
  const API = window.SAFRASCAN_API_URL ?? (
    window.location.port === "8000"
      ? ""
      : `${window.location.protocol}//${window.location.hostname}:8000`
  );
  const CHAVE_PROPRIEDADE = "safrascan_propriedade_ativa"; // gravada pelo cadastro de propriedade
  const $ = (seletor) => document.querySelector(seletor);

  // Esta página só faz sentido com login.
  if (!window.Sessao || !window.Sessao.logado()) {
    window.location.replace("login.html");
    return;
  }
  const sessao = window.Sessao.usuario();

  function formatarTelefone(valor) {
    const d = String(valor ?? "").replace(/\D/g, "");
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return valor || "—";
  }

  function avisar(texto) {
    const aviso = $("#mensagem-conta");
    aviso.textContent = texto;
    aviso.hidden = false;
  }

  function preencherUsuario(u) {
    $("#saudacao").textContent = `Olá, ${u.nome_usuario}!`;
    $("#tipo-usuario").textContent = u.tipo_usuario || "";
    $("#email-usuario").textContent = u.email_usuario || "—";
    if (u.telefone_usuario !== undefined) {
      $("#telefone-usuario").textContent = formatarTelefone(u.telefone_usuario);
    }
  }

  function preencherPropriedade(p) {
    const temPropriedade = p !== null;
    $("#dados-propriedade").hidden = !temPropriedade;
    $("#sem-propriedade").hidden = temPropriedade;
    $("#nome-fazenda").textContent = temPropriedade ? p.nome_propriedade : "";
    if (temPropriedade) {
      $("#nome-propriedade").textContent = p.nome_propriedade;
      $("#local-propriedade").textContent = `${p.municipio_propriedade}-${p.estado_propriedade}`;
    }
  }

  async function buscarJson(caminho) {
    const resposta = await fetch(`${API}${caminho}`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    return resposta.json();
  }

  async function carregar() {
    preencherUsuario(sessao); // o que veio do login aparece na hora
    $("#telefone-usuario").textContent = "…";

    const [usuario, propriedades] = await Promise.allSettled([
      buscarJson(`/usuario/${sessao.id_usuario}`),
      buscarJson(`/propriedade?id_usuario=${sessao.id_usuario}`),
    ]);

    if (usuario.status === "fulfilled") {
      preencherUsuario(usuario.value);
    } else {
      $("#telefone-usuario").textContent = "—";
      avisar("Não foi possível carregar todos os dados da conta.");
    }

    if (propriedades.status === "fulfilled") {
      // Filtra aqui também, para funcionar mesmo que a API devolva todas as propriedades.
      const minhas = propriedades.value.filter(p => p.id_usuario === sessao.id_usuario);
      let ativa = null;
      try { ativa = JSON.parse(localStorage.getItem(CHAVE_PROPRIEDADE)); } catch { /* ignora */ }
      preencherPropriedade(minhas.find(p => p.id_propriedade === ativa?.id_propriedade) ?? minhas[0] ?? null);
    } else {
      preencherPropriedade(null);
      avisar("Não foi possível carregar os dados da propriedade.");
    }
  }

  // Voltar para a página de onde a pessoa veio (a conta abre de qualquer tela).
  $("#voltar").addEventListener("click", (evento) => {
    if (window.history.length > 1) { evento.preventDefault(); window.history.back(); }
  });

  // O logout fica só aqui, longe do nome de usuário, para não ser acionado sem querer.
  $("#logout").addEventListener("click", (evento) => {
    evento.preventDefault();
    window.Sessao.sair();
  });

  carregar();
})();
