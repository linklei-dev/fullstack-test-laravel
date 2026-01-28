<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateImagensTable extends Migration
{
    public function up()
    {
        Schema::create('imagens', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
        
        DB::statement('ALTER TABLE imagens ADD imagem MEDIUMBLOB AFTER id');
    }

    public function down()
    {
        Schema::dropIfExists('imagens');
    }
}
