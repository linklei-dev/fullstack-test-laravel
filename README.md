# Feed — Rede Social (Fullstack)

Feed simples de rede social com **backend Laravel** (API JSON) e **frontend React** (Vite). Permite criar, listar, editar e excluir posts com autor, categoria, texto e imagem.

---

## Especificações do Projeto

### Stack

| Camada   | Tecnologia                         |
|----------|------------------------------------|
| Back-end | PHP 8.2+, Laravel 12, MySQL 5.6+  |
| Front-end| React 19, Vite 7                  |
| API      | JSON (REST minimalista)           |

### Estrutura do Repositório

```
fullstack-test-laravel/
├── backend/           # Laravel (API)
├── frontend/          # React + Vite
├── graphics/          # Ícones e imagens de referência
├── database_dump.sql  # Dump do banco (schema)
├── docker-compose.yaml
└── README.md
```

### Funcionalidades

- **Criar post:** modal com autor, categoria (Post/Artigo/Grupo), publicação e imagem (opcional).
- **Feed:** posts em ordem decrescente (mais recente primeiro), avatar padrão, texto limitado a 500 caracteres com “Leia mais…”.
- **Rolagem infinita:** carregamento de mais posts ao chegar ao fim da página.
- **Editar post:** mesma modal de criação, preenchida com os dados do post.
- **Deletar post:** menu dropdown (três pontinhos) no canto superior direito do card, com confirmação antes de excluir.
- **Layout responsivo** e fonte Lato.

---

## Requisitos para Executar Localmente

- **PHP** 8.2 ou superior  
- **Composer**  
- **MySQL** 5.6+ (ou MariaDB equivalente)  
- **Node.js** 18+ e **npm** (ou yarn/pnpm)  
- **Git**

---

## Como Rodar o Projeto Localmente

### 1. Banco de dados

1. Crie um banco MySQL (ex.: `feed_db`).
2. Importe o dump que está na raiz do projeto:

```bash
mysql -u root -p feed_db < database_dump.sql
```

Ou use o phpMyAdmin / outro cliente: abra `database_dump.sql` e execute o SQL no banco desejado.

O dump contém o schema das tabelas `posts` e `imagens`.

### 2. Back-end (Laravel)

```bash
cd backend
cp .env.example .env
php artisan key:generate
```

Edite o `.env` e configure o banco:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=feed_db
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

Se você importou o `database_dump.sql`, as tabelas já existem. Caso prefira usar apenas as migrations:

```bash
php artisan migrate
```

Depois:

```bash
composer install
php artisan serve
```

A API ficará em **http://localhost:8000**.  
Endpoints principais: `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/{id}`.

### 3. Front-end (React)

O front chama a API em `http://localhost:8000/api`. Se o backend estiver em outra URL ou porta, altere em `frontend/src/services/api.js`:

```js
const API_BASE_URL = 'http://localhost:8000/api';
```

Na pasta do frontend:

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## Como Rodar com Docker

Na raiz do projeto:

```bash
docker-compose up -d
```

- **Backend:** http://localhost:8000  
- **Frontend:** http://localhost:5173  

O `docker-compose.yaml` sobe apenas os serviços da aplicação (Laravel e React). O **MySQL** não está incluído; é necessário ter o banco rodando na máquina (ou em outro container) e configurar o `.env` do backend com o host/porta do MySQL acessível pelo container (ex.: `DB_HOST=host.docker.internal` se o MySQL estiver na máquina local).

---

## Dump do Banco

O arquivo **`database_dump.sql`** na raiz contém o schema das tabelas:

- **posts:** `id`, `autor`, `categoria`, `publicacao`, `created_at`, `updated_at`
- **imagens:** `id`, `imagem` (MEDIUMBLOB), `post_id`, `created_at`, `updated_at`

Para um dump completo (com dados), exporte do seu ambiente com:

```bash
mysqldump -u root -p feed_db > database_dump.sql
```

e substitua o arquivo na raiz, se quiser versionar dados de exemplo.

---

## API (resumo)

Base URL: `http://localhost:8000/api`

| Método | Endpoint           | Descrição                    |
|--------|--------------------|------------------------------|
| GET    | /posts             | Lista posts (paginado)        |
| POST   | /posts             | Cria post (JSON)              |
| GET    | /posts/{id}        | Retorna um post               |
| PUT    | /posts/{id}        | Atualiza post                 |
| DELETE | /posts/{id}        | Remove post                   |

Exemplo de payload para criar/atualizar post:

```json
{
  "autor": "Nome do Autor",
  "categoria": "post",
  "publicacao": "Texto da publicação.",
  "imagem": "data:image/jpeg;base64,..."
}
```

Categorias permitidas: `post`, `artigo`, `grupo`.

---

## Licença

MIT.
