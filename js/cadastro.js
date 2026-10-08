const formulario = document.getElementById('formulario');
const campos = formulario.elements;
const mensagem = document.getElementById('mensagem');
const botaoCep = document.getElementById('botao-cep');

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

function preencherEndereco(dados) {
  const valores = {
    logradouro: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    uf: dados.uf,
  };
  for (const [id, valor] of Object.entries(valores)) {
    campos[id].value = valor || '';
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

formulario.addEventListener('input', evento => {
  const campo = evento.target;
  if (mascaras[campo.id]) aplicarMascara(campo);
});

botaoCep.addEventListener('click', pesquisarCep);
