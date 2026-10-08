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

formulario.addEventListener('input', evento => {
  const campo = evento.target;
  if (mascaras[campo.id]) campo.value = mascaras[campo.id](campo.value);
});
