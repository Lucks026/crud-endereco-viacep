const TEMPO_LIMITE = 10000;

// Devolve o JSON da resposta, ou null quando ela vem sem corpo,
// que é como o CrudCrud responde ao PUT e ao DELETE.
async function requisitar(url, opcoes = {}) {
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE);
  try {
    const resposta = await fetch(url, { ...opcoes, signal: controle.signal });
    if (!resposta.ok) {
      const erro = new Error(`HTTP ${resposta.status}`);
      erro.status = resposta.status;
      throw erro;
    }
    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
  } finally {
    clearTimeout(temporizador);
  }
}

async function buscarCep(cep) {
  const dados = await requisitar(`https://viacep.com.br/ws/${cep}/json/`);
  // CEP que não existe volta com status 200 e o campo erro
  return dados.erro ? null : dados;
}
