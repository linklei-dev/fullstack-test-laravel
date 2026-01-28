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
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(5, min(50, $perPage ?: 15));

        $posts = Post::with('imagens')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return PostResource::collection($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'autor' => 'required|string|max:60',
            'categoria' => ['required', Rule::in(['post', 'artigo', 'grupo'])],
            'publicacao' => 'required|string',
            'imagem' => 'nullable|string',
        ]);

        DB::beginTransaction();
        
        try {
            $post = Post::create([
                'autor' => $validated['autor'],
                'categoria' => $validated['categoria'],
                'publicacao' => $validated['publicacao'],
            ]);

            if ($request->has('imagem') && !empty($validated['imagem'])) {
                $imagemBase64 = $validated['imagem'];
                
                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
                }
                
                $imagemData = base64_decode($imagemBase64, true);
                
                if ($imagemData === false) {
                    throw new \Exception('Imagem em base64 inválida');
                }
                
                if (strlen($imagemData) > 10 * 1024 * 1024) {
                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
                }
                
                Imagem::create([
                    'post_id' => $post->id,
                    'imagem' => $imagemData,
                ]);
            }

            DB::commit();

            $post->load('imagens');

            return response()->json(new PostResource($post), 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'error' => 'Erro ao criar post: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Post $post): JsonResponse
    {
        $post->load('imagens');

        return response()->json(new PostResource($post), 200);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'autor' => 'sometimes|string|max:60',
            'categoria' => ['sometimes', Rule::in(['post', 'artigo', 'grupo'])],
            'publicacao' => 'sometimes|string',
            'imagem' => 'nullable|string',
        ]);

        DB::beginTransaction();
        
        try {
            $postData = array_filter([
                'autor' => $validated['autor'] ?? null,
                'categoria' => $validated['categoria'] ?? null,
                'publicacao' => $validated['publicacao'] ?? null,
            ], fn($value) => $value !== null);
            
            if (!empty($postData)) {
                $post->update($postData);
            }

            if ($request->has('imagem') && !empty($validated['imagem'])) {
                $imagemBase64 = $validated['imagem'];
                
                if (preg_match('/^data:image\/(\w+);base64,/', $imagemBase64, $matches)) {
                    $imagemBase64 = preg_replace('/^data:image\/\w+;base64,/', '', $imagemBase64);
                }
                
                $imagemData = base64_decode($imagemBase64, true);
                
                if ($imagemData === false) {
                    throw new \Exception('Imagem em base64 inválida');
                }
                
                if (strlen($imagemData) > 10 * 1024 * 1024) {
                    throw new \Exception('Imagem muito grande. Tamanho máximo: 10MB');
                }
                
                $post->imagens()->delete();
                
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

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json(null, 204);
    }
}
