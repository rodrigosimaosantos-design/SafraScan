
// cadastro.js - tela de registro do SafraScan.
// Envia os dados para POST /auth/cadastro e autentica o usuário
// automaticamente após a criação da conta.

const API_BASE = ['8000', ''].includes(window.location.port)
  ? ''
  : 'http://127.0.0.1:8000';

const API_CADASTRO = `${API_BASE}/auth/cadastro`;
const API_LOGIN = `${API_BASE}/auth/login`;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form-registro');
  const mensagem = document.querySelector('#mensagem');
  const botao = document.querySelector('#botao-registrar');

  const campoEmail = document.querySelector('#email');
  const campoNome = document.querySelector('#nome');
  const campoTelefone = document.querySelector('#telefone');
  const campoSenha = document.querySelector('#senha');
  const campoConfirmar = document.querySelector('#confirmar-senha');
  const campoTipo = document.querySelector('#tipo-usuario');

  function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.className = erro
      ? 'mensagem erro'
      : 'mensagem sucesso';

    mensagem.hidden = false;
  }

  // Converte a resposta de erro da API em texto.
  function textoDoErro(detalhe) {
    if (Array.isArray(detalhe)) {
      const nomes = {
        nome_usuario: 'Nome',
        email_usuario: 'E-mail',
        telefone_usuario: 'Telefone',
        senha: 'Senha',
        tipo_usuario: 'Tipo de usuário',
      };

      return detalhe
        .map((d) =>
          `${nomes[d.loc?.[d.loc.length - 1]] || 'Campo'}: ${d.msg}`
        )
        .join(' | ');
    }

    return detalhe || 'Não foi possível concluir o cadastro.';
  }

  // Validação dos campos no navegador.
  function validar() {
    const email = campoEmail.value.trim();
    const telefone = campoTelefone.value.replace(/\D/g, '');

    if (!campoNome.value.trim()) {
      return ['Informe o seu nome.', campoNome];
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ['Informe um e-mail válido.', campoEmail];
    }

    if (telefone.length < 10 || telefone.length > 11) {
      return [
        'Informe o telefone com DDD (10 ou 11 dígitos).',
        campoTelefone
      ];
    }

    if (campoSenha.value.length < 8) {
      return [
        'A senha deve ter pelo menos 8 caracteres.',
        campoSenha
      ];
    }

    if (campoSenha.value !== campoConfirmar.value) {
      return ['As senhas não coincidem.', campoConfirmar];
    }

    return null;
  }

  // Máscara de telefone: (12) 91234-5678.
  campoTelefone.addEventListener('input', () => {
    const d = campoTelefone.value.replace(/\D/g, '').slice(0, 11);

    let t = d;

    if (d.length > 10) {
      t = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    } else if (d.length > 6) {
      t = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    } else if (d.length > 2) {
      t = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else if (d.length > 0) {
      t = `(${d}`;
    }

    campoTelefone.value = t;
  });

  // Envia os dados do formulário.
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagem.hidden = true;

    const problema = validar();

    if (problema) {
      mostrarMensagem(problema[0], true);
      problema[1].focus();
      return;
    }

    const dados = {
      nome_usuario: campoNome.value.trim(),
      email_usuario: campoEmail.value.trim().toLowerCase(),
      telefone_usuario: campoTelefone.value.replace(/\D/g, ''),
      senha: campoSenha.value,
      tipo_usuario: campoTipo.value,
    };

    botao.disabled = true;
    botao.textContent = 'Cadastrando...';

    try {
      // Etapa 1: cria a conta do usuário.
      let respostaCadastro;

      try {
        respostaCadastro = await fetch(API_CADASTRO, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados),
        });
      } catch {
        throw new Error(
          'Não foi possível acessar o servidor. Confira se o backend está ativo.'
        );
      }

      const resultadoCadastro = await respostaCadastro
        .json()
        .catch(() => ({}));

      if (!respostaCadastro.ok) {
        throw new Error(
          textoDoErro(resultadoCadastro.detail)
        );
      }

      // Etapa 2: autentica o usuário com os mesmos dados.
      mostrarMensagem(
        'Conta criada! Iniciando sua sessão...'
      );

      let respostaLogin;

      try {
        respostaLogin = await fetch(API_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_usuario: dados.email_usuario,
            senha: dados.senha
          }),
        });
      } catch {
        throw new Error(
          'Sua conta foi criada, mas não foi possível iniciar a sessão. Acesse a tela de login.'
        );
      }

      const resultadoLogin = await respostaLogin
        .json()
        .catch(() => ({}));

      if (!respostaLogin.ok) {
        throw new Error(
          'Sua conta foi criada, mas não foi possível iniciar a sessão. Acesse a tela de login.'
        );
      }

      // Etapa 3: salva o token e os dados do usuário.
      if (
        !resultadoLogin.access_token ||
        !resultadoLogin.usuario
      ) {
        throw new Error(
          'Conta criada, mas o servidor não retornou os dados de autenticação. Acesse a tela de login.'
        );
      }

      window.Sessao.salvar(
        resultadoLogin.access_token,
        resultadoLogin.usuario
      );

      // Etapa 4: encaminha para o cadastro da propriedade.
      form.reset();

      mostrarMensagem(
        'Cadastro realizado com sucesso! Vamos configurar sua propriedade...'
      );

      setTimeout(() => {
        window.location.replace('cad_propriedade.html');
      }, 1200);

    } catch (erro) {
      mostrarMensagem(erro.message, true);

      botao.disabled = false;
      botao.textContent = 'Registrar';
    }
  });
});
