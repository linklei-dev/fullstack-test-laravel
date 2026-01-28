# Documentação do Backend — Linha a Linha

Este documento explica o que cada trecho de código faz na API Laravel do projeto Feed.

---

## 1. Rotas da API — `backend/routes/api.php`

```
1| <?php
```
Abre o bloco PHP.

```
2|
3| use App\Http\Controllers\Api\PostController;
4| use Illuminate\Support\Facades\Route;
5|
```
Importa o controller de posts e a facade de rotas do Laravel.

```
6| Route::apiResource('posts', PostController::class);
7| ?>
```
Registra um recurso REST para posts. O Laravel cria automaticamente:

- `GET    /api/posts`       → `index`  (lista)
- `POST   /api/posts`       → `store`  (criar)
- `GET    /api/posts/{post}` → `show`   (ver um)
- `PUT    /api/posts/{post}` → `update` (atualizar)
- `DELETE /api/posts/{post}` → `destroy` (apagar)

O `{post}` é resolvido por “Route Model Binding”: o Laravel busca o `Post` pelo id e injeta no método.

---

## 2. Model Post — `backend/app/Models/Post.php`

```
1| <?php
2|
3| namespace App\Models;
4|
5| use Illuminate\Database\Eloquent\Factories\HasFactory;
6| use Illuminate\Database\Eloquent\Model;
7|
8| class Post extends Model
9| {
10|    use HasFactory;
```
Define a classe `Post` como Model Eloquent. `HasFactory` permite usar `Post::factory()` em testes e seeders.

```
12|    protected $fillable = [
13|        'autor',
14|        'categoria',
15|        'publicacao',
16|    ];
```
Lista os campos que podem ser preenchidos em massa (`Post::create()`, `$post->update()`). Qualquer outro atributo enviado é ignorado.

```
18|    protected $casts = [
19|        'created_at' => 'datetime',
20|        'updated_at' => 'datetime',
21|    ];
```
Converte `created_at` e `updated_at` para instâncias de `DateTime`/Carbon ao ler do banco.

```
23|    public function imagens()
24|    {
25|        return $this->hasMany(Imagem::class);
26|    }
26| }
```
Relacionamento “um post tem muitas imagens”. Usado em `Post::with('imagens')` e `$post->imagens`.

---

## 3. Model Imagem — `backend/app/Models/Imagem.php`

```
1| <?php
2|
3| namespace App\Models;
4|
5| use Illuminate\Database\Eloquent\Factories\HasFactory;
6| use Illuminate\Database\Eloquent\Model;
7|
8| class Imagem extends Model
9| {
10|    use HasFactory;
11|
12|    protected $table = 'imagens';
```
Nome da tabela no banco (por padrão seria `imagems`).

```
14|    protected $fillable = [
15|        'imagem',
16|        'post_id',
17|    ];
```
Campos permitidos em atribuição em massa.

```
19|    protected $hidden = [
20|        'imagem',
21|    ];
```
O atributo `imagem` (blob binário) não entra no array/JSON ao serializar o model. Só usamos a versão em base64.

```
23|    public function post()
24|    {
25|        return $this->belongsTo(Post::class);
26|    }
```
Relacionamento “uma imagem pertence a um post”.

```
28|    public function getImagemBase64Attribute()
29|    {
30|        if ($this->imagem) {
31|            return 'data:image/jpeg;base64,' . base64_encode($this->imagem);
32|        }
33|        return null;
34|    }
```
Accessor: ao acessar `$imagem->imagem_base64`, devolve o blob codificado em base64 com prefixo de data URI para uso em HTML/API.

```
36|    protected $appends = ['imagem_base64'];
37| }
```
Inclui `imagem_base64` sempre que o model for convertido para array/JSON, mesmo com `imagem` em `$hidden`.

---

## 4. PostResource — `backend/app/Http/Resources/PostResource.php`

```
1| <?php
2|
3| namespace App\Http\Resources;
4|
5| use Illuminate\Http\Resources\Json\JsonResource;
6|
7| class PostResource extends JsonResource
8| {
9|    public function toArray($request)
10|    {
```
Método que define como o post vira array/JSON na resposta da API.

