<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Imagem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $posts = Post::with('imagens')->orderBy('created_at', 'desc')->get();
        
        return response()->json(PostResource::collection($posts), 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'autor' => 'required|string|max:60',
            'categoria' => ['required', Rule::in(['post', 'artigo', 'grupo'])],
            'publicacao' => 'required|string',
            'imagem' => 'nullable|string', // Base64 string
        ]);

        DB::beginTransaction();
        
        try {
            // Criar o post
            $post = Post::create([
                'autor' => $validated['autor'],
                'categoria' => $validated['categoria'],
                'publicacao' => $validated['publicacao'],
            ]);

            // Se houver imagem em base64, processar e salvar
            if ($request->has('imagem') && !empty($validated['imagem'])) {
                $imagemBase64 = $validated['imagem'];
                
                // Remover o prefixo data:image/...;base64, se existir
                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
                }
                
                // Decodificar base64 para binário
                $imagemData = base64_decode($imagemBase64, true);
                
                if ($imagemData === false) {
                    throw new \Exception('Imagem em base64 inválida');
                }
                
                // Verificar tamanho (máximo 10MB)
                if (strlen($imagemData) > 10 * 1024 * 1024) {
                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
                }
                
                Imagem::create([
                    'post_id' => $post->id,
                    'imagem' => $imagemData,
                ]);
            }

            DB::commit();

            // Carregar o post com a imagem
            $post->load('imagens');

            return response()->json(new PostResource($post), 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Erro ao criar post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Post $post): JsonResponse
    {
        $post->load('imagens');

        return response()->json(new PostResource($post), 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'autor' => 'sometimes|string|max:60',
            'categoria' => ['sometimes', Rule::in(['post', 'artigo', 'grupo'])],
            'publicacao' => 'sometimes|string',
            'imagem' => 'nullable|string', // Base64 string
        ]);

        DB::beginTransaction();
        
        try {
            // Atualizar campos do post
            $postData = array_filter([
                'autor' => $validated['autor'] ?? null,
                'categoria' => $validated['categoria'] ?? null,
                'publicacao' => $validated['publicacao'] ?? null,
            ], fn($value) => $value !== null);
            
            if (!empty($postData)) {
                $post->update($postData);
            }

            // Se houver nova imagem, atualizar ou criar
            if ($request->has('imagem') && !empty($validated['imagem'])) {
                $imagemBase64 = $validated['imagem'];
                
                // Remover o prefixo data:image/...;base64, se existir
                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
                }
                
                // Decodificar base64 para binário
                $imagemData = base64_decode($imagemBase64, true);
                
                if ($imagemData === false) {
                    throw new \Exception('Imagem em base64 inválida');
                }
                
                // Verificar tamanho (máximo 10MB)
                if (strlen($imagemData) > 10 * 1024 * 1024) {
                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
                }
                
                // Deletar imagem antiga se existir
                $post->imagens()->delete();
                
                // Criar nova imagem
                Imagem::create([
                    'post_id' => $post->id,
                    'imagem' => $imagemData,
                ]);
            }

            DB::commit();
            $post->load('imagens');

            return response()->json(new PostResource($post), 200);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Erro ao atualizar post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Post  $post
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json(null, 204);
    }
}
