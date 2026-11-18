<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_the_cart(): void
    {
        $this->getJson('/api/cart')->assertUnauthorized();
    }

    public function test_a_customer_can_add_items_and_update_quantities(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated()
            ->assertJsonPath('data.item_count', 2);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated()
            ->assertJsonPath('data.item_count', 3);

        $itemId = $this->getJson('/api/cart')->json('data.items.0.id');

        $this->putJson("/api/cart/items/{$itemId}", ['quantity' => 1])
            ->assertOk()
            ->assertJsonPath('data.item_count', 1);
    }

    public function test_cart_respects_available_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 2]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ])->assertStatus(422);
    }

    public function test_checkout_creates_an_order_and_clears_the_cart(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price' => 60,
            'sale_price' => null,
            'stock_quantity' => 10,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated();

        $response = $this->postJson('/api/orders', [
            'shipping_name' => 'Sokha Chan',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'No. 24, Street 240',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'payment_method' => 'cod',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.subtotal', 120)
            ->assertJsonPath('data.shipping_fee', 5)
            ->assertJsonPath('data.total', 125);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'subtotal' => 120,
            'total' => 125,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseHas('payments', [
            'payment_method' => 'cod',
            'status' => 'pending',
        ]);

        $this->assertSame(8, $product->fresh()->stock_quantity);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_checkout_applies_a_valid_coupon(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price' => 100,
            'sale_price' => null,
            'stock_quantity' => 10,
        ]);
        Coupon::create([
            'code' => 'TEST10',
            'type' => 'percent',
            'value' => 10,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated();

        $this->postJson('/api/coupons/apply', ['code' => 'TEST10'])
            ->assertOk()
            ->assertJsonPath('data.discount', 10);

        $this->postJson('/api/orders', [
            'shipping_name' => 'Sokha Chan',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'No. 24, Street 240',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'payment_method' => 'khqr',
            'coupon_code' => 'TEST10',
        ])->assertCreated()
            ->assertJsonPath('data.discount_amount', 10)
            ->assertJsonPath('data.coupon_code', 'TEST10')
            ->assertJsonPath('data.total', 95);

        $this->assertDatabaseHas('coupons', ['code' => 'TEST10', 'used_count' => 1]);
    }

    public function test_checkout_rejects_an_invalid_coupon(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 5]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated();

        $this->postJson('/api/orders', [
            'shipping_name' => 'Sokha Chan',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'No. 24, Street 240',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'payment_method' => 'cod',
            'coupon_code' => 'MISSING',
        ])->assertStatus(422)->assertJsonValidationErrors('coupon_code');
    }

    public function test_a_customer_cannot_view_another_customers_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 5]);

        Sanctum::actingAs($owner);
        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 1]);
        $orderNumber = $this->postJson('/api/orders', [
            'shipping_name' => 'Owner',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'Street 1',
            'shipping_city' => 'Phnom Penh',
            'payment_method' => 'cod',
        ])->json('data.order_number');

        Sanctum::actingAs($other);
        $this->getJson("/api/orders/{$orderNumber}")->assertNotFound();
    }

    public function test_a_customer_can_cancel_a_pending_order_and_stock_is_restored(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 50, 'stock_quantity' => 10]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 2]);
        $orderNumber = $this->postJson('/api/orders', [
            'shipping_name' => 'Sokha Chan',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'Street 1',
            'shipping_city' => 'Phnom Penh',
            'payment_method' => 'cod',
        ])->json('data.order_number');

        $this->postJson("/api/orders/{$orderNumber}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(10, $product->fresh()->stock_quantity);
    }

    public function test_a_customer_can_verify_a_khqr_payment(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price' => 50,
            'sale_price' => null,
            'stock_quantity' => 5,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertCreated();

        $order = $this->postJson('/api/orders', [
            'shipping_name' => 'Sokha Chan',
            'shipping_phone' => '+855 92 111 222',
            'shipping_line1' => 'No. 24, Street 240',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'payment_method' => 'khqr',
        ])->assertCreated()->json('data');

        $this->postJson("/api/payments/{$order['payment']['id']}/verify")
            ->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.order.order_number', $order['order_number']);

        $this->assertDatabaseHas('orders', [
            'id' => $order['id'],
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);
    }

    public function test_customers_cannot_access_admin_routes(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/dashboard')->assertForbidden();
    }
}
