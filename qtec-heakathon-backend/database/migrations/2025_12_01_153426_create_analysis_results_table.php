<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analysis_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained()->onDelete('cascade');
            $table->string('detection_result');
            $table->float('confidence_score');
            $table->json('detailed_metrics')->nullable();
            $table->json('visual_highlights')->nullable();
            $table->json('reverse_image_search_results')->nullable();
            $table->json('fact_checking_results')->nullable();
            $table->json('metadata')->nullable();
            $table->json('source_verification_results')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_results');
    }
};
