/* ==========================================================================
   SAFRASCAN - BASE.CSS
   Variáveis de Temas (Paleta Visual), Reset e Componentes
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. SISTEMA DE TEMAS (Baseado na guia visual)
   -------------------------------------------------------------------------- */

/* Tema Padrão */
:root,
[data-theme="padrao"] {
  --font-family: 'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  
  --bg-app: #f3eee6;
  --bg-card: #f3eee6;
  --bg-subtle: #e8e3da;
  
  --cor-primaria: #305c0e;   /* Verde */
  --cor-secundaria: #5c0e30; /* Grená/Vinho */
  --cor-detalhe: #4e5c0e;    /* Verde Oliva */
  --cor-marinho: #0e305c;    /* Azul Marinho */

  --text-main: #201e1a;
  --text-muted: #4e5c0e;
  --text-light: #6e685f;
  
  --border-color: #d8d2c7;
  --divider-color: #e2dcd1;

  --btn-bg: #305c0e;
  --btn-color: #f3eee6;
  --btn-hover: #4e5c0e;

  --shadow-floating: 0 12px 28px -4px rgba(0, 0, 0, 0.1), 0 6px 12px -4px rgba(0, 0, 0, 0.05);
  --shadow-floating-hover: 0 20px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -5px rgba(0, 0, 0, 0.08);
  
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}

/* Tema Escuro */
[data-theme="escuro"],
body.dark-mode {
  --bg-app: #000000;
  --bg-card: #201e1a;
  --bg-subtle: #141311;
  
  --cor-primaria: #305c0e;
  --cor-secundaria: #0e305c;
  --cor-detalhe: #4e5c0e;

  --text-main: #f3eee6;
  --text-muted: #a09a90;
  --text-light: #6e685f;
  
  --border-color: #33302b;
  --divider-color: #262420;

  --btn-bg: #305c0e;
  --btn-color: #f3eee6;
  --btn-hover: #4e5c0e;

  --shadow-floating: 0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 6px 12px -4px rgba(0, 0, 0, 0.3);
  --shadow-floating-hover: 0 20px 35px -5px rgba(0, 0, 0, 0.65), 0 10px 15px -5px rgba(0, 0, 0, 0.4);
}

/* Tema Azul-Aço */
[data-theme="azul-aco"] {
  --bg-app: #40546d;
  --bg-card: #201e1a;
  --bg-subtle: #3b5c86;

  --cor-primaria: #3b5c86;
  --cor-secundaria: #0e305c;
  --cor-detalhe: #40546d;

  --text-main: #f3eee6;
  --text-muted: #b0c2d4;
  --text-light: #7c93ab;

  --border-color: #3b4d63;
  --divider-color: #2f3e50;

  --btn-bg: #3b5c86;
  --btn-color: #f3eee6;
  --btn-hover: #0e305c;
}

/* Tema Sálvia */
[data-theme="salvia"] {
  --bg-app: #84896e;
  --bg-card: #201e1a;
  --bg-subtle: #4e5c0e;

  --cor-primaria: #305c0e;
  --cor-secundaria: #4e5c0e;
  --cor-detalhe: #84896e;

  --text-main: #f3eee6;
  --text-muted: #c2c7b0;
  --text-light: #8e947b;

  --border-color: #4e5641;
  --divider-color: #383e2f;

  --btn-bg: #305c0e;
  --btn-color: #f3eee6;
  --btn-hover: #4e5c0e;
}

/* Tema Grená */
[data-theme="grena"] {
  --bg-app: #8b6f6f;
  --bg-card: #201e1a;
  --bg-subtle: #985b5b;

  --cor-primaria: #985b5b;
  --cor-secundaria: #5c0e30;
  --cor-detalhe: #8b6f6f;

  --text-main: #f3eee6;
  --text-muted: #d9c3c3;
  --text-light: #a48787;

  --border-color: #574343;
  --divider-color: #3d2f2f;

  --btn-bg: #5c0e30;
  --btn-color: #f3eee6;
  --btn-hover: #985b5b;
}

/* --------------------------------------------------------------------------
   2. RESET E TIPOGRAFIA GLOBAL
   -------------------------------------------------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
}

body { 
  margin: 0; 
  background-color: var(--bg-app); 
  color: var(--text-main); 
  font-family: var(--font-family); 
  font-size: 16px;
  line-height: 1.5; 
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

h1, h2, p { 
  margin: 0; 
}

h1 { 
  font-size: 34px; 
  margin-bottom: 4px; 
}

h2 { 
  font-size: 20px; 
}

.container { 
  width: min(1120px, 92%); 
  margin: auto; 
}

/* --------------------------------------------------------------------------
   3. ESTRUTURA E CABEÇALHO
   -------------------------------------------------------------------------- */
.cabecalho { 
  background: var(--cor-primaria); 
  color: var(--text-main); 
  padding: 24px 0; 
  border-bottom: 5px solid var(--cor-secundaria); 
}

.cabecalho .container { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  gap: 12px;
}

.marca { 
  color: var(--bg-app); 
  font-size: 25px; 
  font-weight: bold; 
}

.subtitulo { 
  font-size: 14px; 
  opacity: 0.9;
}

.titulo-pagina { 
  margin: 32px 0 24px; 
}

.titulo-pagina > p:last-child { 
  color: var(--cor-secundaria); 
}

.legenda { 
  font-size: 12px; 
  letter-spacing: 1px; 
  font-weight: bold; 
  color: var(--text-muted);
}

.titulo-pagina .legenda { 
  margin-bottom: 2px; 
}

/* --------------------------------------------------------------------------
   4. PAINÉIS E FORMULÁRIOS
   -------------------------------------------------------------------------- */
