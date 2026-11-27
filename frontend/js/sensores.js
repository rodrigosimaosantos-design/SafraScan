
const API = "http://127.0.0.1:8080";

document.addEventListener("DOMContentLoaded", () => {

    const lista = document.getElementById("lista-sensores");
    const mensagem = document.getElementById("mensagem");
    const formulario = document.getElementById("form-sensor");

    const botaoAdicionar = document.getElementById("adicionar-sensor");
    const botaoCancelar = document.getElementById("cancelar");

    let sensores = [];

    async function requisicao(url, opcoes = {}) {

        const resposta = await fetch(API + url, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                ...(opcoes.headers || {})
            }
        });

        if (resposta.status === 204) return null;

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.detail || "Erro na requisição.");
        }

        return dados;
    }

    function mostrarMensagem(texto) {
        mensagem.textContent = texto;
        mensagem.hidden = false;
    }

    function formatarData(data) {
        if (!data) return "Não informada";

        const dataObj = new Date(data);

        if (Number.isNaN(dataObj.getTime())) {
            return data;
        }

        return dataObj.toLocaleDateString("pt-BR");
    }

    function renderizarSensores() {

        lista.innerHTML = "";

        if (sensores.length === 0) {
            lista.innerHTML = "<p>Nenhum sensor cadastrado.</p>";
            document.getElementById("estado-geral").textContent =
                "Estado: Nenhum sensor cadastrado";
            atualizarEstado();
            return;
        }

        sensores.forEach(sensor => {

            const item = document.createElement("article");
            item.className = "sensor-item";

            const informacoes = document.createElement("div");
            informacoes.className = "sensor-informacoes";

            const nome = document.createElement("p");
            nome.textContent =
                `${sensor.identificador_dispositivo || "Sensor"} • ${sensor.status_sensor || "Sem status"}`;

            const estado = document.createElement("p");
            estado.textContent =
                `Estado: ${sensor.status_sensor || "Não informado"}`;

            if (String(sensor.status_sensor).toLowerCase().includes("off")) {
                estado.className = "status-offline";
            }

            const manutencao = document.createElement("em");
            manutencao.textContent = "Agendar manutenção";

            informacoes.append(nome, estado, manutencao);

            const datas = document.createElement("div");
            datas.className = "sensor-datas";

            const instalacao = document.createElement("p");
            instalacao.textContent =
                `Data de instalação: ${formatarData(sensor.data_instalacao_sensor)}`;

            const comunicacao = document.createElement("p");
            comunicacao.textContent =
                `Última comunicação: ${formatarData(sensor.data_ultima_comunicacao)}`;

            datas.append(instalacao, comunicacao);

            const excluir = document.createElement("button");
            excluir.className = "botao-excluir";
            excluir.textContent = "Excluir registro do sensor";

            excluir.addEventListener("click", () => excluirSensor(sensor.id_sensor));

            item.append(informacoes, datas, excluir);

            lista.append(item);
        });

        atualizarEstado();
    }

    function atualizarEstado() {

        const online = sensores.filter(sensor =>
            String(sensor.status_sensor || "")
                .toLowerCase()
                .includes("on-line")
            || String(sensor.status_sensor || "")
                .toLowerCase() === "online"
        ).length;

        document.getElementById("estado-geral").textContent =
            `Estado: ${online} de ${sensores.length} sensores on-line`;
    }

    async function carregarSensores() {

        try {
            sensores = await requisicao("/sensores");
            if (!Array.isArray(sensores)) sensores = [];

            renderizarSensores();

        } catch (erro) {
            lista.innerHTML = "<p>Não foi possível carregar os sensores.</p>";
            mostrarMensagem(erro.message);
        }
    }

    async function carregarTalhoes() {

        const talhoes = await requisicao("/talhao");

        const select = document.getElementById("id_talhao");

        select.innerHTML = '<option value="">Selecione um talhão</option>';

        talhoes.forEach(talhao => {
            const opcao = document.createElement("option");

            opcao.value = talhao.id_talhao;
            opcao.textContent = `Talhão ${talhao.id_talhao}`;

            select.append(opcao);
        });
    }

    async function excluirSensor(id) {

        if (!confirm("Deseja excluir este registro do sensor?")) {
            return;
        }

        try {
            await requisicao(`/sensores/${id}`, {
                method: "DELETE"
            });

            mostrarMensagem("Sensor excluído com sucesso!");

            await carregarSensores();

        } catch (erro) {
            mostrarMensagem(erro.message);
        }
    }

    botaoAdicionar.addEventListener("click", async () => {

        try {
            await carregarTalhoes();

            formulario.hidden = false;
            formulario.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } catch (erro) {
            mostrarMensagem("Não foi possível carregar os talhões: " + erro.message);
        }
    });

    botaoCancelar.addEventListener("click", () => {
        formulario.reset();
        formulario.hidden = true;
    });

    formulario.addEventListener("submit", async evento => {

        evento.preventDefault();

        const dados = {
            id_talhao: Number(document.getElementById("id_talhao").value),
            tipo_sensor: document.getElementById("tipo_sensor").value,
            identificador_dispositivo:
                document.getElementById("identificador_dispositivo").value,
            status_sensor:
                document.getElementById("status_sensor").value
        };

        try {

            await requisicao("/sensores", {
                method: "POST",
                body: JSON.stringify(dados)
            });

            mostrarMensagem("Sensor cadastrado com sucesso!");

            formulario.reset();
            formulario.hidden = true;

            await carregarSensores();

        } catch (erro) {
            mostrarMensagem("Erro ao cadastrar: " + erro.message);
        }
    });

    carregarSensores();
});
