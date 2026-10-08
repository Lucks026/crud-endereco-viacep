const formulario = document.getElementById('formulario');
const campos = formulario.elements;

const soDigitos = texto => texto.replace(/\D/g, '');

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

formulario.addEventListener('input', evento => {
  const campo = evento.target;
  if (mascaras[campo.id]) aplicarMascara(campo);
});
