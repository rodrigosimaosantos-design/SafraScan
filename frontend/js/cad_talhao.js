(() => {

    const API_URL = window.SAFRASCAN_API_URL ?? (
        window.location.port === "8000"
            ? ""
            : `${window.location.protocol}//${window.location.hostname}:8000`
    );

    const formulario = document.querySelector(
        "#form-talhao-cultura"
    );

    if (!formulario) return;

    const propriedadeSelect =
        document.querySelector("#id-propriedade");

    const campoArea =
        document.querySelector("#area-talhao");

    const campoSolo =
        document.querySelector("#tipo-solo");

    const campoCultura =
        document.querySelector("#nome-cultura");

    const campoCiclo =
        document.querySelector("#ciclo-cultura");

    const botaoRegistrar =
        document.querySelector("#botao-registrar");

    const mensagem =
        document.querySelector("#mensagem-talhao");


    // Função para conversar com a API
    async function requisicao(caminho, opcoes = {}) {

        let resposta;

        try {

            resposta = await fetch(`${API_URL}${caminho}`, {
                ...opcoes,

                headers: {
                    ...(opcoes.body
                        ? { "Content-Type": "application/json" }
                        : {}),

                    ...(opcoes.headers || {})
                }
            });

        } catch {

            throw new Error(
                "Não foi possível conectar à API."
            );

        }

        if (resposta.status === 204) return null;

        const conteudo = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {

            const detalhe = conteudo.detail;

            const texto = Array.isArray(detalhe)
                ? detalhe.map(item =>
                    `${item.loc?.join(".")}: ${item.msg}`
                  ).join("; ")
                : detalhe;

            throw new Error(
                texto || `Erro ${resposta.status}`
            );

        }

        return conteudo;

    }


    // Mostrar mensagens na tela
    function mostrarMensagem(texto, erro = false) {

        mensagem.textContent = texto;

        mensagem.classList.toggle("erro", erro);

        mensagem.hidden = false;

    }


    // Ids das propriedades do usuário logado (só estas podem receber talhões)
    let idsPermitidos = new Set();


    // Buscar as propriedades do usuário logado
    async function carregarPropriedades() {

        // O talhão pertence a uma propriedade do usuário logado.
        const usuario = window.Sessao?.usuario();

        if (!usuario) {

            propriedadeSelect.replaceChildren(
                new Option("Entre na sua conta", "")
            );

            mostrarMensagem(
                "Entre na sua conta para cadastrar um talhão. Redirecionando...",
                true
            );

            botaoRegistrar.disabled = true;

            setTimeout(() => window.location.replace("login.html"), 1800);

            return;

        }

        try {

            // A API filtra por id_usuario; filtramos de novo aqui por garantia.
            const todas = await requisicao(
                `/propriedade?id_usuario=${usuario.id_usuario}`
            );

            const propriedades = todas.filter(
                propriedade => propriedade.id_usuario === usuario.id_usuario
            );

            idsPermitidos = new Set(
                propriedades.map(propriedade => propriedade.id_propriedade)
            );

            propriedadeSelect.replaceChildren();

            const opcaoInicial = document.createElement("option");

            opcaoInicial.value = "";
            opcaoInicial.textContent = "Selecione a propriedade";

            propriedadeSelect.append(opcaoInicial);

            for (const propriedade of propriedades) {

                const opcao = document.createElement("option");

                opcao.value = propriedade.id_propriedade;

                opcao.textContent = propriedade.nome_propriedade;

                propriedadeSelect.append(opcao);

            }

            // Pré-seleciona a propriedade ativa (ou a única existente).
            let ativa = null;

            try {
                ativa = JSON.parse(
                    localStorage.getItem("safrascan_propriedade_ativa")
                );
            } catch { /* ignora */ }

            if (idsPermitidos.has(ativa?.id_propriedade)) {

                propriedadeSelect.value = String(ativa.id_propriedade);

            } else if (propriedades.length === 1) {

                propriedadeSelect.value = String(propriedades[0].id_propriedade);

            }

            if (propriedades.length === 0) {

                opcaoInicial.textContent =
                    "Nenhuma propriedade cadastrada";

                mostrarMensagem(
                    "Cadastre uma propriedade antes de registrar um talhão.",
                    true
                );

                botaoRegistrar.disabled = true;

            }

        } catch (erro) {

            propriedadeSelect.replaceChildren();

            const opcao = document.createElement("option");

            opcao.value = "";
            opcao.textContent = "Não foi possível carregar";

            propriedadeSelect.append(opcao);

            mostrarMensagem(
                `Erro ao carregar propriedades: ${erro.message}`,
                true
            );

            botaoRegistrar.disabled = true;

        }

    }


    // Registrar talhão e cultura
    formulario.addEventListener("submit", async evento => {

        evento.preventDefault();

        mensagem.hidden = true;

        const dadosTalhao = {

            id_propriedade: Number(propriedadeSelect.value),

            area_ha: Number(campoArea.value).toFixed(2),

            tipo_solo: campoSolo.value

        };

        const dadosCultura = {

            nome_cultura: campoCultura.value.trim(),

            ciclo_medio_dias: Number(campoCiclo.value)

        };


        if (dadosTalhao.id_propriedade &&
            !idsPermitidos.has(dadosTalhao.id_propriedade)) {

            mostrarMensagem(
                "Escolha uma das suas propriedades.",
                true
            );

            return;

        }

        if (!dadosTalhao.id_propriedade ||
            !dadosCultura.nome_cultura) {

            mostrarMensagem(
                "Preencha todos os campos antes de registrar.",
                true
            );

            return;

        }


        botaoRegistrar.disabled = true;

        botaoRegistrar.textContent = "Registrando...";


        try {

            // Primeiro cadastra o talhão
            const talhaoCriado = await requisicao("/talhao", {

                method: "POST",

                body: JSON.stringify(dadosTalhao)

            });


            // Depois cadastra a cultura
            try {

                await requisicao("/cultura", {

                    method: "POST",

                    body: JSON.stringify(dadosCultura)

                });

            } catch (erroCultura) {

                // Tenta desfazer o talhão se a cultura falhar
                try {

                    await requisicao(
                        `/talhao/${talhaoCriado.id_talhao}`,
                        { method: "DELETE" }
                    );

                } catch {

                    throw new Error(
                        `A cultura não foi cadastrada e não foi possível desfazer o talhão #${talhaoCriado.id_talhao}. ${erroCultura.message}`
                    );

                }

                throw new Error(
                    `A cultura não foi cadastrada. O talhão foi desfeito. ${erroCultura.message}`
                );

            }

            // Cadastro realizado com sucesso
            const propriedadeEscolhida = propriedadeSelect.value;

            formulario.reset();

            propriedadeSelect.value = propriedadeEscolhida;

            mostrarMensagem(
                `Talhão #${talhaoCriado.id_talhao} e cultura cadastrados com sucesso!`
            );


            // Redirecionar para o dashboard após 2 segundos
            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 2000);


        } catch (erro) {

            mostrarMensagem(erro.message, true);

        } finally {

            botaoRegistrar.disabled = false;

            botaoRegistrar.textContent = "Registrar";

        }

    });


    // Iniciar carregamento das propriedades
    carregarPropriedades();

})();