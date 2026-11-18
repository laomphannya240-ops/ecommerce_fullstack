<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->seedUsers();

        $this->call([
            CatalogSeeder::class,
            DemoOrderSeeder::class,
        ]);
    }

    private function seedUsers(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@lumen.test'],
            [
                'name' => 'Alex Morgan',
                'phone' => '+855 12 345 678',
                'role' => 'admin',
                'is_active' => true,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'customer@lumen.test'],
            [
                'name' => 'Sokha Chan',
                'phone' => '+855 92 111 222',
                'role' => 'customer',
                'is_active' => true,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $customers = [
            ['name' => 'Maya Chen', 'email' => 'maya@example.com'],
            ['name' => 'Daniel Reyes', 'email' => 'daniel@example.com'],
            ['name' => 'Priya Nair', 'email' => 'priya@example.com'],
            ['name' => 'Lucas Meyer', 'email' => 'lucas@example.com'],
            ['name' => 'Aiko Tanaka', 'email' => 'aiko@example.com'],
        ];

        foreach ($customers as $customer) {
            User::updateOrCreate(
                ['email' => $customer['email']],
                [
                    'name' => $customer['name'],
                    'role' => 'customer',
                    'is_active' => true,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
