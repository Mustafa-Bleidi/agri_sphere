<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PlantDiagnosisService
{
    private const PROMPT = <<<'PROMPT'
        You are an agricultural expert helping a farmer diagnose a problem with
        their crop from a photo. Look at the attached image and respond ONLY
        with a JSON object, no other text, matching exactly this shape:
        {
          "crop": "best guess at the crop or plant name, or \"unknown\"",
          "issue": "short name of the disease, pest, or deficiency, or \"healthy\" if nothing is wrong",
          "severity": "one of: none, low, medium, high",
          "confidence": a number from 0 to 1,
          "description": "1-2 sentence explanation of what is visible in the image",
          "recommendation": "1-3 sentences of actionable advice for the farmer"
        }
        PROMPT;

    // This method sends the image to Gemini and returns the parsed diagnosis
    public static function diagnose(UploadedFile $image): array
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model');

        if (empty($apiKey)) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        // Gemini's Flash models occasionally return a transient 503 under load,
        // so retry a couple of times before giving up.
        $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
            ])
            ->timeout(30)
            ->retry(3, 1000, function ($exception) {
                return $exception instanceof RequestException
                    && $exception->response->status() === 503;
            }, throw: false)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [[
                    'parts' => [
                        ['text' => self::PROMPT],
                        [
                            'inline_data' => [
                                'mime_type' => $image->getMimeType(),
                                'data' => base64_encode(file_get_contents($image->getRealPath())),
                            ],
                        ],
                    ],
                ]],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Gemini request failed: '.$response->body());
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
        $decoded = json_decode((string) $text, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('Could not parse the diagnosis response.');
        }

        return $decoded;
    }
}
