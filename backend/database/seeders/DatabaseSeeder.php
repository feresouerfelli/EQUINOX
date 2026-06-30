<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@edutn.tn',
            'phone' => '+21670000000',
            'password_hash' => Hash::make('password'),
            'role' => 'admin',
            'lang' => 'ar',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
