<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code', 30)->unique();
            $table->enum('status', ['active', 'used', 'expired'])->default('active');
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::create('payment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_code_id')->constrained('payment_codes');
            $table->string('submitted_code', 30);
            $table->boolean('code_match')->default(false);
            $table->enum('plan', ['premium'])->default('premium');
            $table->decimal('amount_dt', 8, 2)->default(39.00);
            $table->enum('gateway', ['d17'])->default('d17');
            $table->string('screenshot_path', 500);
            $table->char('screenshot_hash', 64);
            $table->integer('image_width')->nullable();
            $table->integer('image_height')->nullable();
            $table->timestamp('image_exif_date')->nullable();
            $table->boolean('has_exif')->default(false);
            $table->enum('fraud_score', ['clean', 'warning', 'suspect'])->default('clean');
            $table->json('fraud_flags')->nullable();
            $table->string('ticket_number', 20)->unique();
            $table->enum('status', ['pending', 'approved', 'rejected', 'fraud'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('fraud_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('request_id')->nullable()->constrained('payment_requests')->nullOnDelete();
            $table->text('reason');
            $table->foreignId('reported_by')->constrained('users');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->tinyInteger('fraud_strikes')->default(0);
            $table->boolean('is_fraud_banned')->default(false);
            $table->timestamp('banned_until')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['fraud_strikes', 'is_fraud_banned', 'banned_until']);
        });
        Schema::dropIfExists('fraud_log');
        Schema::dropIfExists('payment_requests');
        Schema::dropIfExists('payment_codes');
    }
};
