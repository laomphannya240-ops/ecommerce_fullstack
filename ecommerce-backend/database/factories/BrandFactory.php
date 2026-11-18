<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Brand>
 */
class BrandFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->words(2, true)),
            'slug' => fake()->unique()->slug(3),
            'logo' => null,
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
