(() => {
    const API = window.SAFRASCAN_API_URL ?? (
        window.location.port === "8000"
            ? ""
            : `${window.location.protocol}//${window.location.hostname}:8000`
    );

    const CHAVE_PROPRIEDADE = "safrascan_propriedade_ativa";
    const $ = (sel) => document.querySelector(sel);

    function formatarNumero(valor, casas = 2) {
        return Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: casas,
        });
    }

    async function buscarJson(caminho) {
        const resposta = await fetch(`${API}${caminho}`);
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status} em ${caminho}`);
        }
        return resposta.json();
    }

    function marcarMenuAtivo() {
        const paginaAtual = window.location.pathname.split("/").pop() || "dashboard.html";
        document.querySelectorAll(".nav-item").forEach((link) => {
            const destino = link.getAttribute("href");
            link.classList.toggle("active", destino === paginaAtual);
        });
    }

    function escolherPropriedade(propriedades, usuario) {
        if (!Array.isArray(propriedades) || propriedades.length === 0) return null;

        const daConta = usuario
            ? propriedades.filter((p) => p.id_usuario === usuario.id_usuario)
            : propriedades;

        const lista = daConta.length > 0 ? daConta : propriedades;

        let ativa = null;
        try {
            ativa = JSON.parse(localStorage.getItem(CHAVE_PROPRIEDADE));
        } catch {
            /* ignora erro de storage */
        }

        return lista.find((p) => p.id_propriedade === ativa?.id_propriedade) ?? lista[0];
    }

    function descobrirCulturaDoTalhao(talhao, plantios, mapaCulturas) {
        // 1. Procura plantio vinculado ao talhão (prioriza ATIVO ou o mais recente)
        const plantiosTalhao = plantios
            .filter((p) => p.id_talhao === talhao.id_talhao)
            .sort((a, b) => b.id_plantio - a.id_plantio);

        const plantioAtual =
            plantiosTalhao.find((p) => String(p.status || p.status_sensor || "").toUpperCase() === "ATIVO") ??
            plantiosTalhao[0];

        if (plantioAtual && mapaCulturas.has(plantioAtual.id_cultura)) {
            return mapaCulturas.get(plantioAtual.id_cultura);
        }

        // 2. Fallback: se foi salvo pelo cad_talhao.js como "Talhão de <Cultura>"
        const matchNome = String(talhao.nome_talhao || "").match(/^Talh[ãa]o\s+de\s+(.+)$/i);
        if (matchNome) {
            return matchNome[1].trim();
        }

        return "Sem cultura vinculada";
    }

    function renderizarTalhoes(talhoes, plantios, culturas) {
        const elAreaTotal = $("#area-total-talhoes");
        const elLista = $("#lista-talhoes-dashboard");

        if (!talhoes.length) {
            elAreaTotal.textContent = "Área total registrada: 0km²";
            elLista.innerHTML = "<li>Nenhum talhão cadastrado.</li>";
            return;
        }

        // Banco guarda em hectares (1 km² = 100 ha)
        const areaTotalHa = talhoes.reduce((soma, t) => soma + Number(t.area_ha || 0), 0);
        const areaTotalKm2 = areaTotalHa / 100;
        elAreaTotal.textContent = `Área total registrada: ${formatarNumero(areaTotalKm2, 4)}km²`;

        const mapaCulturas = new Map(culturas.map((c) => [c.id_cultura, c.nome_cultura]));
        const grupos = new Map();

        talhoes.forEach((talhao) => {
            const nomeCultura = descobrirCulturaDoTalhao(talhao, plantios, mapaCulturas);
            const atual = grupos.get(nomeCultura) || { qtd: 0, areaHa: 0 };
            atual.qtd += 1;
            atual.areaHa += Number(talhao.area_ha || 0);
            grupos.set(nomeCultura, atual);
        });

        elLista.innerHTML = "";
        grupos.forEach((info, cultura) => {
            const li = document.createElement("li");
            const rotuloTalhao = info.qtd === 1 ? "Talhão" : "Talhões";
            const areaKm2 = formatarNumero(info.areaHa / 100, 4);
            li.textContent = `${info.qtd} ${rotuloTalhao} de ${cultura} - área: ${areaKm2}km²`;
            elLista.appendChild(li);
        });
    }

    function renderizarCulturas(culturas) {
        const elLista = $("#lista-culturas-dashboard");

        if (!culturas.length) {
            elLista.innerHTML = "<li>Nenhuma cultura cadastrada.</li>";
            return;
        }

        elLista.innerHTML = "";
        culturas.forEach((cultura) => {
            const li = document.createElement("li");
            const dias = formatarNumero(cultura.ciclo_medio_dias, 0);
            li.textContent = `${cultura.nome_cultura} - Ciclo Médio: ${dias} dias`;
            elLista.appendChild(li);
        });
    }

    function sensorEstaOnline(status) {
        const s = String(status || "").trim().toLowerCase();
        return s.includes("on-line") || s === "online" || s === "ativo" || s === "ligado";
    }

    function renderizarSensores(sensores) {
        const elLista = $("#lista-sensores-dashboard");

        if (!sensores.length) {
            elLista.innerHTML = `
                <div class="sensor-item">
                    <span>Nenhum sensor cadastrado</span>
                    <span class="status offline">• Off-line</span>
                </div>
            `;
            return;
        }

        elLista.innerHTML = "";
        sensores.forEach((sensor) => {
            const online = sensorEstaOnline(sensor.status_sensor);
            const nome = sensor.identificador_dispositivo || `Sensor ${String(sensor.id_sensor).padStart(2, "0")}`;

            const div = document.createElement("div");
            div.className = "sensor-item";
            div.innerHTML = `
                <span>${nome}</span>
                <span class="status ${online ? "online" : "offline"}">
                    ${online ? "• On-line" : "• Off-line"}
                </span>
            `;
            elLista.appendChild(div);
        });
    }

    function calcularMediaGrandeza(leituras, grandezas, filtroNome, idFallback, tipo) {
        const grandeza = grandezas.find((g) => filtroNome.test(String(g.nome_grandeza || "")));
        const idAlvo = grandeza ? grandeza.id_grandeza : idFallback;

        const filtradas = leituras.filter((l) => l.id_grandeza === idAlvo);
        if (!filtradas.length) return "Sem leituras";

        const media =
            filtradas.reduce((soma, l) => soma + Number(l.valor_leitura || 0), 0) / filtradas.length;

        // Se o Arduino enviou estado textual em outros_dados ("ÚMIDO" / "SECO")
        const temEstadoTextual = filtradas.some(
            (l) => l.outros_dados && String(l.outros_dados).trim() !== ""
        );

        if (temEstadoTextual) {
            return media >= 0.5 ? "Úmido" : "Seco";
        }

        if (tipo === "temperatura") {
            return `${formatarNumero(media, 1)}°C`;
        }

        return `${formatarNumero(media, 0)}%`;
    }

    function renderizarMedias(leituras, grandezas) {
        const soloUmidade = calcularMediaGrandeza(leituras, grandezas, /umidade.*solo/i, 1, "umidade");
        const soloTemp = calcularMediaGrandeza(leituras, grandezas, /temperatura/i, 2, "temperatura");
        const arUmidade = calcularMediaGrandeza(leituras, grandezas, /umidade.*ar/i, 3, "umidade");

        $("#solo-umidade").textContent = `Umidade: ${soloUmidade}`;
        $("#solo-temperatura").textContent = `Temperatura: ${soloTemp}`;
        $("#ar-umidade").textContent = `Umidade: ${arUmidade}`;
    }

    async function carregarDashboard() {
        marcarMenuAtivo();

        const usuario = window.Sessao?.usuario() ?? null;
        const rotaPropriedade = usuario
            ? `/propriedade?id_usuario=${usuario.id_usuario}`
            : "/propriedade";

        const [
            resPropriedades,
            resTalhoes,
            resCulturas,
            resPlantios,
            resSensores,
            resLeituras,
            resGrandezas,
        ] = await Promise.allSettled([
            buscarJson(rotaPropriedade),
            buscarJson("/talhao"),
            buscarJson("/cultura"),
            buscarJson("/plantio"),
            buscarJson("/sensores"),
            buscarJson("/leitura_sensor"),
            buscarJson("/grandeza_fisica"),
        ]);

        const propriedades = resPropriedades.status === "fulfilled" ? resPropriedades.value : [];
        const todosTalhoes = resTalhoes.status === "fulfilled" ? resTalhoes.value : [];
        const culturas = resCulturas.status === "fulfilled" ? resCulturas.value : [];
        const plantios = resPlantios.status === "fulfilled" ? resPlantios.value : [];
        const todosSensores = resSensores.status === "fulfilled" ? resSensores.value : [];
        const todasLeituras = resLeituras.status === "fulfilled" ? resLeituras.value : [];
        const grandezas = resGrandezas.status === "fulfilled" ? resGrandezas.value : [];

        // 1. Nome da Fazenda no cabeçalho
        const propriedade = escolherPropriedade(propriedades, usuario);
        $("#nome-fazenda").textContent = propriedade
            ? propriedade.nome_propriedade
            : "Nenhuma propriedade";

        // 2. Filtra talhões, sensores e leituras pela propriedade ativa (se houver)
        const talhoes = propriedade
            ? todosTalhoes.filter((t) => t.id_propriedade === propriedade.id_propriedade)
            : todosTalhoes;

        const idsTalhoes = new Set(talhoes.map((t) => t.id_talhao));

        const sensores = propriedade
            ? todosSensores.filter((s) => idsTalhoes.has(s.id_talhao))
            : todosSensores;

        const idsSensores = new Set(sensores.map((s) => s.id_sensor));

        const leituras =
            propriedade && idsSensores.size > 0
                ? todasLeituras.filter((l) => idsSensores.has(l.id_sensor))
                : todasLeituras;

        // 3. Atualiza todos os cartões da tela
        renderizarTalhoes(talhoes, plantios, culturas);
        renderizarCulturas(culturas);
        renderizarSensores(sensores);
        renderizarMedias(leituras, grandezas);
    }

    document.addEventListener("DOMContentLoaded", carregarDashboard);
})();