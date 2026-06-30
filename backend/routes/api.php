<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LiveSessionController;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\ForumController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ProfessorController;
use App\Http\Controllers\Api\NotebookController;
use App\Http\Controllers\Api\D17PaymentController;
use App\Http\Controllers\Api\AdminD17Controller;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\AdminSecurityController;
use Illuminate\Support\Facades\Broadcast;

// Public Routes (with security middleware)
Route::middleware(['sanitize', 'security.headers', 'log.suspicious'])->group(function () {
    Route::get('/login', fn () => response()->json(['message' => 'Use POST to login'], 200))->name('login');

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);
        Route::post('/otp/resend', [AuthController::class, 'resendOtp']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // Payment Webhooks (no auth)
    Route::post('/payments/d17/webhook', [PaymentController::class, 'd17Webhook']);
    Route::post('/payments/konnect/webhook', [PaymentController::class, 'konnectWebhook']);
    Route::post('/payments/flouci/webhook', [PaymentController::class, 'flouciWebhook']);
});

// Protected Routes
Route::middleware(['auth:sanctum', 'check.banned', 'sanitize', 'security.headers'])->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Courses
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);
    Route::get('/courses/{id}/lessons', [CourseController::class, 'lessons']);
    Route::post('/enrollments', [CourseController::class, 'enroll']);
    Route::get('/student/courses', [CourseController::class, 'studentCourses']);
    Route::put('/lesson-progress/{id}', [CourseController::class, 'updateProgress']);

    // Live Sessions
    Route::get('/live-sessions', [LiveSessionController::class, 'index']);
    Route::post('/live-sessions/{id}/join', [LiveSessionController::class, 'join']);
    Route::post('/live-sessions/{id}/start', [LiveSessionController::class, 'start']);
    Route::post('/live-sessions/{id}/end', [LiveSessionController::class, 'end']);

    // AI Notebook
    Route::post('/ai/chat', [AIController::class, 'chat']);
    Route::get('/ai/history/{courseId}', [AIController::class, 'history']);
    Route::post('/ai/quiz', [AIController::class, 'quiz']);
    Route::post('/ai/dictionary', [AIController::class, 'dictionary']);
    Route::post('/ai/search', [AIController::class, 'search']);
    Route::get('/notebooks/{courseId}', [NotebookController::class, 'show']);
    Route::put('/notebooks/{courseId}', [NotebookController::class, 'update']);
    Route::post('/notebooks/{courseId}/export-pdf', [NotebookController::class, 'exportPdf']);

    // Payments
    Route::post('/payments/d17/initiate', [PaymentController::class, 'initiateD17']);
    Route::post('/payments/konnect/initiate', [PaymentController::class, 'initiateKonnect']);
    Route::post('/payments/flouci/initiate', [PaymentController::class, 'initiateFlouci']);
    Route::post('/payments/bank/submit-proof', [PaymentController::class, 'submitBankProof']);
    Route::get('/payments/history', [PaymentController::class, 'history']);
    Route::get('/payments/{id}/status', [PaymentController::class, 'checkStatus']);
    Route::get('/payments/{id}/invoice', [PaymentController::class, 'invoice']);

    // D17 QR Payment (student)
    Route::get('/payments/generate-code', [D17PaymentController::class, 'generateCode']);
    Route::post('/payments/submit', [D17PaymentController::class, 'submit']);

    // Subscriptions
    Route::get('/subscription', [SubscriptionController::class, 'current']);
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgrade']);

    // Forum
    Route::get('/groups/{courseId}/posts', [ForumController::class, 'posts']);
    Route::post('/groups/{courseId}/posts', [ForumController::class, 'createPost']);
    Route::post('/groups/{courseId}/posts/{postId}/replies', [ForumController::class, 'reply']);
    Route::put('/groups/{courseId}/posts/{postId}/like', [ForumController::class, 'like']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // File Uploads
    Route::post('/upload/thumbnail/{courseId}', [UploadController::class, 'thumbnail']);
    Route::post('/upload/video/{lessonId}', [UploadController::class, 'video']);
    Route::post('/upload/pdf/{lessonId}', [UploadController::class, 'pdf']);
    Route::post('/upload/professor-file', [UploadController::class, 'professorFile']);
    Route::get('/upload/professor-files', [UploadController::class, 'professorFiles']);

    // Admin Routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/ban', [AdminController::class, 'banUser']);
        Route::post('/professors', [AdminController::class, 'addProfessor']);
        Route::get('/courses/pending', [AdminController::class, 'pendingCourses']);
        Route::get('/courses/all', [AdminController::class, 'allCourses']);
        Route::put('/courses/{id}/approve', [AdminController::class, 'approveCourse']);
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::post('/broadcast', [AdminController::class, 'broadcast']);

        // Security Dashboard
        Route::get('/security/stats', [AdminSecurityController::class, 'stats']);
        Route::get('/security/logs', [AdminSecurityController::class, 'logs']);
        Route::get('/security/blocked-ips', [AdminSecurityController::class, 'blockedIps']);
        Route::post('/security/block-ip', [AdminSecurityController::class, 'blockIp']);
        Route::delete('/security/blocked-ips/{ip}', [AdminSecurityController::class, 'unblockIp']);

        // D17 Payment Requests (admin)
        Route::get('/payment-requests', [AdminD17Controller::class, 'index']);
        Route::get('/payment-requests/{id}', [AdminD17Controller::class, 'show']);
        Route::get('/payment-requests/{id}/screenshot', [AdminD17Controller::class, 'screenshot']);
        Route::patch('/payment-requests/{id}/approve', [AdminD17Controller::class, 'approve']);
        Route::patch('/payment-requests/{id}/reject', [AdminD17Controller::class, 'reject']);
        Route::patch('/payment-requests/{id}/fraud', [AdminD17Controller::class, 'reportFraud']);
    });

    // Professor Routes
    Route::prefix('professor')->middleware('professor')->group(function () {
        Route::get('/courses', [ProfessorController::class, 'courses']);
        Route::get('/stats', [ProfessorController::class, 'stats']);
        Route::get('/students', [ProfessorController::class, 'students']);
        Route::get('/live-sessions', [ProfessorController::class, 'liveSessions']);
        Route::post('/live-sessions', [ProfessorController::class, 'createLiveSession']);
        Route::get('/analytics', [ProfessorController::class, 'analytics']);
        Route::get('/profile', [ProfessorController::class, 'profile']);
        Route::put('/profile', [ProfessorController::class, 'updateProfile']);
    });

    // Broadcast auth (Soketi channel authentication)
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $channelName = $request->input('channel_name');
        if (preg_match('/^user\.\d+$/', $channelName)) {
            $channelUserId = (int) explode('.', $channelName)[1];
            if ($channelUserId === $user->id) {
                return response()->json(['auth' => 'ok']);
            }
        } elseif (preg_match('/^professor\.\d+$/', $channelName)) {
            if ($user->role === 'professor') {
                return response()->json(['auth' => 'ok']);
            }
        } elseif ($channelName === 'admin.fraud') {
            if ($user->role === 'admin') {
                return response()->json(['auth' => 'ok']);
            }
        } elseif (preg_match('/^course\.\d+$/', $channelName)) {
            // Any authenticated user can listen to course channels
            return response()->json(['auth' => 'ok']);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    });
});
