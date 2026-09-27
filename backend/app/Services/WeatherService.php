<?php

namespace App\Services;

use App\Exceptions\LocationNotFoundException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class WeatherService
{
    // This method resolves a city name to coordinates and returns a short-range
    // hourly/daily forecast for it, using the free Open-Meteo API (no API key required).
    public static function forecastForCity(string $city): array
    {
        $geocode = self::request('https://geocoding-api.open-meteo.com/v1/search', [
            'name' => $city,
            'count' => 1,
        ]);

        $location = $geocode->json('results.0');

        if (empty($location)) {
            throw new LocationNotFoundException("Could not find a location named \"{$city}\". Try a different city name.");
        }

        $forecast = self::request('https://api.open-meteo.com/v1/forecast', [
            'latitude' => $location['latitude'],
            'longitude' => $location['longitude'],
            'hourly' => 'temperature_2m,precipitation_probability,precipitation',
            'daily' => 'precipitation_sum,temperature_2m_max,temperature_2m_min',
            'forecast_days' => 2,
            'timezone' => 'auto',
        ]);

        return [
            'resolved_city' => $location['name'] ?? $city,
            'latitude' => $location['latitude'],
            'longitude' => $location['longitude'],
            'hourly' => $forecast->json('hourly') ?? [],
            'daily' => $forecast->json('daily') ?? [],
        ];
    }

    // Wraps a GET call so that any transport-level failure (DNS, timeout,
    // connection refused, ...) turns into a safe, generic message instead of
    // leaking raw cURL/Guzzle exception text to the API response.
    private static function request(string $url, array $query)
    {
        try {
            $response = Http::timeout(15)->get($url, $query);
        } catch (Throwable $e) {
            throw new RuntimeException('Weather service is unavailable right now.', previous: $e);
        }

        if ($response->failed()) {
            throw new RuntimeException('Weather service is unavailable right now.');
        }

        return $response;
    }
}
