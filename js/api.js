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