```
11|        $imagem = null;
12|        if ($this->imagens && $this->imagens->count() > 0) {
13|            $primeiraImagem = $this->imagens->first();
14|            $imagem = $primeiraImagem->imagem_base64 ?? null;
15|        }
```
Se o post tiver imagens relacionadas carregadas, pega a primeira e usa o accessor `imagem_base64`. Senão, `$imagem` fica `null`.

```
17|        return [
18|            'id' => $this->id,
19|            'autor' => $this->autor,
20|            'categoria' => $this->categoria,
21|            'publicacao' => $this->publicacao,
22|            'imagem' => $imagem,
23|            'created_at' => $this->created_at?->toISOString(),
24|            'updated_at' => $this->updated_at?->toISOString(),
25|        ];
26|    }
27| }
```
Monta o objeto JSON do post. Datas em ISO 8601; imagem como string base64 ou `null`. O `?->` evita erro se `created_at`/`updated_at` forem nulos.

---

## 5. PostController — `backend/app/Http/Controllers/Api/PostController.php`

### Cabeçalho e imports

```
1| <?php
2|
3| namespace App\Http\Controllers\Api;
4|
5| use App\Http\Controllers\Controller;
6| use App\Http\Resources\PostResource;
7| use App\Models\Post;
8| use App\Models\Imagem;
9| use Illuminate\Http\Request;
10| use Illuminate\Http\JsonResponse;
11| use Illuminate\Validation\Rule;
12| use Illuminate\Support\Facades\DB;
13|
14| class PostController extends Controller
15| {
```
Namespace do controller de API, imports dos models, resource, Request, validação e DB para transações.

---

### index — Listar posts (paginado)

```
16|    public function index(Request $request)
17|    {
18|        $perPage = (int) $request->input('per_page', 15);
19|        $perPage = max(5, min(50, $perPage ?: 15));
```
Lê `per_page` da query string (padrão 15), garante valor entre 5 e 50 para não sobrecarregar a API.

```
21|        $posts = Post::with('imagens')
22|            ->orderBy('created_at', 'desc')
23|            ->paginate($perPage);
24|
25|        return PostResource::collection($posts);
26|    }
```
Busca posts com relação `imagens` carregada, ordena do mais recente ao mais antigo, pagina e devolve via `PostResource::collection()` (formato compatível com paginação Laravel).

---

### store — Criar post

```
28|    public function store(Request $request): JsonResponse
29|    {
30|        $validated = $request->validate([
31|            'autor' => 'required|string|max:60',
32|            'categoria' => ['required', Rule::in(['post', 'artigo', 'grupo'])],
33|            'publicacao' => 'required|string',
34|            'imagem' => 'nullable|string',
35|        ]);
```
Valida o body da requisição: autor obrigatório (string, máx. 60), categoria obrigatória e um dos três valores, publicação obrigatória, imagem opcional (string, ex. base64).

```
37|        DB::beginTransaction();
38|
39|        try {
40|            $post = Post::create([
41|                'autor' => $validated['autor'],
42|                'categoria' => $validated['categoria'],
43|                'publicacao' => $validated['publicacao'],
44|            ]);
```
Inicia transação e cria o registro do post na tabela `posts`.

```
46|            if ($request->has('imagem') && !empty($validated['imagem'])) {
47|                $imagemBase64 = $validated['imagem'];
48|
49|                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
50|                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
51|                }
```
Se vier imagem, pega a string. Se tiver o prefixo `data:image/...;base64,`, remove esse prefixo e mantém só o base64.

```
53|                $imagemData = base64_decode($imagemBase64, true);
54|
55|                if ($imagemData === false) {
56|                    throw new \Exception('Imagem em base64 inválida');
57|                }
58|
59|                if (strlen($imagemData) > 10 * 1024 * 1024) {
60|                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
61|                }
```
Decodifica base64 para binário. Se falhar ou passar de 10MB, lança exceção.

