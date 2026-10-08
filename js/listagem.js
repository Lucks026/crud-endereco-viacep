const tabela = document.getElementById('tabela');
const corpoTabela = document.getElementById('corpo-tabela');
const estado = document.getElementById('estado');

let clientes = [];

function mostrarEstado(texto, tipo = 'info') {
  estado.textContent = texto;
  estado.dataset.tipo = tipo;
}

// textContent, e não innerHTML: o que foi digitado no cadastro entra como texto puro
function criarCelula(rotulo, texto) {
  const celula = document.createElement('td');
  celula.dataset.rotulo = rotulo;
  celula.textContent = texto || '-';
  return celula;
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
