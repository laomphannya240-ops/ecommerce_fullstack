<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => 'Home',
            'recipient_name' => fake()->name(),
            'phone' => fake()->numerify('+855 ## ### ###'),
            'line1' => fake()->streetAddress(),
            'line2' => null,
            'city' => 'Phnom Penh',
            'state' => 'Phnom Penh',
            'postal_code' => fake()->postcode(),
            'country' => 'Cambodia',
            'is_default' => true,
        ];
    }
}