```
63|                Imagem::create([
64|                    'post_id' => $post->id,
65|                    'imagem' => $imagemData,
66|                ]);
67|            }
```
Cria o registro na tabela `imagens` ligado ao post pelo `post_id`, armazenando o binário.

```
69|            DB::commit();
70|
71|            $post->load('imagens');
72|
73|            return response()->json(new PostResource($post), 201);
74|
75|        } catch (\Exception $e) {
76|            DB::rollBack();
77|
78|            return response()->json([
79|                'error' => 'Erro ao criar post: ' . $e->getMessage()
80|            ], 500);
81|        }
82|    }
```
Confirma a transação, recarrega o post com `imagens`, responde 201 e o JSON do post. Em erro, faz rollback e devolve 500 com a mensagem da exceção.

---

### show — Ver um post

```
84|    public function show(Post $post): JsonResponse
85|    {
86|        $post->load('imagens');
87|
88|        return response()->json(new PostResource($post), 200);
89|    }
```
O `$post` já vem preenchido pelo Route Model Binding. Só garante que `imagens` está carregado e devolve o post em JSON (200).

---

### update — Atualizar post

```
91|    public function update(Request $request, Post $post): JsonResponse
92|    {
93|        $validated = $request->validate([
94|            'autor' => 'sometimes|string|max:60',
95|            'categoria' => ['sometimes', Rule::in(['post', 'artigo', 'grupo'])],
96|            'publicacao' => 'sometimes|string',
97|            'imagem' => 'nullable|string',
98|        ]);
```
Valida apenas os campos enviados (`sometimes`). Todos opcionais; imagem continua opcional e em string.

```
100|        DB::beginTransaction();
101|
102|        try {
103|            $postData = array_filter([
104|                'autor' => $validated['autor'] ?? null,
105|                'categoria' => $validated['categoria'] ?? null,
106|                'publicacao' => $validated['publicacao'] ?? null,
107|            ], fn($value) => $value !== null);
108|
109|            if (!empty($postData)) {
110|                $post->update($postData);
111|            }
```
Monta um array só com os campos que vieram na requisição (não nulos) e atualiza o post na tabela `posts` se houver algo.

```
113|            if ($request->has('imagem') && !empty($validated['imagem'])) {
114|                $imagemBase64 = $validated['imagem'];
115|
116|                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
117|                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
118|                }
119|
120|                $imagemData = base64_decode($imagemBase64, true);
121|
122|                if ($imagemData === false) {
123|                    throw new \Exception('Imagem em base64 inválida');
124|                }
125|
126|                if (strlen($imagemData) > 10 * 1024 * 1024) {
127|                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
128|                }
129|
130|                $post->imagens()->delete();
131|
132|                Imagem::create([
133|                    'post_id' => $post->id,
134|                    'imagem' => $imagemData,
135|                ]);
136|            }
```
Se vier nova imagem: remove prefixo data URI, decodifica, valida tamanho, apaga imagens antigas do post e cria uma nova em `imagens`.

```
138|            DB::commit();
139|            $post->load('imagens');
140|
141|            return response()->json(new PostResource($post), 200);
143|        } catch (\Exception $e) {
144|            DB::rollBack();
145|
146|            return response()->json([
147|                'error' => 'Erro ao atualizar post: ' . $e->getMessage()
148|            ], 500);
149|        }
150|    }
```
Commit, recarrega `imagens`, responde 200 com o post. Em erro, rollback e 500.

---

### destroy — Deletar post

```
152|    public function destroy(Post $post): JsonResponse
153|    {
154|        $post->delete();
155|
156|        return response()->json(null, 204);
157|    }
158| }
```
Remove o post (o banco apaga as imagens em cascata pela FK). Resposta 204 sem corpo.

---

**Resumo:** O backend expõe uma API REST em `/api/posts` para listar (paginado), criar, ver, atualizar e deletar posts, com imagens em base64 armazenadas como blob na tabela `imagens` e expostas em JSON via `PostResource`.
