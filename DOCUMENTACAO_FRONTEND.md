# Documentação do Frontend — Linha a Linha

Este documento explica o que cada trecho de código faz na aplicação React do projeto Feed.

---

## 1. Ponto de entrada — `frontend/src/main.jsx`

```
1| import { StrictMode } from 'react'
2| import { createRoot } from 'react-dom/client'
3| import './index.css'
4| import App from './App.jsx'
5|
6| createRoot(document.getElementById('root')).render(
7|   <StrictMode>
8|     <App />
9|   </StrictMode>,
10| )
```

- **1:** Importa `StrictMode`, que ajuda a detectar práticas inseguras no React em desenvolvimento.
- **2:** Importa `createRoot` da API moderna de renderização do React 18+.
- **3:** Importa os estilos globais (`index.css`), aplicados em toda a aplicação.
- **4:** Importa o componente raiz `App`.
- **6:** Cria a “root” do React no elemento do DOM com id `root` (definido no `index.html`).
- **7–9:** Renderiza `App` dentro de `StrictMode`. Tudo que aparece na tela vem de `App` e seus filhos.

---

## 2. Serviço de API — `frontend/src/services/api.js`

```
1| const API_BASE_URL = 'http://localhost:8000/api';
```
URL base da API Laravel. Todas as chamadas usam esse prefixo.

```
2|
3| export const api = {
4|   getPosts: async (page = 1, perPage = 15) => {
5|     const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
6|     const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
7|       method: 'GET',
8|       headers: {
9|         'Accept': 'application/json',
10|      },
11|    });
12|
13|    if (!response.ok) {
14|      throw new Error('Erro ao buscar posts');
15|    }
16|
17|    return response.json();
18|  },
```
- **4–5:** Função assíncrona que lista posts. `page` e `per_page` viram query string (`?page=1&per_page=15`).
- **6–11:** `fetch` em GET para `/api/posts`, pedindo JSON no header `Accept`.
- **13–15:** Se o status não for 2xx, lança erro (para o `catch` no componente tratar).
- **17:** Devolve o corpo da resposta já como objeto JavaScript (JSON parseado).

```
20|   createPost: async (postData) => {
21|     const response = await fetch(`${API_BASE_URL}/posts`, {
22|       method: 'POST',
23|       headers: {
24|         'Accept': 'application/json',
25|         'Content-Type': 'application/json',
26|      },
27|      body: JSON.stringify(postData),
28|    });
29|
30|    if (!response.ok) {
31|      const error = await response.json();
32|      throw new Error(error.message || 'Erro ao criar post');
33|    }
34|
35|    return response.json();
36|  },
```
- **20–28:** POST para `/api/posts` com corpo JSON (`autor`, `categoria`, `publicacao`, `imagem`).
- **30–33:** Em erro, tenta ler `error.message` do JSON da resposta e lança com essa mensagem.
- **35:** Retorna o post criado (objeto).

```
38|   updatePost: async (postId, postData) => {
39|     const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
40|       method: 'PUT',
41|       headers: {
42|         'Accept': 'application/json',
43|         'Content-Type': 'application/json',
44|      },
45|      body: JSON.stringify(postData),
46|    });
47|
48|    if (!response.ok) {
49|      const error = await response.json();
50|      throw new Error(error.message || 'Erro ao atualizar post');
51|    }
52|
53|    return response.json();
54|  },
```
- **38–46:** PUT em `/api/posts/{id}` para atualizar um post. Mesmo formato de headers e body do create.
- **48–53:** Tratamento de erro e retorno do post atualizado.

```
56|   deletePost: async (postId) => {
57|     const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
58|       method: 'DELETE',
59|       headers: {
60|         'Accept': 'application/json',
61|      },
62|    });
63|
64|    if (!response.ok) {
65|      const error = await response.json();
66|      throw new Error(error.message || 'Erro ao deletar post');
67|    }
68|
69|    return response.ok;
70|  },
71| };
```
- **56–62:** DELETE em `/api/posts/{id}`. Não envia body.
- **64–67:** Em erro, lê mensagem do JSON e lança.
- **69:** Retorna `true` quando o status é 2xx (sucesso).

