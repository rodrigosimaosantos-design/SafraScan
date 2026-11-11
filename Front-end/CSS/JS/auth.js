// As telas de login/cadastro permanecem sem envio de senha enquanto o backend
// não oferecer autenticação e hash de senha gerado no servidor.
const loginForm = document.querySelector("#form-login");
const cadastroForm = document.querySelector("#form-cadastro");
if (loginForm) {
  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const aviso = document.querySelector("#login-message");
    aviso.textContent = "A API atual não possui endpoint de login. Nenhuma senha foi enviada.";
    aviso.className = "ss-note";
  });
}
if (cadastroForm) {
  cadastroForm.addEventListener("submit", event => {
    event.preventDefault();
    const aviso = document.querySelector("#cadastro-message");
    const senha = document.querySelector("#senha-cadastro").value;
    const confirmar = document.querySelector("#confirmar-cadastro").value;
    if (senha !== confirmar) {
      aviso.textContent = "As senhas informadas não coincidem.";
      aviso.className = "ss-note";
      return;
    }
    aviso.textContent = "Os campos foram validados no navegador, mas o cadastro ainda não foi enviado. É necessário implementar no backend o hash seguro da senha e a rota de autenticação antes de armazenar credenciais.";
    aviso.className = "ss-note";
  });
}
