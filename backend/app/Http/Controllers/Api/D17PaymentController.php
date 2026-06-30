<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentCode;
use App\Models\PaymentRequest;
use App\Models\Subscription;
use App\Models\Notification;
use App\Services\FraudDetectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class D17PaymentController extends Controller
{
    private FraudDetectionService $fraud;

    public function __construct(FraudDetectionService $fraud)
    {
        $this->fraud = $fraud;
    }

    public function generateCode(Request $request)
    {
        $user = $request->user();

        // Invalidate old active codes
        PaymentCode::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        // Generate new code
        $code = 'EDU-' . $user->id . '-' . str_pad(mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);

        $paymentCode = PaymentCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'status' => 'active',
            'expires_at' => now()->addMinutes(30),
        ]);

        return response()->json([
            'code' => $code,
            'expires_at' => $paymentCode->expires_at->toIso8601String(),
            'expires_in_minutes' => 30,
        ]);
    }

    public function submit(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'submitted_code' => 'required|string|max:30',
            'screenshot' => 'required|file',
        ]);

        $file = $request->file('screenshot');

        // Run all validation checks
        $validation = $this->fraud->validateBeforeSubmit(
            $user->id,
            $validated['submitted_code'],
            $file
        );

        if (!$validation['pass']) {
            return response()->json([
                'message' => $validation['message'],
                'error' => $validation['error'],
            ], 422);
        }

        $code = $validation['code'];
        $hash = $validation['hash'];

        // Save screenshot to private storage
        $ticketNumber = 'EDU-' . date('Y') . '-' . str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        $dir = "payments/{$user->id}";
        $filename = "{$ticketNumber}.jpg";
        $path = $file->storeAs($dir, $filename, 'private');

        // Analyze image metadata
        $storagePath = storage_path("app/private/{$dir}/{$filename}");
        $imageData = $this->fraud->analyzeImage($storagePath);

        // Check code match
        $codeMatch = ($validated['submitted_code'] === $code->code);

        // Create payment request
        $paymentRequest = PaymentRequest::create([
            'user_id' => $user->id,
            'payment_code_id' => $code->id,
            'submitted_code' => $validated['submitted_code'],
            'code_match' => $codeMatch,
            'plan' => 'premium',
            'amount_dt' => 39.00,
            'gateway' => 'd17',
            'screenshot_path' => "{$dir}/{$filename}",
            'screenshot_hash' => $hash,
            'image_width' => $imageData['width'],
            'image_height' => $imageData['height'],
            'image_exif_date' => $imageData['exif_date'],
            'has_exif' => $imageData['has_exif'],
            'ticket_number' => $ticketNumber,
        ]);

        // Calculate fraud score
        $scoreResult = $this->fraud->calculateScore($paymentRequest);
        $paymentRequest->update([
            'fraud_score' => $scoreResult['score'],
            'fraud_flags' => $scoreResult['flags'],
        ]);

        // Notify all admins
        $admins = \App\Models\User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'payment_request',
                'title' => 'طلب دفع جديد',
                'message' => "💳 طلب دفع جديد من {$user->name} — الدرجة: {$scoreResult['score']}",
                'channel' => 'inapp',
            ]);
        }

        return response()->json([
            'success' => true,
            'ticket' => $ticketNumber,
            'message' => 'تم إرسال طلبك بنجاح. سيتم المراجعة من طرف الإدارة.',
        ]);
    }
}
