<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $price = fake()->numberBetween(2000, 20000) / 100;

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'slug' => fake()->unique()->slug(4),
            'sku' => 'TEST-'.fake()->unique()->bothify('??####'),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'price' => $price,
            'sale_price' => null,
            'stock_quantity' => 25,
            'low_stock_threshold' => 5,
            'thumbnail' => null,
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'sale_price' => round($attributes['price'] * 0.9, 2),
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock_quantity' => 0]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
