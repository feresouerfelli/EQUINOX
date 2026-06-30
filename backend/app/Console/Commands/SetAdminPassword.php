<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SetAdminPassword extends Command
{
    protected $signature = 'admin:set-password {--email=admin@edutn.tn} {--password=password}';
    protected $description = 'Set admin password';

    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');

        $user = User::where('email', $email)->first();

        if (!$user) {
            User::create([
                'name' => 'Admin',
                'email' => $email,
                'password_hash' => Hash::make($password),
                'role' => 'admin',
                'phone' => '+21600000000',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->info("Created new admin: {$email}");
        } else {
            $user->password_hash = Hash::make($password);
            $user->save();
            $this->info("Password updated for {$email}");
        }

        return 0;
    }
}
