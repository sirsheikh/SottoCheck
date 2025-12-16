<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/analyze/upload', [AnalysisController::class, 'upload']);
Route::post('/analyze/url', [AnalysisController::class, 'analyzeUrl']);

