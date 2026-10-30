/*
 * Este arquivo é usado por todas as páginas.
 * Ele cuida de dois detalhes simples: avisar quando a API está disponível
 * na página inicial e dar uma entrada suave aos blocos da tela.
 */

const statusDaApi = document.querySelector("#api-status");
const apiBaseUrl = window.SAFRASCAN_API_URL ?? (
    window.location.port === "8000" ? "" : "http://127.0.0.1:8000"
);

/* Pessoas que preferem menos movimento no computador não recebem animações. */
const prefereMenosMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

async function verificarConexaoComApi() {
    /* Só a página inicial possui este aviso; nas outras não há nada a fazer. */
    if (!statusDaApi) {
        return;
    }

    if (window.location.protocol === "file:") {
        statusDaApi.textContent =
            "Abra pelo servidor para verificar a conexão com o SafraScan.";
        return;
    }

    try {
        const resposta = await fetch(`${apiBaseUrl}/api/health`);

        if (!resposta.ok) {
            throw new Error(`A API respondeu com status ${resposta.status}`);
        }

        const dados = await resposta.json();
        statusDaApi.textContent = dados.mensagem;
        statusDaApi.classList.add("status-conectado");
    } catch (erro) {
        statusDaApi.textContent =
            "Não foi possível falar com o servidor neste momento.";
        statusDaApi.classList.add("status-indisponivel");
        console.error("Falha ao conectar à API SafraScan:", erro);
    }
}

function animarEntrada() {
    if (prefereMenosMovimento || !window.anime?.animate) {
        return;
    }

    /* São apenas os blocos principais: o conteúdo entra de forma leve ao abrir. */
    const blocos = document.querySelectorAll(
        "header, main, footer, .login-card, .card, .painel-cabecalho, .pagina-conteudo"
    );

    if (!blocos.length) {
        return;
    }

    window.anime.animate(blocos, {
        opacity: [0, 1],
        y: [14, 0],
        delay: window.anime.stagger(55),
        duration: 520,
        ease: "out(3)",
    });
}

function carregarAnime() {
    if (prefereMenosMovimento) {
        return;
    }

    if (window.anime?.animate) {
        animarEntrada();
        return;
    }

    /* A biblioteca é baixada só quando há animação para mostrar. */
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js";
    script.async = true;
    script.onload = animarEntrada;
    document.head.appendChild(script);
}

verificarConexaoComApi();
carregarAnime();
