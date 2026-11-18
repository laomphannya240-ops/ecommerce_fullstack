<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => fake()->unique()->slug(3),
            'description' => fake()->sentence(),
            'image' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
