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
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
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

// As respostas de erro do CrudCrud (ID vencido, registro inexistente, 500) vêm sem
// cabeçalho de CORS: o navegador esconde o status e o fetch só rejeita.
// Então, se a busca falha mas a listagem responde, o endpoint está de pé
// e é o registro que não existe.
async function buscarPorId(id) {
  try {
    return await requisitarCrud(`/${encodeURIComponent(id)}`);
  } catch (erro) {
    if (erro.name === 'AbortError') throw erro;
    await listar();
    const naoEncontrado = new Error('Registro não encontrado');
    naoEncontrado.naoEncontrado = true;
    throw naoEncontrado;
  }
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

// Sem o status (ver buscarPorId) não dá para separar ID vencido de serviço fora do ar,
// então a mensagem geral cobre os dois.
function mensagemErroCrud(erro) {
  if (!idConfigurado()) return MENSAGEM_SEM_ID;
  if (erro.naoEncontrado) return 'Registro não encontrado.';
  if (erro.name === 'AbortError') return 'O CrudCrud demorou demais para responder. Tente de novo em instantes.';
  return 'Não deu para acessar o CrudCrud. Se o ID venceu, gere outro em crudcrud.com e atualize o js/config.js. Se o ID é novo, tente de novo em instantes.';
}
