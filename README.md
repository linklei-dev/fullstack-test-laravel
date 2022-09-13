# Instruções para desenvolvimento do teste Full-stack LinkLei.

- O prazo de entrega do teste é de até 7 dias, a partir do momento que acordarmos o início do desenvolvimento mediante contato.
- O mais importante é você desenvolver as skills solicitadas ou passar um tempo a mais demonstrando suas habilidades do que entregar algo incompleto ou que não atenda todos os requisitos deste teste.


## Requisitos Gerais:

- Leia todo este arquivo README.md para entender o teste;
- Inície um novo repositório público em sua conta no github;
- Desenvolva uma aplicação [PHP](http://php.net/) utilizando o framework [Laravel](https://laravel.com/) na [versão 8](https://laravel.com/docs/8.x);
- Utilize PHP 7.2+ e [MySQL](https://pt.wikipedia.org/wiki/MySQL) 5.6+;
- O objetivo principal é desenvolver um feed simples de rede social;
- Após finalizar, publique no repositório do seu projeto um arquivo completo com o SQL do seu banco utilizado (dump do banco);
- Não é necessário publicar o projeto em algum servidor.
- Se preferir, pode criar um ambiente em docker para rodar a aplicação e o banco de dados, será um diferencial em sua avaliação;
- Insira no seu `README.md` todas as instruções / documentação necessária para executarmos localmente seu projeto para avaliação;
- Você pode basear o visual da sua aplicação no visual do Feed do [LinkLei](https://linklei.com.br/), basta cadastrar-se no sistema, efetuar login e navegar.
- Desenvolva o front-end o mais próximo possível das imagens de model em anexo: [Template feed](https://), [Modal Criar Post](https://).
- Ao finalizar o teste responda à mesma conversa de email onde enviamos o link do desafio. Inclua na sua resposta o link do seu repositório no github.

## Requisitos funcionais da aplicação:


## Criar post
- O botão **Criar Post** deve abrir a modal para cadastro de post.<br>
![Modal Criar Post](https://)

- Dentro da Modal:
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
  ![template_feed](https://)

  - O feed deve exibir todos os posts criados, em ordem Decrescente (primeiro o post mais recente).
  - A imagem do usuário deve ser o [avatar_default](https://);
  - 

