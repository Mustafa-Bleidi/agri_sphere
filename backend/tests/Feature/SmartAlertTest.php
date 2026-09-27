<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SmartAlertTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makeUserWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->syncRoles($role);

        return $user;
    }

    // Builds a two-day hourly forecast where 9am tomorrow has the lowest
    // rain chance of the morning irrigation window, and total precipitation
    // stays under the heavy-rain threshold.
    private function fakeMildForecast(): array
    {
        $times = [];
        $temps = [];
        $rainChance = [];
        $rain = [];

        for ($day = 0; $day < 2; $day++) {
            for ($hour = 0; $hour < 24; $hour++) {
                $times[] = sprintf('2026-09-%02dT%02d:00', 28 + $day, $hour);
                $temps[] = 18;
                $rainChance[] = ($hour === 9) ? 5 : 40;
                $rain[] = 0;
            }
        }

        return [
            'hourly' => [
                'time' => $times,
                'temperature_2m' => $temps,
                'precipitation_probability' => $rainChance,
                'precipitation' => $rain,
            ],
            'daily' => [],
        ];
    }

    private function fakeHeavyRainForecast(): array
    {
        $times = [];
        $rain = [];

        for ($day = 0; $day < 2; $day++) {
            for ($hour = 0; $hour < 24; $hour++) {
                $times[] = sprintf('2026-09-%02dT%02d:00', 28 + $day, $hour);
                $rain[] = 0.5; // 48 * 0.5mm = 24mm, above the 15mm threshold
            }
        }

        return [
            'hourly' => [
                'time' => $times,
                'temperature_2m' => array_fill(0, count($times), 15),
                'precipitation_probability' => array_fill(0, count($times), 80),
                'precipitation' => $rain,
            ],
            'daily' => [],
        ];
    }

    private function fakeGeocode(string $city = 'Damascus'): array
    {
        return ['results' => [['name' => $city, 'latitude' => 33.5, 'longitude' => 36.3]]];
    }

    public function test_a_farmer_can_generate_and_list_smart_alerts(): void
    {
        config(['services.gemini.api_key' => null]);

        Http::fake([
            'geocoding-api.open-meteo.com/*' => Http::response($this->fakeGeocode()),
            'api.open-meteo.com/*' => Http::response($this->fakeMildForecast()),
        ]);

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-smart-alerts', ['city' => 'Damascus'])
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'irrigation')
            ->assertJsonPath('data.0.city', 'Damascus')
            ->assertJsonPath('data.0.is_read', false);

        $this->getJson('/api/get-smart-alerts')
            ->assertStatus(200)
            ->assertJsonPath('data.unread_count', 1)
            ->assertJsonCount(1, 'data.alerts');
    }

    public function test_heavy_rain_produces_a_warning_alert_instead_of_an_irrigation_alert(): void
    {
        config(['services.gemini.api_key' => null]);

        Http::fake([
            'geocoding-api.open-meteo.com/*' => Http::response($this->fakeGeocode()),
            'api.open-meteo.com/*' => Http::response($this->fakeHeavyRainForecast()),
        ]);

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-smart-alerts', ['city' => 'Damascus'])
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'weather')
            ->assertJsonPath('data.0.severity', 'warning');
    }

    public function test_message_is_phrased_by_gemini_when_a_key_is_configured(): void
    {
        config(['services.gemini.api_key' => 'test-key', 'services.gemini.model' => 'gemini-test']);

        Http::fake([
            'geocoding-api.open-meteo.com/*' => Http::response($this->fakeGeocode()),
            'api.open-meteo.com/*' => Http::response($this->fakeMildForecast()),
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    ['content' => ['parts' => [['text' => 'Irrigate around 9am tomorrow, skies stay dry.']]]],
                ],
            ]),
        ]);

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-smart-alerts', ['city' => 'Damascus'])
            ->assertStatus(200)
            ->assertJsonPath('data.0.message', 'Irrigate around 9am tomorrow, skies stay dry.');
    }

    public function test_an_unresolvable_city_returns_a_client_error_without_leaking_internals(): void
    {
        Http::fake([
            'geocoding-api.open-meteo.com/*' => Http::response(['results' => []]),
        ]);

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-smart-alerts', ['city' => 'Nowhereville'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Could not find a location named "Nowhereville". Try a different city name.');
    }

    public function test_a_transport_failure_returns_a_generic_error_without_leaking_internals(): void
    {
        Http::fake(function () {
            throw new \Illuminate\Http\Client\ConnectionException('cURL error 56: CONNECT tunnel failed');
        });

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-smart-alerts', ['city' => 'Damascus'])
            ->assertStatus(500)
            ->assertJsonPath('message', 'Could not generate alerts right now. Please try again later.');
    }

    public function test_a_farmer_can_mark_an_alert_read_and_mark_all_read(): void
    {
        config(['services.gemini.api_key' => null]);

        Http::fake([
            'geocoding-api.open-meteo.com/*' => Http::response($this->fakeGeocode()),
            'api.open-meteo.com/*' => Http::response($this->fakeHeavyRainForecast()),
        ]);

        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $generated = $this->postJson('/api/generate-smart-alerts', ['city' => 'Damascus']);
        $alertId = $generated->json('data.0.alert_id');

        $this->postJson("/api/mark-alert-read/{$alertId}")
            ->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $this->postJson('/api/mark-all-alerts-read')->assertStatus(200);

        $this->getJson('/api/get-smart-alerts')
            ->assertStatus(200)
            ->assertJsonPath('data.unread_count', 0);
    }

    public function test_a_dealer_cannot_access_farmer_smart_alert_routes(): void
    {
        $dealer = $this->makeUserWithRole('dealer');
        Sanctum::actingAs($dealer, ['*']);

        $this->getJson('/api/get-smart-alerts')->assertStatus(401);
    }
}
