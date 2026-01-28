<?php

use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

Route::apiResource('posts', PostController::class);
