<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Imagem extends Model
{
    use HasFactory;

    protected $table = 'imagens';

    protected $fillable = [
        'imagem',
        'post_id',
    ];

    protected $hidden = [
        'imagem',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getImagemBase64Attribute()
    {
        if ($this->imagem) {
            return 'data:image/jpeg;base64,' . base64_encode($this->imagem);
        }
        return null;
    }

    protected $appends = ['imagem_base64'];
}
