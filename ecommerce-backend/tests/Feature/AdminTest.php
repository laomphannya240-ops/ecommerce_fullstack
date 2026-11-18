<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_load_the_dashboard(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'stats' => ['total_revenue', 'orders_count', 'customers_count', 'products_count'],
                    'sales_chart',
                    'recent_orders',
                    'low_stock_products',
                ],
            ]);
    }

    public function test_an_admin_can_create_a_product_with_an_uploaded_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();

        $response = $this->postJson('/api/admin/products', [
            'name' => 'Test Studio Lamp',
            'category_id' => $category->id,
            'price' => 99.5,
            'stock_quantity' => 12,
            'is_featured' => true,
            'thumbnail' => $this->fakePngUpload('lamp.png'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Test Studio Lamp')
            ->assertJsonPath('data.slug', 'test-studio-lamp')
            ->assertJsonPath('data.price', 99.5);

        $product = Product::where('slug', 'test-studio-lamp')->firstOrFail();

        Storage::disk('public')->assertExists($product->thumbnail);
        $this->assertTrue($product->is_featured);
    }

    public function test_the_same_product_cannot_be_created_twice(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();
        Product::factory()->create(['slug' => 'duplicate-product', 'sku' => 'SKU-1']);

        $this->postJson('/api/admin/products', [
            'name' => 'Duplicate Product',
            'category_id' => $category->id,
            'sku' => 'SKU-1',
            'price' => 10,
            'stock_quantity' => 1,
        ])->assertStatus(422)->assertJsonValidationErrors('sku');
    }

    public function test_an_admin_can_update_an_order_status_and_restock_a_cancelled_order(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'LMN-ADMIN-0001',
            'status' => Order::STATUS_PENDING,
            'payment_status' => 'pending',
            'subtotal' => 100,
            'discount_amount' => 0,
            'shipping_fee' => 5,
            'total' => 105,
            'shipping_name' => $customer->name,
            'shipping_phone' => '+855 12 000 000',
            'shipping_line1' => 'Street 1',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'placed_at' => now(),
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => 3,
            'unit_price' => 100,
            'total_price' => 300,
        ]);

        $product->decrement('stock_quantity', 3);

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/orders/{$order->order_number}/status", [
            'status' => 'processing',
        ])->assertOk()->assertJsonPath('data.status', 'processing');

        $this->putJson("/api/admin/orders/{$order->order_number}/status", [
            'status' => 'cancelled',
        ])->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(10, $product->fresh()->stock_quantity);
    }

    public function test_a_customer_cannot_create_products(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $category = Category::factory()->create();

        $this->postJson('/api/admin/products', [
            'name' => 'Forbidden Product',
            'category_id' => $category->id,
            'price' => 10,
            'stock_quantity' => 1,
        ])->assertForbidden();
    }

    public function test_an_admin_can_list_customers_with_order_totals(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $customer = User::factory()->create(['name' => 'Maya Chen']);

        Order::create([
            'user_id' => $customer->id,
            'order_number' => 'LMN-ADMIN-0002',
            'status' => Order::STATUS_COMPLETED,
            'payment_status' => 'paid',
            'subtotal' => 80,
            'discount_amount' => 0,
            'shipping_fee' => 5,
            'total' => 85,
            'shipping_name' => $customer->name,
            'shipping_phone' => '+855 12 000 000',
            'shipping_line1' => 'Street 1',
            'shipping_city' => 'Phnom Penh',
            'shipping_country' => 'Cambodia',
            'placed_at' => now(),
        ]);

        $this->getJson('/api/admin/customers?search=Maya')
            ->assertOk()
            ->assertJsonPath('data.0.total_spent', 85);
    }

    public function test_an_admin_can_view_and_update_a_customer(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $customer = User::factory()->create(['name' => 'Maya Chen']);

        $this->getJson("/api/admin/customers/{$customer->id}")
            ->assertOk()
            ->assertJsonPath('data.customer.id', $customer->id)
            ->assertJsonPath('data.customer.name', 'Maya Chen')
            ->assertJsonCount(0, 'data.orders');

        $this->putJson("/api/admin/customers/{$customer->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertFalse($customer->fresh()->is_active);
    }

    /**
     * Create a real, tiny PNG upload without requiring the GD extension.
     */
    private function fakePngUpload(string $name): UploadedFile
    {
        $contents = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            true,
        );

        return UploadedFile::fake()->createWithContent($name, $contents);
    }
}
