<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\User;

class SmartAlertService
{
    // Morning hours are the usual irrigation window: cool enough that less
    // water is lost to evaporation.
    private const IRRIGATION_HOURS = [6, 7, 8, 9, 10, 11];

    private const HEAVY_RAIN_THRESHOLD_MM = 15;

    // This method fetches a real forecast for the farmer's city, runs it through
    // a small rule engine (rain warning vs. best irrigation window), and stores
    // one alert per fact it finds. The message text is phrased by Gemini when a
    // key is configured, and falls back to a plain template otherwise.
    public static function generateForUser(User $user, ?string $city): array
    {
        $city = $city ?: self::resolveCity($user);

        $forecast = WeatherService::forecastForCity($city);
        $facts = self::buildFacts($forecast);

        $alerts = [];

        foreach ($facts as $fact) {
            $alerts[] = Alert::create([
                'user_id' => $user->user_id,
                'type' => $fact['type'],
                'severity' => $fact['severity'],
                'title' => $fact['title'],
                'message' => self::phraseMessage($fact),
                'city' => $forecast['resolved_city'],
                'is_read' => false,
            ]);
        }

        return $alerts;
    }

    private static function resolveCity(User $user): string
    {
        $address = $user->addresses()->latest()->first();

        return $address?->city ?: 'Damascus';
    }

    private static function buildFacts(array $forecast): array
    {
        $hourly = $forecast['hourly'];
        $times = $hourly['time'] ?? [];
        $precipitationProbability = $hourly['precipitation_probability'] ?? [];
        $precipitation = $hourly['precipitation'] ?? [];
        $temperatures = $hourly['temperature_2m'] ?? [];

        $totalPrecipitation = array_sum($precipitation);
        $city = $forecast['resolved_city'];
        $facts = [];

        if ($totalPrecipitation >= self::HEAVY_RAIN_THRESHOLD_MM) {
            $facts[] = [
                'type' => 'weather',
                'severity' => 'warning',
                'title' => 'Heavy rain expected',
                'city' => $city,
                'total_precipitation_mm' => round($totalPrecipitation, 1),
            ];

            return $facts;
        }

        $best = null;

        foreach ($times as $index => $time) {
            $hour = (int) date('G', strtotime($time));

            if (!in_array($hour, self::IRRIGATION_HOURS, true)) {
                continue;
            }

            $rainChance = $precipitationProbability[$index] ?? 100;

            if ($best === null || $rainChance < $best['rain_chance']) {
                $best = [
                    'time' => $time,
                    'rain_chance' => $rainChance,
                    'temperature' => $temperatures[$index] ?? null,
                ];
            }
        }

        if ($best !== null) {
            $facts[] = [
                'type' => 'irrigation',
                'severity' => 'info',
                'title' => 'Optimal irrigation window',
                'city' => $city,
                'time' => $best['time'],
                'rain_chance' => $best['rain_chance'],
                'temperature' => $best['temperature'],
            ];
        }

        return $facts;
    }

    private static function phraseMessage(array $fact): string
    {
        $template = self::templateMessage($fact);

        $prompt = "You are an agricultural assistant writing a short SMS-style alert for a farmer. "
            ."Given these facts as JSON, write ONE short, friendly, actionable sentence (max 220 characters). "
            ."Respond with only the sentence, no quotes and no markdown.\n"
            .json_encode($fact);

        return GeminiTextService::phraseSentence($prompt, $template);
    }

    private static function templateMessage(array $fact): string
    {
        if ($fact['type'] === 'weather') {
            return sprintf(
                'Heavy rain expected in %s within the next 48 hours (about %smm total) — consider postponing planting or other field work.',
                $fact['city'],
                $fact['total_precipitation_mm']
            );
        }

        return sprintf(
            'The optimal time to irrigate in %s looks like %s (%s%% chance of rain, around %s°C).',
            $fact['city'],
            date('D g:i A', strtotime($fact['time'])),
            $fact['rain_chance'],
            round((float) $fact['temperature'])
        );
    }
}
