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

## Entidade: Cliente

| Campo                | Obrigatório | Observação                    |
|----------------------|-------------|-------------------------------|
| nome                 | sim         |                               |
| email                | sim         |                               |
| telefone             | não         | 10 ou 11 dígitos              |
| cpf                  | sim         | 11 dígitos                    |
| dataNascimento       | não         | não aceita data futura        |
| endereco.cep         | sim         | 8 dígitos                     |
| endereco.logradouro  | sim         | vem do ViaCEP                 |
| endereco.numero      | sim         |                               |
| endereco.complemento | não         |                               |
| endereco.bairro      | sim         | vem do ViaCEP                 |
| endereco.cidade      | sim         | vem do ViaCEP                 |
| endereco.uf          | sim         | vem do ViaCEP                 |

O endereço vai dentro do cliente, no objeto `endereco`.

Os campos que o ViaCEP preenche continuam editáveis. CEP geral de cidade pequena (38490-000, por exemplo) volta sem logradouro e sem bairro, e aí é preciso digitar.

O CPF só confere a quantidade de dígitos, para dar para testar com qualquer número.

## Arquivos

```
index.html       cadastro e edição
listagem.html    listagem
css/style.css
js/config.js     ID do CrudCrud e nome do recurso
js/api.js        chamadas ao ViaCEP e ao CrudCrud
js/cadastro.js   formulário
js/listagem.js   tabela
```

## Autor

Lucas Lemos Barbosa
