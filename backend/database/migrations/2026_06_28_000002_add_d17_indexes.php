<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Unique index on screenshot_hash — prevents 2 identical screenshots at DB level
        DB::statement('ALTER TABLE payment_requests ADD UNIQUE INDEX idx_screenshot_hash_unique (screenshot_hash)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payment_requests DROP INDEX idx_screenshot_hash_unique');
    }
};
