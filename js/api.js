const TEMPO_LIMITE = 10000;
const CABECALHO_JSON = { 'Content-Type': 'application/json' };
const MENSAGEM_SEM_ID = 'Falta o ID do CrudCrud. Gere um em crudcrud.com e cole no js/config.js.';

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

function idConfigurado() {
  return CRUDCRUD_ID !== 'COLE_SEU_ID_AQUI';
}

// Toda chamada ao CrudCrud passa por aqui, para nada ser enviado sem o ID
async function requisitarCrud(caminho = '', opcoes) {
  if (!idConfigurado()) throw new Error('ID do CrudCrud não configurado');
  return requisitar(`${BASE_URL}/${RECURSO}${caminho}`, opcoes);
}

function criar(cliente) {
  return requisitarCrud('', {
    method: 'POST',
    headers: CABECALHO_JSON,
    body: JSON.stringify(cliente),
  });
}

function listar() {
  return requisitarCrud();
}

function buscarPorId(id) {
  return requisitarCrud(`/${encodeURIComponent(id)}`);
}

function atualizar(id, cliente) {
  // o CrudCrud devolve 500 se o corpo do PUT levar o _id
  const { _id, ...dados } = cliente;
  return requisitarCrud(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: CABECALHO_JSON,
    body: JSON.stringify(dados),
  });
}

function excluir(id) {
  return requisitarCrud(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function mensagemErroCrud(erro) {
  if (!idConfigurado()) return MENSAGEM_SEM_ID;
  if (erro.status === 404) return 'Registro não encontrado.';
  if (erro.status >= 400 && erro.status < 500) {
    return 'O endpoint do CrudCrud expirou ou o ID está errado. Gere um novo em crudcrud.com e atualize o js/config.js.';
  }
  // sobra erro 5xx, tempo esgotado ou falha de rede
  return 'O CrudCrud não respondeu. Tente de novo em instantes.';
}
