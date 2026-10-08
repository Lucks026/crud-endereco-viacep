const formulario = document.getElementById('formulario');
const campos = formulario.elements;
const mensagem = document.getElementById('mensagem');
const botaoCep = document.getElementById('botao-cep');
const botaoSalvar = document.getElementById('botao-salvar');

const soDigitos = texto => texto.replace(/\D/g, '');

function mostrarMensagem(texto, tipo = 'info') {
  mensagem.textContent = texto;
  mensagem.dataset.tipo = tipo;
}

function mostrarErroCampo(campo, texto) {
  document.getElementById(`erro-${campo.id}`).textContent = texto;
  if (texto) campo.setAttribute('aria-invalid', 'true');
  else campo.removeAttribute('aria-invalid');
}

function mascararCep(valor) {
  return soDigitos(valor).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

function mascararCpf(valor) {
  return soDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascararTelefone(valor) {
  const digitos = soDigitos(valor).slice(0, 11);
  if (digitos.length > 10) return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return digitos.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
}

const mascaras = { cep: mascararCep, cpf: mascararCpf, telefone: mascararTelefone };

// Reaplica a máscara e devolve o cursor para depois do mesmo dígito em que ele estava.
// Sem isso, corrigir um número no meio do campo joga o cursor para o fim.
function aplicarMascara(campo) {
  const digitosAntes = soDigitos(campo.value.slice(0, campo.selectionStart)).length;
  campo.value = mascaras[campo.id](campo.value);

  let posicao = 0;
  for (let vistos = 0; vistos < digitosAntes && posicao < campo.value.length; posicao++) {
    if (/\d/.test(campo.value[posicao])) vistos++;
  }
  campo.setSelectionRange(posicao, posicao);
}

// Data de hoje no formato do input date (AAAA-MM-DD), no fuso do navegador
function hoje() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// Devolve a mensagem de erro do campo, ou texto vazio se estiver tudo certo
function validarCampo(campo) {
  const valor = campo.value.trim();
  // data digitada pela metade chega com valor vazio, e só o badInput denuncia
  if (campo.type === 'date' && campo.validity.badInput) return 'Data inválida.';
  if (!valor) return campo.required ? 'Campo obrigatório.' : '';

  switch (campo.id) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? '' : 'E-mail inválido.';
    case 'telefone':
      return [10, 11].includes(soDigitos(valor).length) ? '' : 'Telefone deve ter 10 ou 11 dígitos.';
    case 'cpf':
      return soDigitos(valor).length === 11 ? '' : 'CPF deve ter 11 dígitos.';
    case 'dataNascimento':
      return valor <= hoje() ? '' : 'A data não pode ser futura.';
    case 'cep':
      return soDigitos(valor).length === 8 ? '' : 'CEP deve ter 8 dígitos.';
    case 'uf':
      return /^[a-z]{2}$/i.test(valor) ? '' : 'UF deve ter 2 letras.';
    default:
      return '';
  }
}

// Campo que já estava marcado com erro é conferido de novo a cada mudança
function revalidar(campo) {
  if (campo.hasAttribute('aria-invalid')) mostrarErroCampo(campo, validarCampo(campo));
}

function validarFormulario() {
  let primeiroInvalido = null;
  for (const campo of formulario.querySelectorAll('input')) {
    const erro = validarCampo(campo);
    mostrarErroCampo(campo, erro);
    if (erro && !primeiroInvalido) primeiroInvalido = campo;
  }
  if (!primeiroInvalido) return true;

  mostrarMensagem('Confira os campos destacados.', 'erro');
  primeiroInvalido.focus();
  return false;
}

function preencherEndereco(dados) {
  const valores = {
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    uf: dados.uf,
  };
  for (const [id, valor] of Object.entries(valores)) {
    campos[id].value = valor || '';
    revalidar(campos[id]);
  }
}

function limparEndereco() {
  preencherEndereco({});
}

async function pesquisarCep() {
  if (botaoCep.disabled) return;

  const cep = soDigitos(campos.cep.value);
  if (cep.length !== 8) {
    mostrarErroCampo(campos.cep, 'CEP deve ter 8 dígitos.');
    campos.cep.focus();
    return;
  }

  mostrarErroCampo(campos.cep, '');
  mostrarMensagem('');
  botaoCep.disabled = true;
  botaoCep.textContent = 'Pesquisando...';
  try {
    const dados = await buscarCep(cep);
    if (!dados) {
      limparEndereco();
      mostrarErroCampo(campos.cep, 'CEP não encontrado.');
      campos.cep.focus();
      return;
    }
    preencherEndereco(dados);
    // CEP geral de cidade pequena vem sem logradouro
    const proximo = dados.logradouro ? campos.numero : campos.logradouro;
    proximo.focus();
  } catch {
    mostrarMensagem('O ViaCEP não respondeu. Tente de novo ou preencha o endereço à mão.', 'erro');
    campos.cep.focus();
  } finally {
    botaoCep.disabled = false;
    botaoCep.textContent = 'Pesquisar CEP';
  }
}

function lerFormulario() {
  const valor = id => campos[id].value.trim();
  return {
    nome: valor('nome'),
    email: valor('email'),
    telefone: valor('telefone'),
    cpf: valor('cpf'),
    dataNascimento: valor('dataNascimento'),
    endereco: {
      cep: valor('cep'),
      logradouro: valor('logradouro'),
      numero: valor('numero'),
      complemento: valor('complemento'),
      bairro: valor('bairro'),
      cidade: valor('cidade'),
      uf: valor('uf').toUpperCase(),
    },
  };
}

async function salvar(evento) {
  evento.preventDefault();
  if (botaoSalvar.disabled || !validarFormulario()) return;

  botaoSalvar.disabled = true;
  botaoSalvar.textContent = 'Salvando...';
  try {
    await criar(lerFormulario());
    formulario.reset();
    mostrarMensagem('Cliente salvo.', 'ok');
    campos.nome.focus();
  } catch (erro) {
    mostrarMensagem(mensagemErroCrud(erro), 'erro');
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = 'Salvar';
    // desabilitar o botão derruba o foco de quem navega pelo teclado
    if (document.activeElement === document.body) botaoSalvar.focus();
  }
}

formulario.addEventListener('input', evento => {
  const campo = evento.target;
  if (mascaras[campo.id]) aplicarMascara(campo);
  revalidar(campo);
  mostrarMensagem('');
});

botaoCep.addEventListener('click', pesquisarCep);

// Enter no campo CEP pesquisa o endereço em vez de enviar o formulário
campos.cep.addEventListener('keydown', evento => {
  if (evento.key !== 'Enter') return;
  evento.preventDefault();
  pesquisarCep();
});

formulario.addEventListener('submit', salvar);

if (!idConfigurado()) mostrarMensagem(MENSAGEM_SEM_ID, 'erro');
