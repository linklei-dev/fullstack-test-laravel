<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        // Obter a primeira imagem em base64, se existir
        $imagem = null;
        if ($this->imagens && $this->imagens->count() > 0) {
            $primeiraImagem = $this->imagens->first();
            $imagem = $primeiraImagem->imagem_base64 ?? null;
        }

        return [
            'id' => $this->id,
            'autor' => $this->autor,
            'categoria' => $this->categoria,
            'publicacao' => $this->publicacao,
            'imagem' => $imagem,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
