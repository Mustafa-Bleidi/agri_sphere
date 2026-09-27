<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EngineerProductTest extends TestCase
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

    public function test_an_engineer_can_create_list_and_delete_a_product(): void
    {
        $engineer = $this->makeUserWithRole('engineer');
        Sanctum::actingAs($engineer, ['*']);

        $category = Category::create(['name' => 'Medicine', 'is_active' => true]);

        $createResponse = $this->postJson('/api/save-engineer-product', [
            'category_id' => $category->category_id,
            'product_type' => 'purchased_product',
            'name' => 'Organic Fertilizer',
            'sku' => 'SKU-TEST-001',
            'price' => 500,
            'is_active' => true,
        ]);

        $createResponse->assertStatus(200);

        $listResponse = $this->getJson('/api/get-engineer-products');
        $listResponse->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Organic Fertilizer');

        $productId = $listResponse->json('data.0.product_id');

        $this->deleteJson("/api/delete-engineer-product/{$productId}")
            ->assertStatus(200);

        $this->getJson('/api/get-engineer-products')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_a_dealer_cannot_access_engineer_only_routes(): void
    {
        $dealer = $this->makeUserWithRole('dealer');
        Sanctum::actingAs($dealer, ['*']);

        $this->getJson('/api/get-engineer-products')->assertStatus(401);
    }

    public function test_a_guest_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/get-engineer-products')->assertStatus(401);
    }
}
