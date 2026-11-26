/* editar.js - tela "Editar" do SafraScan
   - Agrupa talhões por cultura e calcula as áreas
   - Edita nome, cultura, área e solo de cada talhão
   - Edita a tabela de culturas (adicionar, renomear, remover)
   Os dados ficam no localStorage; troque salvar()/carregar() por chamadas à sua API. */

   (() => {
    'use strict';
  
    const CHAVE = 'safrascan:editar';
    const TIPOS_SOLO = ['Terra comum', 'Arenoso', 'Argiloso', 'Humífero'];
    const CORES_SOLO = ['Vermelha', 'Escura', 'Amarela', 'Marrom'];
  
    const ICONE_LAPIS = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 17.250V21h3.750L17.810 9.940l-3.750-3.750L3 17.250zM20.710 7.040a1 1 0 0 0 0-1.410l-2.340-2.340a1 1 0 0 0-1.410 0l-1.830 1.830 3.750 3.750 1.830-1.830z"/>
      </svg>`;
  
    /* ---------- Estado ---------- */
    const estadoPadrao = () => ({
      culturas: [
        { id: 1, nome: 'Milho',   ciclo: 120 },
        { id: 2, nome: 'Repolho', ciclo: 80 },
        { id: 3, nome: 'Trigo',   ciclo: 180 },
        { id: 4, nome: 'Café',    ciclo: 200 },
      ],
      talhoes: [
        { id: 1,  culturaId: 1, nome: 'Talhão de Milho',   area: 0.15, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 2,  culturaId: 1, nome: 'Talhão de Milho',   area: 0.10, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 3,  culturaId: 3, nome: 'Talhão de Trigo',   area: 0.10, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 4,  culturaId: 3, nome: 'Talhão de Trigo',   area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 5,  culturaId: 3, nome: 'Talhão de Trigo',   area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 6,  culturaId: 4, nome: 'Talhão de Café',    area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 7,  culturaId: 4, nome: 'Talhão de Café',    area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 8,  culturaId: 4, nome: 'Talhão de Café',    area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 9,  culturaId: 4, nome: 'Talhão de Café',    area: 0.05, solo: 'Terra comum', cor: 'Vermelha' },
        { id: 10, culturaId: 2, nome: 'Talhão de Repolho', area: 0.15, solo: 'Terra comum', cor: 'Vermelha' },
      ],
    });
  
    function carregar() {
      try {
        const salvo = localStorage.getItem(CHAVE);
        if (salvo) return JSON.parse(salvo);
      } catch (e) { /* armazenamento indisponível: usa o padrão */ }
      return estadoPadrao();
    }
  
    function salvar() {
      try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* ignora */ }
    }
  
    const estado = carregar();
    let editandoCulturas = false;
    let editandoNomeId = null;
  
    /* ---------- Utilitários ---------- */
    const $ = (sel) => document.querySelector(sel);
    const elLista = $('#lista-talhoes');
    const elTabela = $('#tabela-culturas');
    const elAreaTotal = $('#area-total');
    const elAviso = $('#aviso-culturas');
    const btnEditarCulturas = $('#btn-editar-culturas');
    const btnAdicionar = $('#btn-adicionar-cultura');
    const btnNovoTalhao = $('#btn-adicionar-talhao');
  
    const arredondar = (n) => Math.round(n * 100) / 100;
    const fmt = (n) => arredondar(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  
    const culturaPorId = (id) => estado.culturas.find((c) => c.id === id);
    const nomeCultura = (id) => (culturaPorId(id) || { nome: '—' }).nome;
    const proximoId = (lista) => lista.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  
    function lerNumero(texto) {
      const limpo = String(texto).replace(/[^\d,.-]/g, '').replace(',', '.');
      const n = parseFloat(limpo);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }
  
    function opcoes(lista, atual) {
      return lista
        .map((v) => `<option value="${esc(v)}"${v === atual ? ' selected' : ''}>${esc(v)}</option>`)
        .join('');
    }
  
    /* ---------- Talhões ---------- */
    function htmlTalhao(t) {
      const nomeEl = editandoNomeId === t.id
        ? `<input class="ed-talhao-nome-input" id="nome-edit" data-campo="nome" data-id="${t.id}"
                  value="${esc(t.nome)}" maxlength="40" aria-label="Nome do talhão ${t.id}">`
        : `<span>Talhão ${t.id} - ${esc(t.nome)}</span>`;
  
      const culturasValidas = estado.culturas.filter((c) => c.nome.trim());
  
      return `
        <article class="ed-talhao" data-id="${t.id}">
          <h4 class="ed-talhao-titulo">
            ${nomeEl}
            <button type="button" class="ed-icone-btn" data-acao="editar-nome" data-id="${t.id}"
                    aria-label="Editar nome do talhão ${t.id}">${ICONE_LAPIS}</button>
          </h4>
  
          <div class="ed-linha">
            <label for="t${t.id}-cultura">Cultura:</label>
            <select class="ed-pill" id="t${t.id}-cultura" data-campo="cultura" data-id="${t.id}">
              ${opcoes(culturasValidas.map((c) => c.nome), nomeCultura(t.culturaId))}
            </select>
          </div>
  
          <div class="ed-linha">
            <label for="t${t.id}-area">Área:</label>
            <input class="ed-pill" id="t${t.id}-area" data-campo="area" data-id="${t.id}"
                   inputmode="decimal" autocomplete="off" value="${fmt(t.area)} km²">
          </div>
  
          <div class="ed-linha">
            <label for="t${t.id}-solo">Solo:</label>
            <div class="ed-solo">
              <select class="ed-pill" id="t${t.id}-solo" data-campo="solo" data-id="${t.id}"
                      aria-label="Tipo de solo do talhão ${t.id}">${opcoes(TIPOS_SOLO, t.solo)}</select>
              <select class="ed-pill" data-campo="cor" data-id="${t.id}"
                      aria-label="Cor do solo do talhão ${t.id}">${opcoes(CORES_SOLO, t.cor)}</select>
            </div>
          </div>
        </article>`;
    }
  
    function renderTalhoes() {
      // Agrupa por cultura, na ordem em que aparecem
      const grupos = new Map();
      estado.talhoes.forEach((t) => {
        if (!grupos.has(t.culturaId)) grupos.set(t.culturaId, []);
        grupos.get(t.culturaId).push(t);
      });
  
      if (!grupos.size) {
        elLista.innerHTML = '<p class="ed-grupo">Nenhum talhão cadastrado.</p>';
        atualizarTotais();
        return;
      }
  
      elLista.innerHTML = [...grupos]
        .map(([cid, lista]) => `
          <section class="ed-grupo">
            <h3 class="ed-grupo-titulo" data-grupo="${cid}"></h3>
            <div class="ed-grid-talhoes">${lista.map(htmlTalhao).join('')}</div>
          </section>`)
        .join('');
  
      atualizarTotais();
  
      const campoNome = $('#nome-edit');
      if (campoNome) { campoNome.focus(); campoNome.select(); }
    }
  
    // Atualiza apenas os textos de totais (sem recriar os campos)
    function atualizarTotais() {
      elLista.querySelectorAll('[data-grupo]').forEach((h) => {
        const cid = Number(h.dataset.grupo);
        const soma = estado.talhoes
          .filter((t) => t.culturaId === cid)
          .reduce((s, t) => s + t.area, 0);
        h.innerHTML = `${esc(nomeCultura(cid))} - ${fmt(soma)}km<sup>2</sup>`;
      });
      elAreaTotal.textContent = fmt(estado.talhoes.reduce((s, t) => s + t.area, 0));
    }
  
    /* ---------- Eventos dos talhões ---------- */
    elLista.addEventListener('change', (e) => {
      const campo = e.target.dataset.campo;
      const t = estado.talhoes.find((x) => x.id === Number(e.target.dataset.id));
      if (!campo || !t) return;
  
      if (campo === 'area') {
        const n = lerNumero(e.target.value);
        if (n !== null) t.area = arredondar(n);
        e.target.value = `${fmt(t.area)} km²`;
        atualizarTotais();
      } else if (campo === 'cultura') {
        const nova = estado.culturas.find((c) => c.nome === e.target.value);
        if (!nova) return;
        // Se o nome era o automático, acompanha a nova cultura
        if (t.nome === `Talhão de ${nomeCultura(t.culturaId)}`) t.nome = `Talhão de ${nova.nome}`;
        t.culturaId = nova.id;
        renderTalhoes();
        const volta = elLista.querySelector(`[data-campo="cultura"][data-id="${t.id}"]`);
        if (volta) volta.focus();
      } else if (campo === 'solo') {
        t.solo = e.target.value;
      } else if (campo === 'cor') {
        t.cor = e.target.value;
      }
      salvar();
    });
  
    // Mostra só o número ao digitar a área
    elLista.addEventListener('focusin', (e) => {
      if (e.target.dataset.campo !== 'area') return;
      const t = estado.talhoes.find((x) => x.id === Number(e.target.dataset.id));
      if (t) { e.target.value = fmt(t.area); e.target.select(); }
    });
  
    elLista.addEventListener('focusout', (e) => {
      const alvo = e.target;
      if (alvo.dataset.campo === 'area') {
        const t = estado.talhoes.find((x) => x.id === Number(alvo.dataset.id));
        if (t) alvo.value = `${fmt(t.area)} km²`;
      }
      if (alvo.dataset.campo === 'nome') confirmarNome(alvo, true);
    });
  
    elLista.addEventListener('keydown', (e) => {
      if (e.target.dataset.campo === 'area' && e.key === 'Enter') e.target.blur();
      if (e.target.dataset.campo === 'nome') {
        if (e.key === 'Enter') confirmarNome(e.target, true);
        if (e.key === 'Escape') confirmarNome(e.target, false);
      }
    });
  
    elLista.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-acao="editar-nome"]');
      if (!btn) return;
      editandoNomeId = editandoNomeId === Number(btn.dataset.id) ? null : Number(btn.dataset.id);
      renderTalhoes();
    });
  
    function confirmarNome(input, aplicar) {
      if (editandoNomeId === null) return;
      const t = estado.talhoes.find((x) => x.id === Number(input.dataset.id));
      const valor = input.value.trim();
      if (aplicar && t && valor) { t.nome = valor; salvar(); }
      editandoNomeId = null;
      renderTalhoes();
    }
  
    /* ---------- Tabela de culturas ---------- */
    const culturaEmUso = (id) => estado.talhoes.some((t) => t.culturaId === id);
  
    function renderCulturas() {
      elTabela.innerHTML = estado.culturas.map((c) => {
        if (!editandoCulturas) {
          return `<tr><td>${esc(c.nome)}</td><td>${esc(c.ciclo)}</td></tr>`;
        }
        const emUso = culturaEmUso(c.id);
        return `
          <tr data-id="${c.id}">
            <td><input data-campo="c-nome" value="${esc(c.nome)}" maxlength="30"
                       aria-label="Nome da cultura"></td>
            <td>
              <input data-campo="c-ciclo" inputmode="numeric" value="${esc(c.ciclo)}"
                     aria-label="Ciclo médio de ${esc(c.nome || 'nova cultura')} em dias">
            </td>
            <td class="ed-celula-remover">
              <button type="button" class="ed-btn-remover" data-acao="remover-cultura"
                      aria-label="Remover cultura ${esc(c.nome)}"
                      ${emUso ? 'disabled title="Cultura em uso por algum talhão"' : ''}>×</button>
            </td>
          </tr>`;
      }).join('');
  
      const cabecalho = elTabela.closest('table').querySelector('thead tr');
      if (cabecalho) {
        cabecalho.innerHTML = '<th scope="col">Cultura</th><th scope="col">Ciclo médio de dias</th>'
          + (editandoCulturas ? '<th scope="col"><span class="visually-hidden">Remover</span></th>' : '');
      }
  
      btnEditarCulturas.setAttribute('aria-pressed', String(editandoCulturas));
      btnEditarCulturas.setAttribute('aria-label', editandoCulturas ? 'Concluir edição das culturas' : 'Editar culturas');
    }
  
    function avisar(msg) { elAviso.textContent = msg || ''; }
  
    btnEditarCulturas.addEventListener('click', () => {
      if (editandoCulturas) {
        // Ao concluir: remove linhas vazias que não estão em uso
        estado.culturas = estado.culturas.filter((c) => c.nome.trim() || culturaEmUso(c.id));
        salvar();
        renderTalhoes();
      }
      editandoCulturas = !editandoCulturas;
      avisar('');
      renderCulturas();
    });
  
    btnAdicionar.addEventListener('click', () => {
      const id = proximoId(estado.culturas);
      estado.culturas.push({ id, nome: '', ciclo: '' });
      editandoCulturas = true;
      avisar('');
      renderCulturas();
      const campo = elTabela.querySelector(`tr[data-id="${id}"] [data-campo="c-nome"]`);
      if (campo) campo.focus();
    });
  
    elTabela.addEventListener('change', (e) => {
      const linha = e.target.closest('tr[data-id]');
      if (!linha) return;
      const c = culturaPorId(Number(linha.dataset.id));
      if (!c) return;
  
      if (e.target.dataset.campo === 'c-nome') {
        const valor = e.target.value.trim();
        const duplicado = estado.culturas.some(
          (x) => x.id !== c.id && x.nome.toLowerCase() === valor.toLowerCase() && valor
        );
        if (duplicado) { avisar(`Já existe a cultura “${valor}”.`); e.target.value = c.nome; return; }
        if (!valor && culturaEmUso(c.id)) { avisar('Esta cultura está em uso e precisa de um nome.'); e.target.value = c.nome; return; }
        avisar('');
        c.nome = valor;
        renderTalhoes();
      } else if (e.target.dataset.campo === 'c-ciclo') {
        const n = parseInt(e.target.value, 10);
        if (Number.isFinite(n) && n > 0) { c.ciclo = n; avisar(''); }
        else { avisar('Informe o ciclo em dias, com um número maior que zero.'); e.target.value = c.ciclo; }
      }
      salvar();
    });
  
    elTabela.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-acao="remover-cultura"]');
      if (!btn || btn.disabled) return;
      const id = Number(btn.closest('tr').dataset.id);
      estado.culturas = estado.culturas.filter((c) => c.id !== id);
      salvar();
      avisar('');
      renderCulturas();
    });
  
    /* ---------- Novo talhão ---------- */
    btnNovoTalhao.addEventListener('click', () => {
      const base = estado.culturas.find((c) => c.nome.trim());
      if (!base) {
        avisar('Cadastre ao menos uma cultura antes de adicionar um talhão.');
        return;
      }
      avisar('');
      const id = proximoId(estado.talhoes);
      estado.talhoes.push({
        id, culturaId: base.id, nome: `Talhão de ${base.nome}`,
        area: 0, solo: TIPOS_SOLO[0], cor: CORES_SOLO[0],
      });
      salvar();
      renderTalhoes();
      const campo = $(`#t${id}-area`);
      if (campo) { campo.scrollIntoView({ block: 'center', behavior: 'smooth' }); campo.focus(); }
    });
  
    /* ---------- Início ---------- */
    renderTalhoes();
    renderCulturas();
  })();  