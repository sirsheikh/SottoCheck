<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalysisResult extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'media_id',
        'detection_result',
        'confidence_score',
        'detailed_metrics',
        'visual_highlights',
        'reverse_image_search_results',
        'fact_checking_results',
        'metadata',
        'source_verification_results',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'detailed_metrics' => 'array',
        'visual_highlights' => 'array',
        'reverse_image_search_results' => 'array',
        'fact_checking_results' => 'array',
        'metadata' => 'array',
        'source_verification_results' => 'array',
    ];

    /**
     * Get the media that owns the analysis result.
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
