<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateStudent extends Command
{
    protected $signature = 'student:create {--email=} {--name=} {--password=}';
    protected $description = 'Create a student account';

    public function handle()
    {
        $email = $this->option('email') ?: 'student@edutn.tn';
        $name = $this->option('name') ?: 'Ahmed Ben Ali';
        $password = $this->option('password') ?: 'password';

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'password_hash' => Hash::make($password),
                'role' => 'student',
                'is_active' => true,
            ]);
            $this->info("Student updated: {$email}");
        } else {
            User::create([
                'name' => $name,
                'email' => $email,
                'phone' => '+21620000001',
                'password_hash' => Hash::make($password),
                'role' => 'student',
                'lang' => 'ar',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->info("Student created: {$email}");
        }

        $this->info("Password: {$password}");
        return 0;
    }
}
