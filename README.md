# Instruções para desenvolvimento do teste Full-stack LinkLei.

- O prazo de entrega do teste é de até 7 dias, a partir do momento que acordarmos o início do desenvolvimento mediante contato.
- O mais importante é desenvolver todos os requisitos listados aqui. Você também pode desenvolver funcionalidades adicionais para agregar valor ao seu teste.


## Requisitos Gerais:

- Leia todo este arquivo README.md para entender o teste;
- Inície um novo repositório público em sua conta no github;
- Para o back-end utilize:
  - [PHP 7.2+](http://php.net/);
  - [MySQL 5.6+](https://www.mysql.com/);
  - Framework [Laravel](https://laravel.com/), [versão 8](https://laravel.com/docs/8.x);
- Para o front-end utilize:
  - [React JS v17+](https://pt-br.reactjs.org/);
- Você pode desenvolver o front-end integrado ao Laravel, através dos seguintes recursos:
  - [Compilação JS do Laravel](https://laravel.com/docs/8.x/mix#react) (recomendado)
  - OU
  - [Create React App](https://pt-br.reactjs.org/docs/create-a-new-react-app.html#create-react-app);
  - Lembre apenas de manter as duas aplicações no mesmo repositório para facilitar análise do teste;
- Realize as comunicações entre Front e Back desenvolvendo uma API JSON minimalista dentro do Laravel;
- Não há necessidade de desenvolver recursos de Autenticação, Login, ou quaisquer sistemas de segurança;
- **O objetivo principal é desenvolver um feed simples de rede social;**
- Após finalizar, publique no repositório do seu projeto um arquivo completo com o SQL do seu banco utilizado (dump do banco);
- Não é necessário publicar o projeto em algum servidor.
- Se preferir, pode criar um ambiente em docker para rodar a aplicação e o banco de dados, será um diferencial em sua avaliação;
- Insira no seu `README.md` todas as instruções / documentação necessária para executarmos localmente seu projeto para avaliação;
- Você pode basear o visual da sua aplicação no visual do Feed do [LinkLei](https://linklei.com.br/), basta cadastrar-se no sistema, efetuar login e navegar.
- Desenvolva o front-end o mais próximo possível das imagens de modelo em anexo disponibilizadas aqui.
- Ao finalizar o teste responda à mesma conversa de email onde enviamos o link do desafio. Inclua na sua resposta o link do seu repositório no github.
- Todos os recursos gráficos como imagens e ícones, estão disponíveis no diretório [graphics](https://github.com/linklei-dev/fullstack-test-laravel/tree/main/graphics);
- Utilize o padrão de fonte 'Lato', como no exemplo abaixo:
```css
font-family: Lato,'Source Sans Pro';
```

## Requisitos funcionais da aplicação:


## Criar post
- O botão **Criar Post** deve abrir a modal para cadastro de post.<br>
![Modal Criar Post](https://github.com/linklei-dev/fullstack-test-laravel/blob/main/graphics/modal_create_post.png?raw=true)

### Dentro da Modal:
  - campo **autor do post**: preenchimento obrigatório, campo tipo texto, deve receber o nome do usuário que está publicando.
  - campo **Selecione a categoria**: obrigatório, deve ser do tipo select, permitindo selecionar uma das categorias disponíveis, sendo elas:
    - Post
    - Artigo
    - Grupo
  - Campo **Escrever publicação**: obrigatório, deve ser do tipo textarea, permitindo multiplas linhas de texto. Utilize um componente que faça o campo crescer verticalmente quando acrescentadas mais linhas de texto. 
  - Botão **imagem**: preenchimento opcional, deve permitir inserir uma imagem no post. Deve aceitar somente imagens no formato jpg ou png.
  - Botão **publicar** envia todo o conteúdo da criação do post para a API, salvando a categoria, texto e imagem na respectiva tabela do post.
  - Após enviar o conteúdo do post, a modal deve ser fechada automaticamente.
  - Realize as validações necessárias, exibindo mensagens de erro quando algum campo não estiver preenchido ou for inválido. Use sua sabedoria para decidir como, onde e quando exibir estas mensagens de erro/validações.
  - Não há necessidade e validar o tamanho da imagem quando enviada.

  ### Navegação no feed.
  - O front-end do feed deve estar de acordo com o modelo abaixo;
  ![template_feed](https://github.com/linklei-dev/fullstack-test-laravel/blob/main/graphics/template_feed.png?raw=true)

  - O feed deve exibir todos os posts criados, em ordem Decrescente (primeiro o post mais recente).
  - A imagem do usuário deve ser o [avatar_default](https://github.com/linklei-dev/fullstack-test-laravel/blob/main/graphics/avatar_default.png?raw=true);
  - Limite a exibição do texto do post para no máximo 500 caracteres, caso exceda este limite, exiba o link "Leia mais..." que ao ser clicado deve expandir a caixa e exibir por inteiro o texto do post. Caso o limite não seja excedido, não exibir o "Leia mais...".
  - Utilize recursos de rolagem infinita, para carregar mais posts quando a rolagem do usuário chegar no fim da página.
  - Siga as boas práticas de desenvolvimento React, procure utilizar componentes disponíveis em comunidades open source (como npm), repositórios no github, etc.
  - Demais instruções na imagem:
  ![Feed Details](https://github.com/linklei-dev/fullstack-test-laravel/blob/main/graphics/feed_detail.png?raw=true)
  - Cria recursos para **Deletar** e **Editar** o post.
    - Editar: exiba o conteúdo do post na mesma modal utilizada na ação de Criar;
    - Deletar: solicite uma confirmação de deleção ao usuário antes de remover o post;
  ![Edit Delete Post](https://github.com/linklei-dev/fullstack-test-laravel/blob/main/graphics/edit_delete_post.png?raw=true)
