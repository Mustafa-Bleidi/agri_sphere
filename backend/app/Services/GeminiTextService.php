<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiTextService
{
    // Asks Gemini to phrase a short sentence for the given prompt, falling back
    // to the given plain-text sentence when no key is configured or the
    // request fails for any reason. Shared by every "smart" feature that wants
    // an AI-phrased message on top of its own rule engine (Smart Alerts for
    // farmers and engineers today).
    public static function phraseSentence(string $prompt, string $fallback): string
    {
        $apiKey = config('services.gemini.api_key');

        if (empty($apiKey)) {
            return $fallback;
        }

        try {
            $model = config('services.gemini.model');

            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->timeout(15)
                ->retry(2, 800, function ($exception) {
                    return $exception instanceof RequestException
                        && $exception->response->status() === 503;
                }, throw: false)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                ]);

            if ($response->failed()) {
                return $fallback;
            }

            $text = trim((string) data_get($response->json(), 'candidates.0.content.parts.0.text'));

            return $text !== '' ? $text : $fallback;
        } catch (Throwable $e) {
            Log::warning('Gemini phrasing failed, falling back to template: '.$e->getMessage());

            return $fallback;
        }
    }
}
