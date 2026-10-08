const tabela = document.getElementById('tabela');
const corpoTabela = document.getElementById('corpo-tabela');
const estado = document.getElementById('estado');
const mensagem = document.getElementById('mensagem');
const linkNovo = document.getElementById('link-novo');

let clientes = [];

function mostrarEstado(texto, tipo = 'info') {
  estado.textContent = texto;
  estado.dataset.tipo = tipo;
}

function mostrarMensagem(texto, tipo = 'info') {
  mensagem.textContent = texto;
  mensagem.dataset.tipo = tipo;
}

// textContent, e não innerHTML: o que foi digitado no cadastro entra como texto puro
function criarCelula(rotulo, texto) {
  const celula = document.createElement('td');
  celula.dataset.rotulo = rotulo;
  celula.textContent = texto || '-';
  return celula;
}

function criarAcoes(cliente) {
  const editar = document.createElement('a');
  editar.href = `index.html?id=${encodeURIComponent(cliente._id)}`;
  editar.className = 'botao';
  editar.textContent = 'Editar';
  editar.setAttribute('aria-label', `Editar ${cliente.nome}`);

  const botaoExcluir = document.createElement('button');
  botaoExcluir.type = 'button';
  botaoExcluir.className = 'botao botao-perigo';
  botaoExcluir.textContent = 'Excluir';
  botaoExcluir.setAttribute('aria-label', `Excluir ${cliente.nome}`);
  botaoExcluir.addEventListener('click', () => excluirCliente(cliente, botaoExcluir));

  const celula = document.createElement('td');
  celula.append(editar, botaoExcluir);
  return celula;
}

async function excluirCliente(cliente, botao) {
  if (!confirm(`Excluir ${cliente.nome}?`)) return;

  botao.disabled = true;
  botao.textContent = 'Excluindo...';
  try {
    await excluir(cliente._id);
  } catch (erro) {
    mostrarMensagem(mensagemErroCrud(erro), 'erro');
    botao.disabled = false;
    botao.textContent = 'Excluir';
    botao.focus();
    return;
  }

  // sai do array em memória e a tabela é redesenhada sem um novo GET
  clientes = clientes.filter(item => item._id !== cliente._id);
  desenharTabela();
  mostrarMensagem('Cliente excluído.', 'ok');
  // o botão sumiu junto com a linha; o foco volta para o topo sem rolar a página
  linkNovo.focus({ preventScroll: true });
}

function criarLinha(cliente) {
  const endereco = cliente.endereco || {};
  const cidadeUf = [endereco.cidade, endereco.uf].filter(Boolean).join('/');

  const linha = document.createElement('tr');
  linha.append(
    criarCelula('Nome', cliente.nome),
    criarCelula('E-mail', cliente.email),
    criarCelula('Telefone', cliente.telefone),
    criarCelula('Cidade/UF', cidadeUf),
    criarAcoes(cliente),
  );
  return linha;
}

function desenharTabela() {
  corpoTabela.replaceChildren(...clientes.map(criarLinha));
  tabela.hidden = clientes.length === 0;
  mostrarEstado(clientes.length === 0 ? 'Nenhum cliente cadastrado.' : '');
}

async function carregarClientes() {
  tabela.hidden = true;
  mostrarEstado('Carregando clientes...');
  try {
    clientes = await listar();
  } catch (erro) {
    mostrarEstado(mensagemErroCrud(erro), 'erro');
    return;
  }
  desenharTabela();
}

// pageshow dispara na carga e também quando a página volta do histórico,
// que é quando a lista em tela pode estar desatualizada
window.addEventListener('pageshow', carregarClientes);
