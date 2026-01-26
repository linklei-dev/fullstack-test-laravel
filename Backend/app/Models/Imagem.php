<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imagem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'imagens';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'imagem',
        'post_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'imagem', // Ocultar o binário, mostrar apenas base64
    ];

    /**
     * Get the post that owns the image.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the image as base64 string.
     *
     * @return string|null
     */
    public function getImagemBase64Attribute()
    {
        if ($this->imagem) {
            return 'data:image/jpeg;base64,' . base64_encode($this->imagem);
        }
        return null;
    }

    /**
     * Append the base64 image to the array representation.
     *
     * @var array
     */
    protected $appends = ['imagem_base64'];
}
