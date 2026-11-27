/* talhoes.js - tela "Talhões" do SafraScan, com dados reais da API.
   Para cada talhão da propriedade do usuário logado mostra:
- os plantios cadastrados (clicar abre a tela de plantio) ou "Livre", se não houver nenhum;
- os sensores do talhão com a última leitura de cada grandeza.
   As leituras são atualizadas sozinhas a cada 30 segundos. */

   (() => {
    'use strict';
  
    const API = window.SAFRASCAN_API_URL ?? (
      window.location.port === '8000'
        ? ''
        : `${window.location.protocol}//${window.location.hostname}:8000`
    );
    const INTERVALO_ATUALIZACAO = 30000; // o integracao_sensor.py envia a cada 30 s
    // Os horários do banco vêm sem fuso. O Supabase grava em UTC; use '' se gravarem a hora local.
    const FUSO_DO_BANCO = 'Z';
    // IDs da tabela grandeza_fisica usados no integracao_sensor.py (reserva, caso o nome não seja reconhecido)
    const TIPO_POR_ID = { 1: 'solo', 2: 'temperatura', 3: 'ar' };
  
    // Colunas exibidas em cada sensor, na ordem do design.
    const METRICAS = [
      { tipo: 'temperatura', rotulo: 'Temperatura do solo:', formatar: (l) => `${numero(l.valor_leitura)}°C` },
      { tipo: 'solo', rotulo: 'Umidade do solo:', formatar: estadoDoSolo },
      { tipo: 'ar', rotulo: 'Umidade do ar:', formatar: (l) => `${numero(l.valor_leitura)}%` },
    ];
  
    const $ = (sel) => document.querySelector(sel);
    const elLista = $('#lista-talhoes');
    const elAviso = $('#aviso');
  
    const estado = { talhoes: [], sensores: [], plantios: [], culturas: [], tipos: {}, leituras: [] };
  
    /* ---------- Utilitários ---------- */
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
    const semAcento = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const numero = (v) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    const dois = (n) => String(n).padStart(2, '0');
  
    function estadoDoSolo(leitura) {
      const texto = semAcento(leitura.outros_dados ?? '');
      if (texto.includes('seco')) return 'Seco';
      if (texto.includes('umido')) return 'Úmido';
      return Number(leitura.valor_leitura) >= 0.5 ? 'Úmido' : 'Seco'; // 1 = úmido, 0 = seco
    }
  
    function tipoDaGrandeza(g) {
      const nome = semAcento(g.nome_grandeza ?? '');
      if (nome.includes('temperatura')) return 'temperatura';
      if (nome.includes('umidade') && nome.includes('solo')) return 'solo';
      if (nome.includes('umidade')) return 'ar';
      return TIPO_POR_ID[g.id_grandeza] ?? null;
    }
  
    function dataDoBanco(texto) {
      return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(texto) ? texto : texto + FUSO_DO_BANCO);
    }
  
    function textoDaLeitura(data) {
      const hoje = new Date();
      const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const mesmoDia = data.toDateString() === hoje.toDateString();
      return mesmoDia
        ? `Última leitura às ${hora}`
        : `Última leitura em ${dois(data.getDate())}/${dois(data.getMonth() + 1)} às ${hora}`;
    }
  
    // "2022-02-02" -> "2/2/2022" (sem deslocar o dia pelo fuso)
    function dataSimples(iso) {
      const d = new Date(`${iso}T00:00:00`);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  
    async function chamar(caminho) {
      let resposta;
      try {
        resposta = await fetch(API + caminho);
      } catch {
        throw new Error('Não foi possível acessar o servidor.');
      }
      if (!resposta.ok) throw new Error(`Erro ${resposta.status} em ${caminho.split('?')[0]}`);
      return resposta.json();
    }
  
    /* ---------- Dados reais ---------- */
    // Última leitura de cada grandeza de cada sensor.
    async function buscarLeituras(idsSensores) {
      if (!idsSensores.length) return [];
      const consulta = idsSensores.map((id) => `id_sensor=${id}`).join('&');
      try {
        return await chamar(`/leitura_sensor/ultimas?${consulta}`);
      } catch {
        // Backend sem o endpoint /ultimas: usa a lista completa (pode ficar desatualizada
        // quando houver muitas leituras, pois a API devolve só as mais antigas primeiro).
        const todas = await chamar('/leitura_sensor');
        const ids = new Set(idsSensores);
        const ultimas = new Map();
        todas.filter((l) => ids.has(l.id_sensor)).forEach((l) => {
          const chave = `${l.id_sensor}-${l.id_grandeza}`;
          const atual = ultimas.get(chave);
          if (!atual || dataDoBanco(l.timestamp_leitura) >= dataDoBanco(atual.timestamp_leitura)) ultimas.set(chave, l);
        });
        return [...ultimas.values()];
      }
    }
  
    async function carregarDados() {
      const usuario = window.Sessao?.usuario();
      if (!usuario) { window.location.replace('login.html'); return false; }
  
      const minhas = (await chamar(`/propriedade?id_usuario=${usuario.id_usuario}`))
        .filter((p) => p.id_usuario === usuario.id_usuario);
      if (!minhas.length) {
        elAviso.innerHTML = 'Você ainda não tem propriedade. <a href="cad_propriedade.html">Cadastre a primeira</a>.';
        return false;
      }
      let ativa = null;
      try { ativa = JSON.parse(localStorage.getItem('safrascan_propriedade_ativa')); } catch { /* ignora */ }
      const propriedade = minhas.find((p) => p.id_propriedade === ativa?.id_propriedade) ?? minhas[0];
      $('#nome-propriedade').textContent = propriedade.nome_propriedade;
  
      const [talhoes, sensores, plantios, culturas, grandezas] = await Promise.all([
        chamar('/talhao'), chamar('/sensores'), chamar('/plantio'), chamar('/cultura'), chamar('/grandeza_fisica'),
      ]);
      estado.talhoes = talhoes.filter((t) => t.id_propriedade === propriedade.id_propriedade);
      const idsTalhoes = new Set(estado.talhoes.map((t) => t.id_talhao));
      estado.sensores = sensores.filter((s) => idsTalhoes.has(s.id_talhao));
      estado.plantios = plantios.filter((p) => idsTalhoes.has(p.id_talhao));
      estado.culturas = culturas;
      estado.tipos = Object.fromEntries(grandezas.map((g) => [g.id_grandeza, tipoDaGrandeza(g)]));
      estado.leituras = await buscarLeituras(estado.sensores.map((s) => s.id_sensor));
      return true;
    }
  
    /* ---------- Montagem da tela ---------- */
    const nomeCultura = (id) => estado.culturas.find((c) => c.id_cultura === id)?.nome_cultura ?? 'Cultura';
  
    function htmlPlantio(p) {
      return `
        <a class="tl-plantio" href="plantio.html?id_plantio=${p.id_plantio}">
          <h3>Plantio ${p.id_plantio} - ${esc(nomeCultura(p.id_cultura))}</h3>
          <p>Data de plantio: ${dataSimples(p.data_plantio)}</p>
          <p>Data de colheita: ${dataSimples(p.data_colheita_prevista)}</p>
        </a>`;
    }
  
    function htmlSensor(sensor, posicao) {
      // Última leitura de cada tipo de medida deste sensor
      const porTipo = {};
      estado.leituras.filter((l) => l.id_sensor === sensor.id_sensor).forEach((l) => {
        const tipo = estado.tipos[l.id_grandeza];
        const atual = porTipo[tipo];
        if (tipo && (!atual || dataDoBanco(l.timestamp_leitura) >= dataDoBanco(atual.timestamp_leitura))) porTipo[tipo] = l;
      });
      const leituras = Object.values(porTipo);
      const ultima = leituras.map((l) => dataDoBanco(l.timestamp_leitura)).sort((a, b) => b - a)[0];
  
      const metricas = METRICAS.filter((m) => porTipo[m.tipo]).map((m) => `
        <div class="tl-metrica">
          <div class="tl-metrica-rotulo">${m.rotulo}</div>
          <div class="tl-metrica-valor">${esc(m.formatar(porTipo[m.tipo]))}</div>
        </div>`).join('');
  
      return `
        <article class="tl-sensor" title="${esc(sensor.tipo_sensor)} · ${esc(sensor.identificador_dispositivo)}">
          <div class="tl-sensor-topo">
            <strong>Sensor ${posicao}</strong>
            <small>${ultima ? textoDaLeitura(ultima) : 'Sem leituras'}</small>
          </div>
          ${metricas ? `<div class="tl-metricas">${metricas}</div>` : '<p class="tl-sem-leitura">Nenhuma leitura registrada ainda.</p>'}
        </article>`;
    }
  
    function htmlTalhao(t) {
      const plantios = estado.plantios
        .filter((p) => p.id_talhao === t.id_talhao)
        .sort((a, b) => b.data_plantio.localeCompare(a.data_plantio) || b.id_plantio - a.id_plantio);
      const sensores = estado.sensores
        .filter((s) => s.id_talhao === t.id_talhao)
        .sort((a, b) => a.id_sensor - b.id_sensor);
  
      const numeroTalhao = dois(t.id_talhao);
      const nome = t.nome_talhao && t.nome_talhao !== `Talhão ${t.id_talhao}` ? ` - ${esc(t.nome_talhao)}` : '';
      
      // Busca a área do talhão (ajuste 't.area' para o nome exato da propriedade retornada pela sua API, se diferente)
      const valorArea = t.area ?? t.tamanho_area ?? 0; 
      const textoArea = `${numero(valorArea)}km²`;
  
      let htmlEstado = '';
      let btnPlantio = '';
      let btnSensor = '';
  
      if (plantios.length) {
        htmlEstado = `<p class="tl-estado"><strong>Área:</strong> ${textoArea} - Em uso</p>
                      <div class="tl-plantios">${plantios.map(htmlPlantio).join('')}</div>`;
      } else {
        htmlEstado = `<p class="tl-livre"><strong>Status:</strong> ${textoArea} - Livre</p>`;
        btnPlantio = `<button class="btn-talhao btn-plantio" onclick="window.abrirModalPlantio(${t.id_talhao})">🌱 Adicionar Plantio</button>`;
      }
  
      if (!sensores.length) {
        btnSensor = `<button class="btn-talhao btn-sensor" onclick="window.abrirModalSensor(${t.id_talhao})">📡 Adicionar Sensor</button>`;
      }
  
      return `
        <section class="tl-talhao" aria-label="Talhão ${numeroTalhao}">
          <h2 class="tl-titulo">Talhão ${numeroTalhao}${nome}</h2>
          
          ${htmlEstado}
  
          <h2 class="tl-titulo tl-subtitulo">Sensores nesse talhão</h2>
          ${sensores.length
            ? `<div class="tl-sensores">${sensores.map((s, i) => htmlSensor(s, i + 1)).join('')}</div>`
            : '<p class="tl-vazio">Nenhum sensor instalado neste talhão.</p>'}
            
          ${(btnPlantio || btnSensor) ? `
          <div class="acoes-talhao">
              ${btnPlantio}
              ${btnSensor}
          </div>` : ''}
        </section>`;
    }
  
    function render() {
      elLista.innerHTML = estado.talhoes.length
        ? [...estado.talhoes].sort((a, b) => a.id_talhao - b.id_talhao).map(htmlTalhao).join('')
        : '<p class="tl-vazio">Nenhum talhão cadastrado. <a href="cad_talhao.html">Cadastre o primeiro</a>.</p>';
    }
  
    /* ---------- Atualização automática ---------- */
    async function atualizarLeituras() {
      if (document.hidden || !estado.sensores.length) return;
      try {
        estado.leituras = await buscarLeituras(estado.sensores.map((s) => s.id_sensor));
        render();
      } catch { /* mantém o que já está na tela */ }
    }
  
    async function iniciar() {
      // Sem o sessao.js não dá para saber quem está logado: avisa em vez de redirecionar.
      if (!window.Sessao) {
        elAviso.textContent = 'O arquivo sessao.js não foi carregado. Inclua <script src="../js/sessao.js" defer> no talhoes.html.';
        return;
      }
      elAviso.textContent = '';
      elLista.innerHTML = '<p class="tl-vazio">Carregando talhões...</p>';
      try {
        if (!(await carregarDados())) { elLista.innerHTML = ''; return; }
      } catch (erro) {
        elLista.innerHTML = '';
        elAviso.textContent = `Não foi possível carregar os dados: ${erro.message}`;
        return;
      }
      render();
      setInterval(atualizarLeituras, INTERVALO_ATUALIZACAO);
    }
  
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
    else iniciar();
})();

/* Funções expostas para os modais no HTML - Substitua o console.log pela lógica de exibição do seu modal */
window.abrirModalPlantio = function(idTalhao) {
    console.log('Abrir modal de plantio para o talhão:', idTalhao);
    // Exemplo: document.getElementById('modal-plantio').style.display = 'block';
    // document.getElementById('input-plantio-talhao-id').value = idTalhao;
};

window.abrirModalSensor = function(idTalhao) {
    console.log('Abrir modal de sensor para o talhão:', idTalhao);
    // Exemplo: document.getElementById('modal-sensor').style.display = 'block';
    // document.getElementById('input-sensor-talhao-id').value = idTalhao;
};