O objeto `api` é importado nos componentes para todas as operações de rede com o backend.

---

## 3. Componente raiz — `frontend/src/App.jsx`

### Imports e definição do componente

```
1| import { useState } from 'react';
2| import CreatePostModal from './components/CreatePostModal';
3| import Feed from './components/Feed';
4| import { api } from './services/api';
5| import './App.css';
6|
7| function App() {
```
- **1:** `useState` para manter estado local (modal, post em edição, dados otimistas, etc.).
- **2–3:** Componentes da modal de criar/editar e do feed de posts.
- **4:** Serviço de chamadas à API.
- **5:** Estilos do `App` (layout, header, botão Criar Post).
- **7:** Declaração do componente raiz `App`.

---

### Estado

```
8|   const [isModalOpen, setIsModalOpen] = useState(false);
9|   const [editingPost, setEditingPost] = useState(null);
10|   const [prependPost, setPrependPost] = useState(null);
11|   const [updatedPost, setUpdatedPost] = useState(null);
12|   const [optimisticPost, setOptimisticPost] = useState(null);
13|   const [optimisticUpdatedPost, setOptimisticUpdatedPost] = useState(null);
14|   const [revertPost, setRevertPost] = useState(null);
```
- **8:** `isModalOpen` — controla se a modal Criar/Editar está aberta ou fechada.
- **9:** `editingPost` — post escolhido para edição; `null` quando é “criar novo”.
- **10:** `prependPost` — post retornado pela API após criar; o Feed usa para substituir o post otimista e colocar no topo.
- **11:** `updatedPost` — post retornado pela API após editar; o Feed substitui o otimista por esse.
- **12:** `optimisticPost` — post “temporário” exibido no topo do feed assim que o usuário publica, antes da resposta da API (criação otimista).
- **13:** `optimisticUpdatedPost` — versão otimista do post em edição, exibida no feed até a API responder.
- **14:** `revertPost` — post original usado para reverter o feed quando a edição falha na API.

---

### handleSubmitPost — Criar ou editar post

```
16|   const handleSubmitPost = async (postData) => {
17|     const isEdit = postData.id && !String(postData.id).startsWith('temp-');
18|     if (isEdit) {
```
- **16:** Função chamada quando o usuário submete o formulário na modal (criar ou editar).
- **17:** Considera “edição” se existir `id` e não for um id temporário (`temp-...`).
- **18:** Bloco de edição.

```
19|       const originalPost = editingPost;
20|       handleCloseModal();
21|       setOptimisticUpdatedPost({
22|         ...postData,
23|         id: originalPost.id,
24|         created_at: originalPost.created_at,
25|         updated_at: new Date().toISOString(),
26|      });
27|      try {
28|        const res = await api.updatePost(postData.id, {
29|          autor: postData.autor,
30|          categoria: postData.categoria,
31|          publicacao: postData.publicacao,
32|          imagem: postData.imagem,
33|        });
34|        const post = res?.data ?? res;
35|        if (post) setUpdatedPost(post);
36|      } catch (e) {
37|        setRevertPost(originalPost);
38|        setOptimisticUpdatedPost(null);
39|        alert('Erro ao atualizar post. Tente novamente.');
40|      }
41|      return;
42|    }
```
- **19:** Guarda o post original para possível rollback.
- **20:** Fecha a modal na hora (UX de edição otimista).
- **21–26:** Atualiza o feed com a versão otimista (dados do formulário + `id` e `created_at` do original).
- **28–33:** Chama a API de update com os campos do formulário.
- **34–35:** Pega o post devolvido (Laravel pode vir em `data` ou na raiz) e seta `updatedPost` para o Feed trocar o otimista pelo real.
- **36–40:** Em erro, manda o post original em `revertPost` para o Feed voltar atrás e limpa o otimista; mostra alerta.
- **41–42:** Encerra; não executa o fluxo de “criar”.

