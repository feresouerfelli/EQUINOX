<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_log', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 50);
            $table->string('ip_address', 45);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('payload')->nullable();
            $table->string('endpoint', 255);
            $table->string('user_agent', 500)->nullable();
            $table->boolean('blocked')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('ip_address');
            $table->index('event_type');
            $table->index('created_at');
        });

        Schema::create('blocked_ips', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->unique();
            $table->string('reason', 50);
            $table->string('blocked_type', 20)->default('permanent');
            $table->timestamp('blocked_until')->nullable();
            $table->unsignedBigInteger('blocked_by')->nullable();
            $table->integer('attempt_count')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocked_ips');
        Schema::dropIfExists('security_log');
    }
};
