<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ManagementUserProduct;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryAlertTest extends TestCase
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

    private function makeEngineerProduct(User $engineer, string $name, int $stockQuantity): Product
    {
        $category = Category::firstOrCreate(['name' => 'Medicine'], ['is_active' => true]);

        $product = Product::create([
            'category_id' => $category->category_id,
            'product_type' => 'purchased_product',
            'name' => $name,
            'sku' => 'SKU-'.uniqid(),
            'stock_quantity' => $stockQuantity,
        ]);

        ManagementUserProduct::create([
            'user_id' => $engineer->user_id,
            'product_id' => $product->product_id,
        ]);

        return $product;
    }

    public function test_an_engineer_can_generate_a_low_stock_alert(): void
    {
        config(['services.gemini.api_key' => null]);

        $engineer = $this->makeUserWithRole('engineer');
        Sanctum::actingAs($engineer, ['*']);

        $this->makeEngineerProduct($engineer, 'Organic Fertilizer', 3);
        $this->makeEngineerProduct($engineer, 'Pesticide X', 50);

        $this->postJson('/api/generate-inventory-alerts')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'inventory')
            ->assertJsonPath('data.0.severity', 'warning')
            ->assertJsonPath(
                'data.0.message',
                'Running low (at or under 5 left) on: Organic Fertilizer. Consider restocking soon.'
            );

        $this->getJson('/api/get-smart-alerts')
            ->assertStatus(200)
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_out_of_stock_takes_priority_over_low_stock(): void
    {
        config(['services.gemini.api_key' => null]);

        $engineer = $this->makeUserWithRole('engineer');
        Sanctum::actingAs($engineer, ['*']);

        $this->makeEngineerProduct($engineer, 'Organic Fertilizer', 0);
        $this->makeEngineerProduct($engineer, 'Pesticide X', 3);

        $this->postJson('/api/generate-inventory-alerts')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.severity', 'critical')
            ->assertJsonPath('data.0.title', 'Out of stock');
    }

    public function test_no_alert_is_generated_when_well_stocked(): void
    {
        $engineer = $this->makeUserWithRole('engineer');
        Sanctum::actingAs($engineer, ['*']);

        $this->makeEngineerProduct($engineer, 'Organic Fertilizer', 50);

        $this->postJson('/api/generate-inventory-alerts')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_message_is_phrased_by_gemini_when_a_key_is_configured(): void
    {
        config(['services.gemini.api_key' => 'test-key', 'services.gemini.model' => 'gemini-test']);

        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    ['content' => ['parts' => [['text' => 'Restock Organic Fertilizer soon, only 3 left.']]]],
                ],
            ]),
        ]);

        $engineer = $this->makeUserWithRole('engineer');
        Sanctum::actingAs($engineer, ['*']);

        $this->makeEngineerProduct($engineer, 'Organic Fertilizer', 3);

        $this->postJson('/api/generate-inventory-alerts')
            ->assertStatus(200)
            ->assertJsonPath('data.0.message', 'Restock Organic Fertilizer soon, only 3 left.');
    }

    public function test_a_farmer_cannot_generate_inventory_alerts(): void
    {
        $farmer = $this->makeUserWithRole('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $this->postJson('/api/generate-inventory-alerts')->assertStatus(401);
    }
}