```
43|     handleCloseModal();
44|     const tempPost = {
45|       ...postData,
46|       id: 'temp-' + Date.now(),
47|       created_at: new Date().toISOString(),
48|    };
49|     setOptimisticPost(tempPost);
50|     try {
51|       const created = await api.createPost(postData);
52|       const post = created?.data ?? created;
53|       if (post) setPrependPost(post);
54|     } catch (e) {
55|       setOptimisticPost(null);
56|       alert('Erro ao criar post. Tente novamente.');
57|     }
58|   };
```
- **43:** Fecha a modal ao criar também.
- **44–48:** Monta um “post temporário” com id `temp-...` e data atual, para exibir no topo do feed antes da API responder.
- **49:** O Feed usa `optimisticPost` para mostrar esse post no topo (criação otimista).
- **51–53:** Chama a API de create; ao receber o post real, seta `prependPost` para o Feed substituir o temporário e corrigir o id/data.
- **54–57:** Em erro, remove o post otimista e mostra alerta.

---

### handleCloseModal e handleOpenCreate

```
60|   const handleCloseModal = () => {
61|     setIsModalOpen(false);
62|     setEditingPost(null);
63|   };
64|
65|   const handleOpenCreate = () => {
66|     setEditingPost(null);
67|     setIsModalOpen(true);
68|   };
```
- **60–63:** Fechar a modal e limpar o post em edição.
- **65–68:** Abrir a modal em modo “criar”: sem post em edição e modal aberta.

---

### JSX — Layout e uso do Feed

```
70|   return (
71|     <div className="app-container">
72|       <header className="app-header">
73|         <div className="app-header-inner">
74|           <button
75|             className="btn-create-post"
76|             onClick={handleOpenCreate}
77|             type="button"
78|           >
79|             <svg ... className="btn-icon">
80|               ...
81|             </svg>
82|             <span>Criar Post</span>
83|           </button>
84|         </div>
85|       </header>
```
- **71:** Container principal da aplicação (estilo em `App.css`).
- **72–85:** Cabeçalho com botão “Criar Post” que chama `handleOpenCreate` (abre a modal em modo criar).

```
87|       <main className="app-main">
88|         <div className="feed-wrapper">
89|           <Feed
90|             onPostUpdate={(post) => { setEditingPost(post); setIsModalOpen(true); }}
91|             prependPost={prependPost}
92|             onPrependConsumed={() => { setPrependPost(null); setOptimisticPost(null); }}
93|             updatedPost={updatedPost}
94|             onUpdatedConsumed={() => { setUpdatedPost(null); setOptimisticUpdatedPost(null); }}
95|             optimisticPost={optimisticPost}
96|             onClearOptimistic={() => setOptimisticPost(null)}
97|             optimisticUpdatedPost={optimisticUpdatedPost}
98|             revertPost={revertPost}
99|             onRevertConsumed={() => setRevertPost(null)}
100|           />
101|         </div>
102|       </main>
```
- **87–88:** Área principal e wrapper do feed.
- **90:** `onPostUpdate` — quando o usuário clica em “Editar” em um post, o Feed chama isso com o post; o App seta `editingPost` e abre a modal.
- **91:** `prependPost` — post real criado pela API; o Feed usa para substituir o otimista e dar scroll/posição correta.
- **92:** `onPrependConsumed` — chamado quando o Feed já aplicou o `prependPost`; o App limpa `prependPost` e `optimisticPost`.
- **94:** `onUpdatedConsumed` — chamado quando o Feed já aplicou o `updatedPost`; o App limpa `updatedPost` e `optimisticUpdatedPost`.
- **96:** `onClearOptimistic` — para remover o post otimista de criação (ex.: em erro ou cancelamento).
- **98–99:** `revertPost` e `onRevertConsumed` — usados para reverter a edição no feed quando a API de update falha.

