const API = window.SAFRASCAN_API_URL || "http://127.0.0.1:8000";
const form = document.querySelector("#form-plantio");
const tbody = document.querySelector("#lista-plantios");
const msg = document.querySelector("#plantio-message");
const selectTalhao = document.querySelector("#id_talhao");
const selectCultura = document.querySelector("#id_cultura");
const btnSalvar = document.querySelector("#btn-salvar");
const btnCancelar = document.querySelector("#btn-cancelar");
let plantios = [];
let talhoes = [];
let culturas = [];
let editando = null;

function mostrarMensagem(texto, tipo = "") {
  msg.textContent = texto;
  msg.className = `ss-message ${tipo}`.trim();
  msg.style.display = "block";
}
function esconderMensagem() { msg.style.display = "none"; }
async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(`${API}${url}`, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  if (!resposta.ok) {
    let detalhe = `Erro HTTP ${resposta.status}`;
    try { const corpo = await resposta.json(); detalhe = corpo.detail || detalhe; } catch {}
    throw new Error(detalhe);
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}
function preencherSelect(elemento, itens, rotulo) {
  elemento.innerHTML = `<option value="">Selecione ${rotulo}</option>`;
  itens.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id_talhao ?? item.id_cultura;
    opt.textContent = item.id_talhao
      ? `Talhão #${item.id_talhao} · ${item.area_ha} ha · ${item.tipo_solo}`
      : item.nome_cultura;
    elemento.appendChild(opt);
  });
}
async function carregarOpcoes() {
  try {
    [talhoes, culturas] = await Promise.all([
      requisicao("/talhao"), requisicao("/cultura")
    ]);
    preencherSelect(selectTalhao, talhoes, "um talhão");
    preencherSelect(selectCultura, culturas, "uma cultura");
  } catch (erro) {
    mostrarMensagem(`Não foi possível carregar talhões e culturas: ${erro.message}. Confira se a API está ativa.`, "error");
    selectTalhao.innerHTML = '<option value="">Não foi possível carregar</option>';
    selectCultura.innerHTML = '<option value="">Não foi possível carregar</option>';
  }
}
function nomeTalhao(id) {
  const t = talhoes.find(x => x.id_talhao === id);
  return t ? `#${t.id_talhao} (${t.area_ha} ha)` : `#${id}`;
}
function nomeCultura(id) {
  return culturas.find(x => x.id_cultura === id)?.nome_cultura || `#${id}`;
}
function desenharTabela() {
  if (!plantios.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="ss-empty">Nenhum plantio cadastrado ainda.</td></tr>';
    return;
  }
  tbody.innerHTML = "";
  plantios.forEach(p => {
    const tr = document.createElement("tr");
    const values = [p.id_plantio, p.data_plantio, nomeTalhao(p.id_talhao), nomeCultura(p.id_cultura), p.data_colheita_prevista, p.status_sensor];
    values.forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.appendChild(td); });
    const actions = document.createElement("td");
    const edit = document.createElement("button");
    edit.type = "button"; edit.className = "ss-btn ss-btn-outline"; edit.textContent = "Editar";
    edit.style.padding = "7px 12px"; edit.style.marginRight = "6px";
    edit.addEventListener("click", () => iniciarEdicao(p));
    const del = document.createElement("button");
    del.type = "button"; del.className = "ss-btn"; del.textContent = "Excluir";
    del.style.padding = "7px 12px"; del.style.background = "#8b3528";
    del.addEventListener("click", () => excluirPlantio(p.id_plantio));
    actions.append(edit, del); tr.appendChild(actions); tbody.appendChild(tr);
  });
}
async function carregarPlantios() {
  try {
    plantios = await requisicao("/plantio");
    desenharTabela();
  } catch (erro) {
    tbody.innerHTML = `<tr><td colspan="7" class="ss-empty">${erro.message}. Verifique a API.</td></tr>`;
  }
}
function iniciarEdicao(p) {
  editando = p.id_plantio;
  document.querySelector("#data_plantio").value = p.data_plantio;
  selectTalhao.value = p.id_talhao;
  selectCultura.value = p.id_cultura;
  document.querySelector("#data_colheita_prevista").value = p.data_colheita_prevista;
  document.querySelector("#status_sensor").value = p.status_sensor;
  document.querySelector("#titulo-form").textContent = `Editar plantio #${p.id_plantio}`;
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function limparEdicao() {
  editando = null; form.reset();
  document.querySelector("#titulo-form").textContent = "Cadastrar plantio";
  btnSalvar.textContent = "Salvar plantio"; btnCancelar.hidden = true;
}
form.addEventListener("submit", async event => {
  event.preventDefault(); esconderMensagem();
  const dados = {
    data_plantio: form.data_plantio.value,
    id_talhao: Number(selectTalhao.value),
    id_cultura: Number(selectCultura.value),
    data_colheita_prevista: form.data_colheita_prevista.value,
    status_sensor: form.status_sensor.value.trim()
  };
  if (dados.data_colheita_prevista < dados.data_plantio) {
    mostrarMensagem("A previsão de colheita não pode ser anterior à data do plantio.", "error"); return;
  }
  btnSalvar.disabled = true;
  try {
    await requisicao(editando === null ? "/plantio" : `/plantio/${editando}`, {
      method: editando === null ? "POST" : "PUT", body: JSON.stringify(dados)
    });
    mostrarMensagem(editando === null ? "Plantio cadastrado com sucesso!" : "Plantio atualizado com sucesso!", "success");
    limparEdicao(); await carregarPlantios();
  } catch (erro) {
    mostrarMensagem(`Não foi possível salvar: ${erro.message}`, "error");
  } finally { btnSalvar.disabled = false; }
});
async function excluirPlantio(id) {
  if (!window.confirm(`Deseja excluir o plantio #${id}?`)) return;
  try {
    await requisicao(`/plantio/${id}`, { method: "DELETE" });
    mostrarMensagem("Plantio excluído.", "success"); await carregarPlantios();
  } catch (erro) { mostrarMensagem(`Não foi possível excluir: ${erro.message}`, "error"); }
}
btnCancelar.addEventListener("click", () => { limparEdicao(); esconderMensagem(); });
form.addEventListener("reset", () => { if (editando !== null) limparEdicao(); });
(async function iniciar() { await carregarOpcoes(); await carregarPlantios(); })();
