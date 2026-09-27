<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchasedProduct;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FarmerOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function makePurchasableProduct(): Product
    {
        $category = Category::create(['name' => 'Medicine', 'is_active' => true]);

        $product = Product::create([
            'category_id' => $category->category_id,
            'product_type' => 'purchased_product',
            'name' => 'Fertilizer',
            'sku' => 'SKU-TEST-PRODUCT-'.uniqid(),
            'stock_quantity' => 100,
        ]);

        PurchasedProduct::create([
            'purchased_product_id' => $product->product_id,
            'product_type' => 'purchased_product',
            'price' => 50,
            'is_active' => true,
        ]);

        return $product;
    }

    private function purchaseOrderPayload(Product $product, string $transactionId): array
    {
        return [
            'order_type' => 'purchased_order',
            'discount_amount' => 0,
            'address_line1' => '123 Farm Road',
            'city' => 'Damascus',
            'country' => 'Syria',
            'address_type' => 'shipping',
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'amount' => 100,
            'transaction_id' => $transactionId,
            'subtotal' => 100,
            'grand_total' => 100,
            'order_status' => 'pending',
            'shipping_fee' => 0,
            'cart' => [
                ['purchased_product_id' => $product->product_id, 'name' => $product->name, 'quantity' => 2, 'price' => 50],
            ],
        ];
    }

    public function test_a_farmer_can_place_a_purchased_order(): void
    {
        $farmer = User::factory()->create();
        $farmer->syncRoles('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $product = $this->makePurchasableProduct();

        $this->postJson('/api/save-purchased-order', $this->purchaseOrderPayload($product, 'TEST-TXN-1'))
            ->assertStatus(200);

        $this->getJson('/api/get-orders')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_placing_a_second_order_does_not_duplicate_earlier_orders_in_the_list(): void
    {
        // Regression test: get-orders used to join the addresses table on
        // user_id alone, so every new address (one gets created per order)
        // multiplied every one of the farmer's past orders in the result.
        $farmer = User::factory()->create();
        $farmer->syncRoles('farmer');
        Sanctum::actingAs($farmer, ['*']);

        $product = $this->makePurchasableProduct();

        $this->postJson('/api/save-purchased-order', $this->purchaseOrderPayload($product, 'TEST-TXN-1'))
            ->assertStatus(200);
        $this->postJson('/api/save-purchased-order', $this->purchaseOrderPayload($product, 'TEST-TXN-2'))
            ->assertStatus(200);

        $this->getJson('/api/get-orders')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
