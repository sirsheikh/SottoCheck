<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/analyze/upload', [AnalysisController::class, 'upload']);
Route::post('/analyze/url', [AnalysisController::class, 'analyzeUrl']);
Route::post('/reverse-search', [AnalysisController::class, 'reverseSearch']);
Route::post('/fact-check', [AnalysisController::class, 'factCheck']);
Route::get('/metadata', [AnalysisController::class, 'getMetadata']);
Route::post('/verify-source', [AnalysisController::class, 'verifySource']);

