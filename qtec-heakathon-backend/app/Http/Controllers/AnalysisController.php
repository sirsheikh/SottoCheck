<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http; // Use Laravel's HTTP client for convenience
use Google\Cloud\Vision\V1\ImageAnnotatorClient;

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

            // Call the Google Vision analysis method
            return $this->analyzeWithGoogleVision(Storage::disk('public')->path($filePath), 'file', $fileName);
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
        // Call the Google Vision analysis method
        return $this->analyzeWithGoogleVision($url, 'url');
    }

    /**
     * Centralized method to send media to Google Vision API for analysis.
     * @param string $source The file path or URL to be analyzed.
     * @param string $type 'file' or 'url'.
     * @param string|null $originalFileName The original file name if type is 'file'.
     */
    protected function analyzeWithGoogleVision(string $source, string $type, ?string $originalFileName = null)
    {
        // IMPORTANT: Make sure the GOOGLE_APPLICATION_CREDENTIALS environment
        // variable is set to the path of your Google Cloud JSON key file.
        try {
            $imageAnnotator = new ImageAnnotatorClient();

            $metadata = [];
            $imageContent = ($type === 'file') ? file_get_contents($source) : file_get_contents($source);

            // Get metadata
            if ($type === 'file') {
                $mimeType = mime_content_type($source);
                $fileSize = filesize($source);
                $metadata = ['size' => $fileSize, 'mime_type' => $mimeType];
                if (str_starts_with($mimeType, 'image/')) {
                    $imageInfo = getimagesize($source);
                    if ($imageInfo) {
                        $metadata['width'] = $imageInfo[0];
                        $metadata['height'] = $imageInfo[1];
                        $metadata['exif'] = [
                            'Make' => 'MockCamera',
                            'Model' => 'Mock-D5000',
                            'DateTimeOriginal' => '2024:01:15 10:30:00',
                            'Software' => 'Mock Photo Editor 1.0',
                        ];
                    }
                }
            }

            # Performs safe search detection on the image file
            $response = $imageAnnotator->safeSearchDetection($imageContent);
            $safeSearch = $response->getSafeSearchAnnotation();

            $likelihood = ['UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];

            $googleVisionResponse = [
                'adult' => $likelihood[$safeSearch->getAdult()],
                'spoof' => $likelihood[$safeSearch->getSpoof()],
                'medical' => $likelihood[$safeSearch->getMedical()],
                'violence' => $likelihood[$safeSearch->getViolence()],
                'racy' => $likelihood[$safeSearch->getRacy()],
            ];

            $imageAnnotator->close();

            return response()->json([
                'message' => 'Analysis with Google Vision successful',
                'source' => $source,
                'type' => $type,
                'file_metadata' => $metadata,
                'google_vision_response' => $googleVisionResponse,
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Google Vision API Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to connect to Google Vision API',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle reverse image search requests.
     */
    public function reverseSearch(Request $request)
    {
        $request->validate([
            'url' => 'required|url', // The URL of the image to reverse search
        ]);

        $imageUrl = $request->input('url');

        // Placeholder for Google Vision API or other reverse image search integration
        // In a real scenario, you would call an external API here.

        // Mock response for development
        $mockResults = [
            'message' => 'Reverse image search results for ' . $imageUrl,
            'source_url' => $imageUrl,
            'results' => [
                [
                    'title' => 'Example Similar Image Result 1',
                    'url' => 'https://example.com/similar-image-1.jpg',
                    'snippet' => 'Found on an image sharing site.',
                    'thumbnail' => 'https://via.placeholder.com/150',
                ],
                [
                    'title' => 'Example Similar Image Result 2',
                    'url' => 'https://anothersite.net/image-result-2.png',
                    'snippet' => 'Appeared in a blog post about related topic.',
                    'thumbnail' => 'https://via.placeholder.com/150',
                ],
            ],
            'earliest_appearance' => 'https://originalsource.com/image.jpg (2020-01-01)',
        ];

        return response()->json($mockResults, 200);
    }

    /**
     * Handle fact-checking requests.
     */
    public function factCheck(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3', // Keywords or content description for fact-checking
        ]);

        $searchQuery = $request->input('query');

        // Placeholder for Fact-Checking API integration (e.g., ClaimReview schema scraping, NewsAPI)
        // In a real scenario, you would call an external API here.

        // Mock response for development
        $mockResults = [
            'message' => 'Fact-checking results for: "' . $searchQuery . '"',
            'query' => $searchQuery,
            'results' => [
                [
                    'title' => 'Fact-Check: Example Debunked Claim',
                    'url' => 'https://factcheck.org/2023/10/example-debunked-claim/',
                    'publisher' => 'FactCheck.org',
                    'rating' => 'False',
                    'snippet' => 'Our analysis shows this claim to be inaccurate based on multiple sources.',
                ],
                [
                    'title' => 'Reuters Fact Check: Misleading Image Circulates',
                    'url' => 'https://www.reuters.com/fact-check/misleading-image-circulates-2023-11-01/',
                    'publisher' => 'Reuters',
                    'rating' => 'Misleading',
                    'snippet' => 'An image purporting to show X was actually taken in Y at a different time.',
                ],
            ],
        ];

        return response()->json($mockResults, 200);
    }

    /**
     * Handle requests for metadata extraction from a URL.
     */
    public function getMetadata(Request $request)
    {
        $request->validate([
            'url' => 'required|url', // The URL of the media to extract metadata from
        ]);

        $mediaUrl = $request->input('url');
        $metadata = [
            'source_url' => $mediaUrl,
            'fetch_status' => 'success',
        ];

        try {
            $response = Http::get($mediaUrl);

            if ($response->successful()) {
                $metadata['content_type'] = $response->header('Content-Type');
                $metadata['content_length'] = $response->header('Content-Length');

                // For images, add mock EXIF data
                if (str_starts_with($metadata['content_type'], 'image/')) {
                    $metadata['exif'] = [
                        'Make' => 'MockCamera',
                        'Model' => 'Mock-D5000',
                        'DateTimeOriginal' => '2024:01:15 10:30:00',
                        'Software' => 'Mock Photo Editor 1.0',
                        'GPSLatitude' => '34.0522',
                        'GPSLongitude' => '-118.2437',
                    ];
                }
            } else {
                $metadata['fetch_status'] = 'failed';
                $metadata['error'] = 'Could not fetch content from URL: ' . $response->status();
                return response()->json($metadata, $response->status());
            }
        } catch (\Exception $e) {
            $metadata['fetch_status'] = 'failed';
            $metadata['error'] = 'Network error while fetching URL: ' . $e->getMessage();
            return response()->json($metadata, 500);
        }

        return response()->json($metadata, 200);
    }

    /**
     * Handle source verification requests.
     */
    public function verifySource(Request $request)
    {
        $request->validate([
            'url' => 'required|url', // The URL of the content to verify
        ]);

        $contentUrl = $request->input('url');

        // Placeholder for actual source verification logic.
        // This would involve complex external API calls, web scraping,
        // and historical data analysis for original source, timeline, etc.

        // Mock response for development
        $mockResults = [
            'message' => 'Source verification results for ' . $contentUrl,
            'verified_url' => $contentUrl,
            'original_source' => [
                'url' => 'https://original-news-agency.com/article-about-content.html',
                'name' => 'Original News Agency',
                'published_date' => '2023-10-26 14:00:00',
            ],
            'publication_timeline' => [
                ['date' => '2023-10-26', 'event' => 'First published by Original News Agency'],
                ['date' => '2023-10-27', 'event' => 'Shared on social media by Account X'],
                ['date' => '2023-10-28', 'event' => 'Picked up by Blog Y'],
            ],
            'related_verified_news' => [
                [
                    'title' => 'Fact-Check: Original Agency Confirms Report',
                    'url' => 'https://verified-news.com/fact-check-original-agency-confirms',
                    'publisher' => 'Verified News',
                ],
            ],
        ];

        return response()->json($mockResults, 200);
    }
}



