# Cadastro de clientes com endereço

CRUD de clientes em HTML, CSS e JavaScript puro. O endereço é preenchido pelo CEP com o ViaCEP e os dados são salvos no CrudCrud.

Não tem back-end nem biblioteca. São duas telas: o cadastro (`index.html`) e a listagem (`listagem.html`).

## O que dá para fazer

No cadastro, o botão Pesquisar CEP consulta o ViaCEP e preenche logradouro, bairro, cidade e UF. O botão Salvar manda o formulário para o CrudCrud.

A listagem mostra os clientes salvos e tem busca por nome. Por ela também dá para editar e excluir.

## Como rodar

1. Abra https://crudcrud.com. A página mostra um endereço no formato `https://crudcrud.com/api/SEU_ID`.
2. Copie só o ID e cole no `js/config.js`, no lugar de `COLE_SEU_ID_AQUI`.
3. Abra o `index.html` no navegador. Não precisa de servidor.

O plano gratuito do CrudCrud dura 24 horas ou 100 requisições, o que acabar primeiro. Depois disso as telas avisam que não conseguiram acessar o serviço, e o jeito é gerar outro ID e trocar no `config.js`. O consumo aparece em `https://crudcrud.com/Dashboard/SEU_ID`.
