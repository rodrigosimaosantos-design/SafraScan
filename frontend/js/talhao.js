
/* talhao.js - Tela "Editar" do SafraScan.

   Funcionalidades:
   - Exibe os talhões da propriedade do usuário logado.
   - Permite editar nome, área e tipo de solo.
   - Utiliza o ícone de lápis para habilitar o modo de edição.
   - Salva alterações somente após confirmação do usuário.
   - Permite cancelar a edição e restaurar os dados originais.
   - Não associa talhões diretamente às culturas.
   - Não agrupa talhões por cultura.
   - Mantém o gerenciamento independente das culturas.

   O banco guarda a área em hectares; a tela mostra km².
   (1 km² = 100 ha).
*/

(() => {
  'use strict';

  /* ---------- Configuração ---------- */

  const API = window.SAFRASCAN_API_URL ?? (
    window.location.port === '8000'
      ? ''
      : `${window.location.protocol}//${window.location.hostname}:8000`
  );

  const TIPOS_SOLO_BASE = [
    'Terra comum',
    'Vermelha',
    'Arenoso',
    'Argiloso',
    'Humífero'
  ];

  const ICONE_LAPIS = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 17.250V21h3.750L17.810 9.940l-3.750-3.750L3 17.250zM20.710 7.040a1 1 0 0 0 0-1.410l-2.340-2.340a1 1 0 0 0-1.410 0l-1.830 1.830 3.750 3.750 1.830-1.830z"/>
    </svg>
  `;

  /* ---------- Estado ---------- */

  const estado = {
    talhoes: [],
    culturas: []
  };

  let propriedade = null;

  // Controle de edição dos talhões.
  let editandoTalhaoId = null;
  let dadosOriginais = null;
  let salvandoTalhao = false;

  // Controle de edição das culturas.
  let editandoCulturas = false;
  let contadorTemporario = 0;

  /* ---------- Elementos HTML ---------- */

  const $ = (sel) => document.querySelector(sel);

  const elLista = $('#lista-talhoes');
  const elTabela = $('#tabela-culturas');
  const elAreaTotal = $('#area-total');
  const elAviso = $('#aviso-culturas');

  const btnEditarCulturas = $('#btn-editar-culturas');
  const btnAdicionar = $('#btn-adicionar-cultura');
  const btnNovoTalhao = $('#btn-adicionar-talhao');

  /* ---------- Utilitários ---------- */

  const arredondar = (n) =>
    Math.round(n * 10000) / 10000;

  const fmt = (n) =>
    arredondar(n).toLocaleString('pt-BR', {
      maximumFractionDigits: 4
    });

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));

  const avisar = (msg) => {
    elAviso.textContent = msg || '';
  };

  const culturaPorId = (id) =>
    estado.culturas.find((c) => c.id === id);

  function lerNumero(texto) {
    const limpo = String(texto)
      .replace(/[^\d,.-]/g, '')
      .replace(',', '.');

    const n = parseFloat(limpo);

    return Number.isFinite(n) && n >= 0
      ? n
      : null;
  }

  function opcoes(lista, atual) {
    return lista.map((v) =>
      `<option value="${esc(v)}"${v === atual ? ' selected' : ''}>${esc(v)}</option>`
    ).join('');
  }

  // Nome padrão para talhões que não possuem nome cadastrado.
  const nomeExibido = (t) =>
    t.nome || `Talhão ${t.id}`;

  /* ---------- Comunicação com a API ---------- */

  async function chamar(caminho, opcoesFetch = {}) {
    let resposta;

    try {
      resposta = await fetch(API + caminho, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...opcoesFetch
      });

    } catch {
      throw new Error(
        'Não foi possível acessar o servidor.'
      );
    }

    if (resposta.status === 204) return null;

    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      const d = corpo?.detail;

      throw new Error(
        Array.isArray(d)
          ? d.map((i) => i.msg).join(' | ')
          : d || `Erro ${resposta.status}`
      );
    }

    return corpo;
  }

  /* ---------- Carregamento dos dados ---------- */

  // O talhão não possui relação direta com cultura.
  // Seus dados são obtidos exclusivamente da tabela talhao.
  const talhaoDoBanco = (t) => ({
    id: t.id_talhao,
    nome: t.nome_talhao || null,
    area: arredondar(Number(t.area_ha) / 100),
    solo: t.tipo_solo
  });

  async function carregarDados() {
    const usuario = window.Sessao?.usuario();

    if (!usuario) {
      window.location.replace('login.html');
      return false;
    }

    const minhas = (
      await chamar(
        `/propriedade?id_usuario=${usuario.id_usuario}`
      )
    ).filter(
      (p) => p.id_usuario === usuario.id_usuario
    );

    if (!minhas.length) {
      elLista.innerHTML = '';
      avisar(
        'Cadastre uma propriedade para ver seus talhões.'
      );
      return false;
    }

    let ativa = null;

    try {
      ativa = JSON.parse(
        localStorage.getItem(
          'safrascan_propriedade_ativa'
        )
      );
    } catch {
      // Ignora dados inválidos.
    }

    propriedade =
      minhas.find(
        (p) =>
          p.id_propriedade === ativa?.id_propriedade
      ) ?? minhas[0];

    $('#nome-propriedade').textContent =
      propriedade.nome_propriedade;

    // Não é necessário consultar plantios.
    const [talhoes, culturas] = await Promise.all([
      chamar('/talhao'),
      chamar('/cultura')
    ]);

    const meus = talhoes.filter(
      (t) =>
        t.id_propriedade === propriedade.id_propriedade
    );

    estado.talhoes = meus.map(talhaoDoBanco);

    estado.culturas = culturas.map((c) => ({
      id: c.id_cultura,
      nome: c.nome_cultura,
      ciclo: Math.round(
        Number(c.ciclo_medio_dias)
      )
    }));

    return true;
  }

  /* ---------- Salvar talhão na API ---------- */

  async function salvarTalhao(t) {
    try {
      await chamar(`/talhao/${t.id}`, {
        method: 'PUT',

        body: JSON.stringify({
          id_propriedade:
            propriedade.id_propriedade,

          area_ha:
            (t.area * 100).toFixed(2),

          tipo_solo:
            t.solo,

          nome_talhao:
            nomeExibido(t)
        })
      });

      return true;

    } catch (erro) {
      avisar(erro.message);
      return false;
    }
  }

  /* ==================================================
     TALHÕES
  ================================================== */

  /* ---------- Renderização dos cartões ---------- */

  function htmlTalhao(t) {
    const editando =
      editandoTalhaoId === t.id;

    const nome = nomeExibido(t);

    const solos = [
      ...new Set([
        ...TIPOS_SOLO_BASE,
        t.solo
      ])
    ];

    const nomeEl = editando
      ? `
        <input
          class="ed-talhao-nome-input"
          id="nome-edit"
          data-campo="nome"
          data-id="${t.id}"
          value="${esc(nome)}"
          maxlength="40"
          aria-label="Nome do talhão ${t.id}"
        >
      `
      : `
        <span>
          Talhão ${t.id} - ${esc(nome)}
        </span>
      `;

    return `
      <article
        class="ed-talhao"
        data-id="${t.id}"
      >

        <h4 class="ed-talhao-titulo">

          ${nomeEl}

          <button
            type="button"
            class="ed-icone-btn"
            data-acao="editar-talhao"
            data-id="${t.id}"
            aria-label="${editando ? 'Cancelar edição' : 'Editar talhão'}"
            title="${editando ? 'Cancelar edição' : 'Editar talhão'}"
            ${salvandoTalhao ? 'disabled' : ''}
          >
            ${ICONE_LAPIS}
          </button>

        </h4>

        <div class="ed-linha">

          <label for="t${t.id}-area">
            Área:
          </label>

          <input
            class="ed-pill"
            id="t${t.id}-area"
            data-campo="area"
            data-id="${t.id}"
            inputmode="decimal"
            autocomplete="off"
            value="${fmt(t.area)} km²"
            ${editando ? '' : 'disabled'}
          >

        </div>

        <div class="ed-linha">

          <label for="t${t.id}-solo">
            Solo:
          </label>

          <div class="ed-solo">

            <select
              class="ed-pill"
              id="t${t.id}-solo"
              data-campo="solo"
              data-id="${t.id}"
              aria-label="Tipo de solo do talhão ${t.id}"
              ${editando ? '' : 'disabled'}
            >

              ${opcoes(solos, t.solo)}

            </select>

          </div>

        </div>

        ${editando ? `
          <div class="ed-acoes-talhao">

            <button
              type="button"
              class="ed-btn-cancelar"
              data-acao="cancelar-edicao"
              data-id="${t.id}"
              ${salvandoTalhao ? 'disabled' : ''}
            >
              Cancelar
            </button>

            <button
              type="button"
              class="ed-btn-salvar"
              data-acao="salvar-edicao"
              data-id="${t.id}"
              ${salvandoTalhao ? 'disabled' : ''}
            >
              ${salvandoTalhao ? 'Salvando...' : 'Salvar alterações'}
            </button>

          </div>
        ` : ''}

      </article>
    `;
  }

  /* ---------- Renderizar todos os talhões ---------- */

  function renderTalhoes() {
    if (!estado.talhoes.length) {
      elLista.innerHTML = `
        <p class="ed-grupo">
          Nenhum talhão cadastrado.
        </p>
      `;

      atualizarTotais();
      return;
    }

    // Todos os talhões aparecem juntos.
    // Não existe separação por cultura.
    elLista.innerHTML = `
      <section class="ed-grupo">

        <div class="ed-grid-talhoes">

          ${estado.talhoes
            .map(htmlTalhao)
            .join('')}

        </div>

      </section>
    `;

    atualizarTotais();

    const campoNome = $('#nome-edit');

    if (campoNome) {
      campoNome.focus();
      campoNome.select();
    }
  }

  /* ---------- Área total ---------- */

  function atualizarTotais() {
    const soma = estado.talhoes.reduce(
      (total, t) => total + t.area,
      0
    );

    elAreaTotal.textContent = fmt(soma);
  }

  /* ---------- Abrir modo de edição ---------- */

  function iniciarEdicao(id) {
    // Não permite abrir outro cartão enquanto
    // existe uma edição em andamento.
    if (editandoTalhaoId !== null) {
      avisar(
        'Salve ou cancele a edição atual antes de editar outro talhão.'
      );
      return;
    }

    const t = estado.talhoes.find(
      (x) => x.id === id
    );

    if (!t) return;

    editandoTalhaoId = id;

    // Cópia dos dados originais para permitir
    // cancelar e restaurar as informações.
    dadosOriginais = {
      ...t
    };

    avisar('');

    renderTalhoes();
  }

  /* ---------- Cancelar edição ---------- */

  function cancelarEdicao(id) {
    if (editandoTalhaoId !== id) return;

    if (salvandoTalhao) return;

    const t = estado.talhoes.find(
      (x) => x.id === id
    );

    if (t && dadosOriginais) {
      Object.assign(t, dadosOriginais);
    }

    editandoTalhaoId = null;
    dadosOriginais = null;

    avisar('');

    renderTalhoes();
  }

  /* ---------- Salvar edição ---------- */

  async function salvarEdicao(id) {
    if (editandoTalhaoId !== id) return;

    if (salvandoTalhao) return;

    const t = estado.talhoes.find(
      (x) => x.id === id
    );

    if (!t) return;

    // Validação do nome.
    if (!t.nome || !t.nome.trim()) {
      avisar(
        'O nome do talhão não pode ficar vazio.'
      );
      return;
    }

    // Validação da área.
    if (
      !Number.isFinite(t.area) ||
      t.area <= 0
    ) {
      avisar(
        'Informe uma área maior que zero.'
      );
      return;
    }

    salvandoTalhao = true;

    renderTalhoes();

    const sucesso = await salvarTalhao(t);

    salvandoTalhao = false;

    if (!sucesso) {
      // Mantém o modo de edição aberto para
      // que o usuário possa corrigir ou tentar novamente.
      renderTalhoes();
      return;
    }

    editandoTalhaoId = null;
    dadosOriginais = null;

    avisar('');

    renderTalhoes();
  }

  /* ---------- Eventos dos talhões ---------- */

  // Clique nos botões.
  elLista.addEventListener('click', (e) => {

    const editar = e.target.closest(
      '[data-acao="editar-talhao"]'
    );

    if (editar) {
      const id = Number(editar.dataset.id);

      if (editandoTalhaoId === id) {
        cancelarEdicao(id);
        return;
      }

      iniciarEdicao(id);
      return;
    }

    const cancelar = e.target.closest(
      '[data-acao="cancelar-edicao"]'
    );

    if (cancelar) {
      cancelarEdicao(
        Number(cancelar.dataset.id)
      );
      return;
    }

    const salvar = e.target.closest(
      '[data-acao="salvar-edicao"]'
    );

    if (salvar) {
      salvarEdicao(
        Number(salvar.dataset.id)
      );
    }
  });

  // Mostra somente o número ao editar a área.
  elLista.addEventListener('focusin', (e) => {
    if (e.target.dataset.campo !== 'area') return;

    const t = estado.talhoes.find(
      (x) =>
        x.id === Number(e.target.dataset.id)
    );

    if (t) {
      e.target.value = fmt(t.area);
      e.target.select();
    }
  });

  // Formata novamente a área ao sair do campo.
  elLista.addEventListener('focusout', (e) => {
    if (e.target.dataset.campo !== 'area') return;

    const t = estado.talhoes.find(
      (x) =>
        x.id === Number(e.target.dataset.id)
    );

    if (t) {
      e.target.value = `${fmt(t.area)} km²`;
    }
  });

  // Teclas de atalho no campo de nome.
  elLista.addEventListener('keydown', (e) => {
    if (e.target.dataset.campo !== 'nome') return;

    const id = Number(e.target.dataset.id);

    if (e.key === 'Enter') {
      e.preventDefault();
      salvarEdicao(id);
    }

    if (e.key === 'Escape') {
      cancelarEdicao(id);
    }
  });

  // Atualiza os valores localmente.
  // Nenhuma alteração é enviada à API aqui.
  elLista.addEventListener('change', (e) => {

    const campo = e.target.dataset.campo;

    if (
      !['area', 'solo', 'nome'].includes(campo)
    ) {
      return;
    }

    const id = Number(e.target.dataset.id);

    if (id !== editandoTalhaoId) return;

    const t = estado.talhoes.find(
      (x) => x.id === id
    );

    if (!t) return;

    if (campo === 'area') {
      const n = lerNumero(e.target.value);

      if (n === null || n <= 0) {
        avisar(
          'Informe uma área maior que zero.'
        );

        e.target.value = fmt(t.area);
        return;
      }

      t.area = arredondar(n);

      avisar('');
      atualizarTotais();

    } else if (campo === 'solo') {
      t.solo = e.target.value;

      avisar('');

    } else if (campo === 'nome') {
      const valor = e.target.value.trim();

      if (!valor) {
        avisar(
          'O nome do talhão não pode ficar vazio.'
        );

        e.target.value =
          t.nome || nomeExibido(t);

        return;
      }

      t.nome = valor;

      avisar('');
    }
  });

  /* ==================================================
     CULTURAS
  ================================================== */

  /* ---------- Renderização ---------- */

  function renderCulturas() {
    elTabela.innerHTML = estado.culturas.map((c) => {

      if (!editandoCulturas) {
        return `
          <tr>
            <td>${esc(c.nome)}</td>
            <td>${esc(c.ciclo)}</td>
          </tr>
        `;
      }

      return `
        <tr data-id="${c.id}">

          <td>
            <input
              data-campo="c-nome"
              value="${esc(c.nome)}"
              maxlength="30"
              aria-label="Nome da cultura"
            >
          </td>

          <td>
            <input
              data-campo="c-ciclo"
              inputmode="numeric"
              value="${esc(c.ciclo)}"
              aria-label="Ciclo médio de ${esc(c.nome || 'nova cultura')} em dias"
            >
          </td>

          <td class="ed-celula-remover">

            <button
              type="button"
              class="ed-btn-remover"
              data-acao="remover-cultura"
              aria-label="Remover cultura ${esc(c.nome)}"
            >
              ×
            </button>

          </td>

        </tr>
      `;
    }).join('');

    const cabecalho = elTabela
      .closest('table')
      .querySelector('thead tr');

    if (cabecalho) {
      cabecalho.innerHTML =
        '<th scope="col">Cultura</th>' +
        '<th scope="col">Ciclo médio de dias</th>' +
        (
          editandoCulturas
            ? '<th scope="col"><span class="visually-hidden">Remover</span></th>'
            : ''
        );
    }

    btnEditarCulturas.setAttribute(
      'aria-pressed',
      String(editandoCulturas)
    );

    btnEditarCulturas.setAttribute(
      'aria-label',
      editandoCulturas
        ? 'Concluir edição das culturas'
        : 'Editar culturas'
    );
  }

  /* ---------- Salvar cultura ---------- */

  async function salvarCultura(c) {
    const corpo = JSON.stringify({
      nome_cultura: c.nome,
      ciclo_medio_dias: c.ciclo
    });

    try {
      if (c.id < 0) {

        // Não cria uma cultura incompleta.
        if (!c.nome || !c.ciclo) return true;

        const criada = await chamar('/cultura', {
          method: 'POST',
          body: corpo
        });

        c.id = criada.id_cultura;

      } else {

        await chamar(`/cultura/${c.id}`, {
          method: 'PUT',
          body: corpo
        });

      }

      return true;

    } catch (erro) {
      avisar(erro.message);
      return false;
    }
  }

  /* ---------- Alternar edição das culturas ---------- */

  btnEditarCulturas.addEventListener('click', () => {

    if (editandoCulturas) {
      // Descarta linhas novas incompletas.
      estado.culturas = estado.culturas.filter(
        (c) => c.id > 0
      );
    }

    editandoCulturas = !editandoCulturas;

    avisar('');

    renderCulturas();
  });

  /* ---------- Adicionar cultura ---------- */

  btnAdicionar.addEventListener('click', () => {

    const id = -(++contadorTemporario);

    estado.culturas.push({
      id,
      nome: '',
      ciclo: ''
    });

    editandoCulturas = true;

    avisar('');

    renderCulturas();

    const campo = elTabela.querySelector(
      `tr[data-id="${id}"] [data-campo="c-nome"]`
    );

    if (campo) campo.focus();
  });

  /* ---------- Alterar cultura ---------- */

  elTabela.addEventListener('change', async (e) => {

    const linha = e.target.closest('tr[data-id]');

    if (!linha) return;

    const c = culturaPorId(
      Number(linha.dataset.id)
    );

    if (!c) return;

    const antigo = {
      nome: c.nome,
      ciclo: c.ciclo
    };

    if (e.target.dataset.campo === 'c-nome') {

      const valor = e.target.value.trim();

      const duplicado = estado.culturas.some(
        (x) =>
          x.id !== c.id &&
          x.nome.toLowerCase() === valor.toLowerCase() &&
          valor
      );

      if (duplicado) {
        avisar(
          `Já existe a cultura "${valor}".`
        );

        e.target.value = c.nome;
        return;
      }

      if (!valor && c.id > 0) {
        avisar(
          'O nome da cultura não pode ficar vazio.'
        );

        e.target.value = c.nome;
        return;
      }

      c.nome = valor;

    } else if (
      e.target.dataset.campo === 'c-ciclo'
    ) {

      const n = parseInt(e.target.value, 10);

      if (!(Number.isFinite(n) && n > 0)) {
        avisar(
          'Informe o ciclo em dias, com um número maior que zero.'
        );

        e.target.value = c.ciclo;
        return;
      }

      c.ciclo = n;

    } else {
      return;
    }

    avisar('');

    const eraNova = c.id < 0;

    if (!(await salvarCultura(c))) {
      Object.assign(c, antigo);
    }

    if (eraNova && c.id > 0) {
      renderCulturas();

    } else if (
      c.nome !== antigo.nome ||
      c.ciclo !== antigo.ciclo
    ) {
      renderCulturas();
    }
  });

  /* ---------- Remover cultura ---------- */

  elTabela.addEventListener('click', async (e) => {

    const btn = e.target.closest(
      '[data-acao="remover-cultura"]'
    );

    if (!btn) return;

    const id = Number(
      btn.closest('tr').dataset.id
    );

    if (id > 0) {
      try {
        await chamar(`/cultura/${id}`, {
          method: 'DELETE'
        });

      } catch (erro) {
        avisar(
          `Não foi possível remover: ${erro.message}`
        );

        return;
      }
    }

    estado.culturas = estado.culturas.filter(
      (c) => c.id !== id
    );

    avisar('');

    renderCulturas();
  });

  /* ==================================================
     NOVO TALHÃO
  ================================================== */

  btnNovoTalhao.addEventListener('click', () => {
    window.location.href = 'cad_talhao.html';
  });

  /* ==================================================
     INICIALIZAÇÃO
  ================================================== */

  async function iniciar() {

    if (!window.Sessao) {
      elLista.innerHTML = '';

      avisar(
        'O arquivo sessao.js não foi carregado. ' +
        'Inclua <script src="../js/sessao.js" defer> no editar_talhao.html.'
      );

      return;
    }

    elLista.innerHTML = `
      <p class="ed-grupo">
        Carregando talhões...
      </p>
    `;

    try {
      if (!(await carregarDados())) return;

    } catch (erro) {
      elLista.innerHTML = '';

      avisar(
        `Não foi possível carregar os dados: ${erro.message}`
      );

      return;
    }

    renderTalhoes();
    renderCulturas();
  }

  // Aguarda o carregamento do documento e do sessao.js.
  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      iniciar
    );

  } else {

    iniciar();

  }

})();