.painel { 
  background: var(--bg-card); 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-md); 
  overflow: hidden;
  margin-bottom: 26px; 
  box-shadow: var(--shadow-floating); 
}

.painel-titulo { 
  background: var(--cor-secundaria); 
  color: #ffffff;
  padding: 17px 24px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.formulario { 
  padding: 26px 24px; 
}

.campos { 
  display: grid; 
  grid-template-columns: 120px 1fr 230px; 
  gap: 20px; 
}

.campo { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

label { 
  font-weight: bold; 
  font-size: 14px; 
  color: var(--text-main);
}

input, button { 
  font: inherit; 
}

input:not([type="range"]) { 
  width: 100%; 
  min-width: 0; 
  padding: 12px; 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-sm); 
  color: var(--text-main); 
  background: var(--bg-subtle); 
}

input[readonly] { 
  opacity: 0.8;
}

input:focus-visible, button:focus-visible { 
  outline: 2px solid var(--cor-primaria); 
  outline-offset: 2px; 
}

/* Botões */
.acoes { 
  display: flex; 
  gap: 12px; 
}

.botao { 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-sm); 
  padding: 10px 20px; 
  cursor: pointer; 
  font-weight: bold; 
  transition: background var(--transition-fast), color var(--transition-fast); 
  white-space: nowrap; 
}

.botao-principal { 
  background: var(--btn-bg); 
  color: var(--btn-color); 
  border-color: var(--btn-bg); 
}

.botao-principal:hover { 
  background: var(--btn-hover); 
}

.botao-secundario { 
  background: var(--bg-subtle); 
  color: var(--text-main); 
}

.botao-secundario:hover { 
  background: var(--border-color); 
}

.botao:disabled { 
  opacity: .55; 
  cursor: not-allowed; 
}

/* --------------------------------------------------------------------------
   5. LISTAS, BUSCAS E MENSAGENS
   -------------------------------------------------------------------------- */
.barra-lista { 
  padding: 22px 24px; 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-end; 
  gap: 16px; 
}

.busca { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
}

.busca input { 
  max-width: 160px; 
}

.tabela-container { 
  overflow-x: auto; 
  padding: 0 24px 24px; 
}

.mensagem { 
  padding: 14px 18px; 
  margin-bottom: 20px; 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-sm); 
  background: var(--bg-subtle); 
  color: var(--text-main); 
}

.mensagem.erro { 
  background: rgba(211, 47, 47, 0.1); 
  border-color: #d32f2f; 
  color: #d32f2f; 
}

.rodape { 
  color: var(--text-muted); 
  text-align: center; 
  font-size: 12px; 
  padding: 0 0 26px; 
}

/* --------------------------------------------------------------------------
   6. CARTÕES FLUTUANTES (.card-floating)
   -------------------------------------------------------------------------- */
.card-floating {
  position: relative;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-floating);
  padding: 1.5rem;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  z-index: 10;
}

.card-floating.is-hoverable {
  cursor: pointer;
}

.card-floating.is-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-floating-hover);
}

.card-floating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-floating-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.card-floating-body {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.card-floating-footer {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--divider-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.card-floating-glass {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

[data-theme="escuro"] .card-floating-glass,
body.dark-mode .card-floating-glass {
  background: rgba(32, 30, 26, 0.85);
  border-color: rgba(255, 255, 255, 0.1);
}

/* --------------------------------------------------------------------------
   7. ÍCONES SVG E RODAPÉ DA APLICAÇÃO
   -------------------------------------------------------------------------- */
.pill-icon-external {
  width: 1.125rem;
  height: 1.125rem;
  display: inline-block;
  background-color: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  flex-shrink: 0;
}

.icon-home {
  mask-image: url('../assets/icons/home.svg');
  -webkit-mask-image: url('../assets/icons/home.svg');
}

.icon-leaf {
  mask-image: url('../assets/icons/leaf.svg');
  -webkit-mask-image: url('../assets/icons/leaf.svg');
}

.icon-chart {
  mask-image: url('../assets/icons/chart.svg');
  -webkit-mask-image: url('../assets/icons/chart.svg');
}

.app-footer {
  width: 100%;
  background-color: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 2rem 1.5rem 1.5rem;
  margin-top: auto;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-logo-mask {
  width: 140px;
  height: 36px;
  display: inline-block;
  background-color: var(--cor-primaria);
  mask-image: url('../assets/img/Logo Principal.png');
  mask-repeat: no-repeat;
  mask-position: left center;
  mask-size: contain;
  -webkit-mask-image: url('../assets/img/Logo Principal.png');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: left center;
  -webkit-mask-size: contain;
  transition: background-color var(--transition-fast);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--cor-primaria);
}

.footer-bottom {
  padding-top: 1.25rem;
  border-top: 1px solid var(--divider-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copy {
  font-size: 0.8125rem;
  color: var(--text-light);
}

.footer-version {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-light);
  background-color: var(--bg-subtle);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

/* --------------------------------------------------------------------------
   8. RESPONSIVIDADE
   -------------------------------------------------------------------------- */
@media (max-width: 760px) {
  .campos {
    grid-template-columns: 1fr;
  }
  .barra-lista, .busca {
    flex-wrap: wrap;
  }
  .painel-titulo {
    align-items: flex-start;
    flex-direction: column;
  }
  .subtitulo {
    display: none;
  }
  .marca {
    font-size: 22px;
  }
  .formulario, .barra-lista {
    padding: 20px 16px;
  }
  .tabela-container {
    padding: 0 16px 20px;
  }
  .footer-top,
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .footer-links {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}