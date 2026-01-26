<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        
        return response()->json([
            'success' => true,
            'data' => $posts
        ], 200);
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
            'imagem' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // max 10MB
        ]);

        DB::beginTransaction();
        
        try {
            // Criar o post
            $post = Post::create([
                'autor' => $validated['autor'],
                'categoria' => $validated['categoria'],
                'publicacao' => $validated['publicacao'],
            ]);

            // Se houver imagem, salvar na tabela imagens
            if ($request->hasFile('imagem')) {
                $imagemFile = $request->file('imagem');
                $imagemData = file_get_contents($imagemFile->getRealPath());
                
                Imagem::create([
                    'post_id' => $post->id,
                    'imagem' => $imagemData,
                ]);
            }

            DB::commit();

            // Carregar o post com a imagem
            $post->load('imagens');

            return response()->json([
                'success' => true,
                'message' => 'Post criado com sucesso!',
                'data' => $post
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar post: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $post = Post::with('imagens')->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id): JsonResponse
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post não encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'autor' => 'sometimes|string|max:60',
            'categoria' => ['sometimes', Rule::in(['post', 'artigo', 'grupo'])],
            'publicacao' => 'sometimes|string',
        ]);

        $post->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Post atualizado com sucesso!',
            'data' => $post
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post não encontrado'
            ], 404);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deletado com sucesso!'
        ], 200);
    }
}
