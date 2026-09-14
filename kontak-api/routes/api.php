<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/kontak', [ContactController::class, 'index']);
    Route::post('/kontak', [ContactController::class, 'store']);
    Route::get('/kontak/{kontak}', [ContactController::class, 'show']);
    Route::put('/kontak/{kontak}', [ContactController::class, 'update']);
    Route::delete('/kontak/{kontak}', [ContactController::class, 'destroy']);
});