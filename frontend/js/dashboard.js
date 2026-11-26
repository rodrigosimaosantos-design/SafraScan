const API = window.SAFRASCAN_API_URL || "http://127.0.0.1:8000";

async function getJSON(caminho) {
  const resposta = await fetch(`${API}${caminho}`);
  if (!resposta.ok) throw new Error(`${caminho}: HTTP ${resposta.status}`);
  return resposta.json();
}
function texto(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}
function mensagem(textoMsg, tipo = "") {
  const el = document.getElementById("dash-message");
  el.textContent = textoMsg;
  el.className = `dash-message ${tipo}`.trim();
}
function statusOnline(status) {
  const s = String(status || "").toLowerCase();
  return ["on-line", "online", "ativo", "conectado", "funcionando"].includes(s);
}
function renderizarCulturas(plantios, culturas) {
  const area = document.getElementById("lista-culturas");
  const contagem = new Map();
  plantios.forEach(p => {
    const cultura = culturas.find(c => c.id_cultura === p.id_cultura);
    const nome = cultura?.nome_cultura || `Cultura #${p.id_cultura}`;
    contagem.set(nome, (contagem.get(nome) || 0) + 1);
  });
  const itens = [...contagem.entries()];
  if (!itens.length) { area.innerHTML = '<p class="dash-empty">Nenhum plantio cadastrado.</p>'; return; }
  const max = Math.max(...itens.map(x => x[1]), 1);
  area.innerHTML = "";
  itens.forEach(([nome, qtd]) => {
    const linha = document.createElement("div");
    linha.className = "dash-culture-row";
    const nomeEl = document.createElement("span"); nomeEl.textContent = nome;
    const trilho = document.createElement("div"); trilho.className = "dash-track";
    const barra = document.createElement("span"); barra.style.width = `${qtd / max * 100}%`;
    trilho.appendChild(barra);
    const numero = document.createElement("span"); numero.className = "dash-count"; numero.textContent = `${qtd}`;
    linha.append(nomeEl, trilho, numero); area.appendChild(linha);
  });
}
function renderizarSensores(sensores) {
  const area = document.getElementById("lista-sensores");
  if (!sensores.length) { area.innerHTML = '<p class="dash-empty">Nenhum sensor cadastrado.</p>'; return; }
  area.innerHTML = "";
  sensores.forEach(s => {
    const online = statusOnline(s.status_sensor);
    const linha = document.createElement("div"); linha.className = "dash-sensor-row";
    const info = document.createElement("div");
    const nome = document.createElement("div"); nome.className = "dash-sensor-name"; nome.textContent = s.identificador_dispositivo || `Sensor #${s.id_sensor}`;
    const tipo = document.createElement("div"); tipo.className = "dash-sensor-type"; tipo.textContent = s.tipo_sensor || "Sensor";
    info.append(nome, tipo);
    const estado = document.createElement("span"); estado.className = `dash-status ${online ? "online" : "offline"}`; estado.textContent = s.status_sensor || "Sem status";
    linha.append(info, estado); area.appendChild(linha);
  });
}
function renderizarLeituras(leituras, sensores, grandezas) {
  const area = document.getElementById("lista-leituras");
  const recentes = [...leituras].sort((a,b) => new Date(b.timestamp_leitura) - new Date(a.timestamp_leitura)).slice(0,5);
  if (!recentes.length) { area.innerHTML = '<p class="dash-empty">Ainda não há leituras registradas.</p>'; return; }
  area.innerHTML = "";
  recentes.forEach(l => {
    const sensor = sensores.find(s => s.id_sensor === l.id_sensor);
    const grandeza = grandezas.find(g => g.id_grandeza === l.id_grandeza);
    const linha = document.createElement("div"); linha.className = "dash-reading-row";
    const info = document.createElement("div");
    const titulo = document.createElement("strong"); titulo.textContent = grandeza?.nome_grandeza || `Grandeza #${l.id_grandeza}`;
    const detalhe = document.createElement("small"); detalhe.textContent = `${sensor?.identificador_dispositivo || `Sensor #${l.id_sensor}`} · ${new Date(l.timestamp_leitura).toLocaleString("pt-BR")}`;
    info.append(titulo, detalhe);
    const valor = document.createElement("span"); valor.className = "dash-reading-value"; valor.textContent = `${l.valor_leitura} ${grandeza?.unidade_medida || ""}`;
    linha.append(info, valor); area.appendChild(linha);
  });
}
async function iniciarDashboard() {
  document.getElementById("data-atual").textContent = new Date().toLocaleDateString("pt-BR", {dateStyle:"full"});
  try {
    const resultados = await Promise.allSettled([
      getJSON("/propriedade"), getJSON("/talhao"), getJSON("/plantio"),
      getJSON("/cultura"), getJSON("/sensores"), getJSON("/leitura_sensor"),
      getJSON("/grandeza_fisica")
    ]);
    const nomes = ["propriedades","talhoes","plantios","culturas","sensores","leituras","grandezas"];
    const dados = {};
    const falhas = [];
    resultados.forEach((r,i) => {
      if (r.status === "fulfilled") dados[nomes[i]] = r.value;
      else { dados[nomes[i]] = []; falhas.push(nomes[i]); console.error(`Falha ao carregar ${nomes[i]}`,r.reason); }
    });
    const propriedades = dados.propriedades;
    if (propriedades.length) texto("nome-propriedade", propriedades[0].nome_propriedade || "Minha propriedade");
    const areaTotal = dados.talhoes.reduce((s,t) => s + Number(t.area_ha || 0),0);
    const online = dados.sensores.filter(s => statusOnline(s.status_sensor)).length;
    texto("kpi-area", areaTotal.toLocaleString("pt-BR",{maximumFractionDigits:2}));
    texto("kpi-plantios", dados.plantios.length);
    texto("kpi-online", online);
    texto("kpi-total-sensores", `de ${dados.sensores.length} sensores`);
    texto("kpi-leituras", dados.leituras.length);
    renderizarCulturas(dados.plantios,dados.culturas);
    renderizarSensores(dados.sensores);
    renderizarLeituras(dados.leituras,dados.sensores,dados.grandezas);
    if (falhas.length) mensagem(`Dashboard parcialmente carregado. Não foi possível consultar: ${falhas.join(", ")}. Confira os caminhos das rotas e a API.`, "erro");
    else mensagem("Informações atualizadas a partir da API SafraScan.", "ok");
  } catch (erro) {
    mensagem(`Não foi possível carregar o dashboard: ${erro.message}`, "erro");
  }
}
document.getElementById("btn-sair").addEventListener("click", () => {
  // Até existir autenticação por sessão/token, o botão apenas retorna à tela de login.
  window.location.href = "login.html";
});
iniciarDashboard();
