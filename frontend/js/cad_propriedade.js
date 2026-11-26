/*
 * Cadastro de propriedade: envia o formulário para POST /propriedade
 * usando o id do usuário que está logado (guardado pelo sessao.js).
 * Carregue com defer, depois do sessao.js.
 */
(() => {
    const API = window.SAFRASCAN_API_URL ?? (
      window.location.port === "8000"
        ? ""
        : `${window.location.protocol}//${window.location.hostname}:8000`
    );
    const PROXIMA_PAGINA = "cad_talhao.html"; // para onde ir depois de cadastrar
    const CHAVE_PROPRIEDADE = "safrascan_propriedade_ativa";
  
    const formulario = document.querySelector("#formPropriedade");
    const mensagem = document.querySelector("#mensagemPropriedade");
    const botao = formulario.querySelector('button[type="submit"]');
    const campoCep = document.querySelector("#cep_propriedade");
    const campoUsuario = document.querySelector("#id_usuario");
  
    function mostrar(texto, tipo = "") {
      mensagem.textContent = texto;
      mensagem.className = "propriedade-mensagem" + (tipo ? " " + tipo : "");
    }
  
    function travarFormulario() {
      formulario.querySelectorAll("input, select, button").forEach(el => { el.disabled = true; });
    }
  
    // O FastAPI devolve erros de validação (422) como uma lista.
    function textoDoErro(corpo, status) {
      const detalhe = corpo?.detail;
      if (Array.isArray(detalhe)) {
        return detalhe.map(i => `${i.loc?.at(-1) ?? "campo"}: ${i.msg}`).join(" | ");
      }
      return detalhe || `Erro ${status}`;
    }
  
    // Máscara do CEP: 00000-000
    campoCep.addEventListener("input", () => {
      const digitos = campoCep.value.replace(/\D/g, "").slice(0, 8);
      campoCep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
    });
  
    // Sem login não há id de usuário: bloqueia o formulário e manda para o login.
    if (!window.Sessao) {
      travarFormulario();
      mostrar("Erro: o arquivo sessao.js não foi carregado.", "erro");
      return;
    }
    const usuario = window.Sessao.usuario();
    if (!usuario) {
      travarFormulario();
      mostrar("Entre na sua conta para registrar uma propriedade. Redirecionando...", "erro");
      setTimeout(() => window.location.replace("login.html"), 1800);
      return;
    }
    campoUsuario.value = usuario.id_usuario;
  
    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
  
      const cep = campoCep.value.replace(/\D/g, "");
      if (cep.length !== 8) return mostrar("Informe um CEP com 8 dígitos.", "erro");
  
      // Só estes campos: a API rejeita campos extras.
      const dados = {
        id_usuario: Number(campoUsuario.value),
        nome_propriedade: document.querySelector("#nome_propriedade").value.trim(),
        endereco_propriedade: document.querySelector("#endereco_propriedade").value.trim(),
        municipio_propriedade: document.querySelector("#municipio_propriedade").value.trim(),
        estado_propriedade: document.querySelector("#estado_propriedade").value,
        cep_propriedade: Number(cep), // o modelo de propriedade.py espera um inteiro
        tamanho_ha: Number(document.querySelector("#tamanho_ha").value),
      };
  
      botao.disabled = true;
      mostrar("Salvando propriedade...");
      try {
        const resposta = await fetch(`${API}/propriedade`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        const corpo = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(textoDoErro(corpo, resposta.status));
  
        // As próximas páginas (talhão etc.) podem ler a propriedade ativa daqui.
        try {
          localStorage.setItem(CHAVE_PROPRIEDADE, JSON.stringify({
            id_propriedade: corpo.id_propriedade,
            nome_propriedade: corpo.nome_propriedade,
          }));
        } catch { /* sem acesso ao armazenamento */ }
  
        mostrar(`Propriedade "${corpo.nome_propriedade}" cadastrada!`, "ok");
        setTimeout(() => { window.location.href = PROXIMA_PAGINA; }, 1200);
      } catch (erro) {
        mostrar(
          erro instanceof TypeError ? "Não foi possível acessar o servidor." : erro.message,
          "erro"
        );
        botao.disabled = false;
      }
    });
  })();
  