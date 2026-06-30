<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password_hash', 255);
            $table->enum('role', ['student', 'professor', 'admin'])->default('student');
            $table->string('avatar_url', 500)->nullable();
            $table->enum('lang', ['ar', 'fr', 'en'])->default('ar');
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('plan', ['free', 'premium', 'enterprise'])->default('free');
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('gateway', ['d17', 'konnect', 'flouci', 'bank', 'manual'])->nullable();
            $table->decimal('amount_dt', 8, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('gateway', ['d17', 'konnect', 'flouci', 'bank', 'manual']);
            $table->string('gateway_reference', 255)->nullable();
            $table->decimal('amount_dt', 8, 2);
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamps();
        });

        Schema::create('professors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('bio_ar')->nullable();
            $table->text('bio_fr')->nullable();
            $table->text('bio_en')->nullable();
            $table->string('specialty', 255)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('total_students')->default(0);
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained()->cascadeOnDelete();
            $table->string('title_ar', 500);
            $table->string('title_fr', 500)->nullable();
            $table->string('title_en', 500)->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->string('specialty', 255)->nullable();
            $table->enum('level', ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'])->default('L1');
            $table->decimal('price_dt', 8, 2)->default(0);
            $table->boolean('is_free')->default(true);
            $table->enum('status', ['draft', 'pending', 'active'])->default('draft');
            $table->unsignedInteger('total_lessons')->default(0);
            $table->unsignedInteger('total_duration_min')->default(0);
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title_ar', 500);
            $table->string('title_fr', 500)->nullable();
            $table->string('title_en', 500)->nullable();
            $table->string('video_url', 500)->nullable();
            $table->unsignedInteger('video_duration_sec')->default(0);
            $table->string('pdf_url', 500)->nullable();
            $table->unsignedInteger('order_index')->default(0);
            $table->boolean('is_preview')->default(false);
            $table->timestamps();
        });

        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->text('question_ar');
            $table->text('question_fr')->nullable();
            $table->text('question_en')->nullable();
            $table->json('options')->nullable();
            $table->string('correct_answer', 255);
            $table->text('explanation')->nullable();
            $table->enum('type', ['mcq', 'open'])->default('mcq');
            $table->timestamps();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->foreignId('last_lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->timestamp('enrolled_at');
            $table->timestamp('completed_at')->nullable();
            $table->unique(['user_id', 'course_id']);
        });

        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('watched_seconds')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('last_watched_at');
            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::create('live_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title', 500);
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('duration_min')->default(60);
            $table->string('livekit_room_name', 255)->nullable();
            $table->string('recording_url', 500)->nullable();
            $table->enum('status', ['scheduled', 'live', 'ended'])->default('scheduled');
            $table->timestamps();
        });

        Schema::create('ai_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->json('messages');
            $table->unsignedInteger('total_tokens_used')->default(0);
            $table->timestamps();
        });

        Schema::create('notebooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->longText('content_json')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->unique(['user_id', 'course_id']);
        });

        Schema::create('course_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name', 255);
            $table->timestamps();
        });

        Schema::create('group_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('course_groups')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->string('image_url', 500)->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
        });

        Schema::create('group_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('group_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 100);
            $table->string('title', 500);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->string('action_url', 500)->nullable();
            $table->enum('channel', ['email', 'sms', 'inapp'])->default('inapp');
            $table->timestamps();
        });

        Schema::create('ai_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->char('month', 7);
            $table->unsignedInteger('tokens_used')->default(0);
            $table->unsignedInteger('tokens_limit')->default(50000);
            $table->timestamp('updated_at')->nullable();
            $table->unique(['user_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_usage');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('group_replies');
        Schema::dropIfExists('group_posts');
        Schema::dropIfExists('course_groups');
        Schema::dropIfExists('notebooks');
        Schema::dropIfExists('ai_chats');
        Schema::dropIfExists('live_sessions');
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('exercises');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('professors');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('users');
    }
};