```
104|       <CreatePostModal
105|         isOpen={isModalOpen}
106|         onClose={handleCloseModal}
107|         onSubmit={handleSubmitPost}
108|         editPost={editingPost}
109|       />
110|     </div>
111|   );
112| }
113|
114| export default App;
```
- **104–109:** Modal única que serve para criar e editar.
  - **isOpen** — controla visibilidade.
  - **onClose** — chamado ao fechar (botão X ou cancelar); no App é `handleCloseModal`.
  - **onSubmit** — chamado ao enviar o formulário; no App é `handleSubmitPost` (que decide criar ou editar pelo `postData.id`).
  - **editPost** — quando não é `null`, a modal usa esse objeto para preencher os campos e enviar como PUT; quando é `null`, é modo “criar” e envia POST.
- **114:** Exporta `App` como default para ser usado em `main.jsx`.

---

## 4. Papel dos componentes Feed e CreatePostModal

O `App` não contém a lógica de listagem nem o formulário; delega isso aos componentes:

### Feed

- **Responsabilidade:** exibir a lista de posts, rolagem infinita, estados de carregamento e erro, e ações por post.
- **O que recebe do App:**
  - `onPostUpdate(post)` — callback para abrir a modal em modo edição com o `post` clicado.
  - `prependPost`, `onPrependConsumed` — para substituir o post otimista de criação pelo post real e limpar estado.
  - `updatedPost`, `onUpdatedConsumed` — para substituir o post otimista de edição pelo post real e limpar estado.
  - `optimisticPost`, `onClearOptimistic` — post temporário de criação e callback para removê-lo.
  - `optimisticUpdatedPost`, `revertPost`, `onRevertConsumed` — edição otimista e reversão em caso de erro.
- **Comportamento esperado:** buscar posts via `api.getPosts(page, perPage)`, usar um “sentinela” no fim da lista + Intersection Observer para rolagem infinita, renderizar cada item com um componente de card (ex.: PostCard) que tenha “Editar” e “Excluir”. “Editar” chama `onPostUpdate(post)`; “Excluir” pode pedir confirmação e chamar `api.deletePost(post.id)` e atualizar a lista local.

### CreatePostModal

- **Responsabilidade:** formulário (autor, categoria, publicação, imagem), validação, envio para o backend via callback do App.
- **O que recebe do App:**
  - `isOpen` — se deve aparecer ou não.
  - `onClose` — ao fechar (X, cancelar).
  - `onSubmit(payload)` — ao dar “Publicar”; o payload tem `autor`, `categoria`, `publicacao`, `imagem` e, em edição, `id`.
  - `editPost` — quando não é `null`, preenche os campos com os dados desse post e o `onSubmit` é tratado no App como edição (PUT).
- **Comportamento esperado:** se `editPost` existe, preencher inputs; ao submeter, chamar `onSubmit` com um objeto no formato que a API espera; o App é quem chama `api.createPost` ou `api.updatePost` e quem atualiza `optimisticPost`, `updatedPost`, etc.

---

## 5. Fluxo resumido

1. **Abrir modal de criar:** botão “Criar Post” → `handleOpenCreate` → `editingPost = null`, `isModalOpen = true` → `CreatePostModal` abre em modo criar.
2. **Criar post:** usuário preenche e clica “Publicar” → modal chama `onSubmit(postData)` → `handleSubmitPost` fecha a modal, seta `optimisticPost`, chama `api.createPost`; quando a API responde, seta `prependPost`; o Feed mostra o otimista e depois troca pelo post real.
3. **Editar post:** no Feed, “Editar” em um post → `onPostUpdate(post)` → App seta `editingPost = post` e abre a modal → `CreatePostModal` usa `editPost` para preencher e, ao submeter, `handleSubmitPost` trata como edição (PUT), usa `optimisticUpdatedPost` e depois `updatedPost` ou `revertPost`.
4. **Deletar:** no Feed/PostCard, “Excluir” → confirmação → `api.deletePost(id)` → Feed remove o post da lista (estado local).

A documentação acima cobre linha a linha `main.jsx`, `api.js` e `App.jsx`, e descreve o papel de Feed e CreatePostModal no fluxo geral da aplicação.
