<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http; // Use Laravel's HTTP client for convenience

class AnalysisController extends Controller
{
    /**
     * Handle file uploads for AI analysis.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,gif,webp,mp4,mov,avi|max:204800', // Max 200MB
        ]);

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('uploads', $fileName, 'public'); // Store in 'storage/app/public/uploads'

            // Call the centralized analysis method
            return $this->analyzeMedia(Storage::disk('public')->path($filePath), 'file', $fileName);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Handle URL submissions for AI analysis.
     */
    public function analyzeUrl(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');
        // Call the centralized analysis method
        return $this->analyzeMedia($url, 'url');
    }

    /**
     * Centralized method to send media to Hive AI for analysis.
     * @param string $source The file path or URL to be analyzed.
     * @param string $type 'file' or 'url'.
     * @param string|null $originalFileName The original file name if type is 'file'.
     */
    protected function analyzeMedia(string $source, string $type, ?string $originalFileName = null)
    {
        $hiveAiApiKey = config('services.hiveai.key');
        $hiveAiApiUrl = config('services.hiveai.url');

        if (!$hiveAiApiKey || !$hiveAiApiUrl) {
            return response()->json(['message' => 'Hive AI API credentials not configured.'], 500);
        }
        try {
            $response = Http::withHeaders([
                'Authorization' => 'token ' . $hiveAiApiKey,
            ]);

            $metadata = [];
            if ($type === 'file') {
                $fileContent = file_get_contents($source);
                $mimeType = mime_content_type($source);
                $fileSize = filesize($source);

                $metadata = [
                    'size' => $fileSize,
                    'mime_type' => $mimeType,
                ];

                // Attempt to get image dimensions
                if (str_starts_with($mimeType, 'image/')) {
                    $imageInfo = getimagesize($source);
                    if ($imageInfo) {
                        $metadata['width'] = $imageInfo[0];
                        $metadata['height'] = $imageInfo[1];
                    }
                }
                // For video, more advanced tools like FFmpeg would be needed.
                // For MVP, we'll keep it simple.

                $hiveResponse = $response->attach('media', $fileContent, $originalFileName)
                                         ->post($hiveAiApiUrl);
            } else { // type === 'url'
                $hiveResponse = $response->post($hiveAiApiUrl, ['url' => $source]);
            }
            // The above two lines already send the request and get the response

            if ($hiveResponse->successful()) {
                return response()->json([
                    'message' => 'Analysis submitted successfully',
                    'source' => $source,
                    'type' => $type,
                    'file_metadata' => $metadata, // Include metadata if available
                    'hive_ai_response' => $hiveResponse->json(),
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Hive AI API error',
                    'source' => $source,
                    'type' => $type,
                    'file_metadata' => $metadata, // Include metadata in error response too
                    'hive_ai_error' => $hiveResponse->json(),
                    'status' => $hiveResponse->status(),
                ], $hiveResponse->status());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Hive AI API Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to connect to Hive AI API',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
