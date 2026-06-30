<?php

namespace App\Services;

use App\Models\PaymentRequest;
use App\Models\PaymentCode;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FraudDetectionService
{
    /**
     * Validate all checks inside a DB transaction with row-level locking
     * to prevent race conditions (2 simultaneous submissions).
     */
    public function validateBeforeSubmit(int $userId, string $submittedCode, $file): array
    {
        // Wrap ALL checks in a transaction with lockForUpdate on the user row.
        // This serializes concurrent requests for the same user.
        return DB::transaction(function () use ($userId, $submittedCode, $file) {

            // Lock the user row — any concurrent request for same user waits here
            $user = User::where('id', $userId)->lockForUpdate()->first();

            // CHECK: Fraud ban
            if ($user->is_fraud_banned) {
                if ($user->banned_until && $user->banned_until->isFuture()) {
                    return ['pass' => false, 'error' => 'fraud_banned', 'message' => 'حسابك موقوف مؤقتاً. تواصل مع الدعم'];
                }
                $user->update(['is_fraud_banned' => false, 'banned_until' => null]);
            }

            // CHECK 1: File type
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                return ['pass' => false, 'error' => 'invalid_file_type', 'message' => 'ارفع صورة فقط (JPG أو PNG)'];
            }

            // CHECK 2: File size (min 50KB, max 10MB)
            if ($file->getSize() < 50000) {
                return ['pass' => false, 'error' => 'file_too_small', 'message' => 'الصورة صغيرة جداً (أقل من 50KB). ارفع screenshot واضح'];
            }
            if ($file->getSize() > 10 * 1024 * 1024) {
                return ['pass' => false, 'error' => 'file_too_large', 'message' => 'الصورة كبيرة جداً (أكثر من 10MB)'];
            }

            // CHECK 3: Unique code validation (also lock the code row)
            $code = PaymentCode::where('user_id', $userId)
                ->where('code', $submittedCode)
                ->where('status', 'active')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (!$code) {
                $expiredCode = PaymentCode::where('user_id', $userId)
                    ->where('code', $submittedCode)
                    ->first();
                if ($expiredCode) {
                    return ['pass' => false, 'error' => 'code_expired', 'message' => 'انتهت صلاحية الرمز. احصل على رمز جديد'];
                }
                return ['pass' => false, 'error' => 'code_mismatch', 'message' => 'الرمز اللي أدخلته غلط. تأكد من الرمز اللي كتبته في ملاحظة الدفع'];
            }

            // CHECK 4: Rate limit — max 3 per 24h
            $recentCount = PaymentRequest::where('user_id', $userId)
                ->where('created_at', '>', Carbon::now()->subDay())
                ->count();
            if ($recentCount >= 3) {
                return ['pass' => false, 'error' => 'rate_limit', 'message' => 'تجاوزت عدد المحاولات (3 في اليوم). حاول غداً'];
            }

            // CHECK 5: Active subscription
            $activeSub = \App\Models\Subscription::where('user_id', $userId)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();
            if ($activeSub) {
                return ['pass' => false, 'error' => 'already_subscribed', 'message' => 'عندك اشتراك نشط بالفعل'];
            }

            // CHECK 6: Pending request (also lock existing pending rows)
            $pending = PaymentRequest::where('user_id', $userId)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->first();
            if ($pending) {
                return ['pass' => false, 'error' => 'pending_exists', 'message' => 'عندك طلب في انتظار المراجعة. استنّى حتى يتحقق الأدمن'];
            }

            // CHECK 7: Hash duplicate (lock the hash row to prevent race)
            $hash = hash('sha256', file_get_contents($file));
            $existingHash = PaymentRequest::where('screenshot_hash', $hash)
                ->lockForUpdate()
                ->first();
            if ($existingHash) {
                return ['pass' => false, 'error' => 'hash_duplicate', 'message' => 'هذه الصورة استُخدمت مسبقاً. إذا دفعت فعلاً تواصل معنا'];
            }

            return ['pass' => true, 'code' => $code, 'hash' => $hash];
        }, 5); // 5 second timeout for the lock
    }

    public function analyzeImage(string $filePath): array
    {
        $result = [
            'width' => null,
            'height' => null,
            'exif_date' => null,
            'has_exif' => false,
        ];

        $imageInfo = @getimagesize($filePath);
        if ($imageInfo) {
            $result['width'] = $imageInfo[0];
            $result['height'] = $imageInfo[1];
        }

        $exif = @exif_read_data($filePath);
        if ($exif && isset($exif['DateTimeOriginal'])) {
            $result['has_exif'] = true;
            $result['exif_date'] = Carbon::parse($exif['DateTimeOriginal']);
        } elseif ($exif && isset($exif['DateTime'])) {
            $result['has_exif'] = true;
            $result['exif_date'] = Carbon::parse($exif['DateTime']);
        }

        return $result;
    }

    public function calculateScore(PaymentRequest $req): array
    {
        $flags = [];

        if (!$req->code_match) {
            $flags[] = 'code_mismatch';
        }

        if (!$req->has_exif) {
            $flags[] = 'no_exif_data';
        }

        if ($req->image_exif_date) {
            $diff = Carbon::parse($req->image_exif_date)->diffInDays($req->created_at);
            if ($diff > 7) {
                $flags[] = 'old_image_date';
            }
        }

        if ($req->image_width < 300 || $req->image_height < 400) {
            $flags[] = 'small_image_dimensions';
        }

        $badHistory = PaymentRequest::where('user_id', $req->user_id)
            ->whereIn('status', ['rejected', 'fraud'])
            ->count();
        if ($badHistory > 0) {
            $flags[] = 'bad_history';
        }

        $code = PaymentCode::find($req->payment_code_id);
        if ($code) {
            $elapsed = Carbon::parse($code->created_at)->diffInMinutes($req->created_at);
            if ($elapsed < 1) {
                $flags[] = 'submitted_too_fast';
            }
        }

        $flagCount = count($flags);
        if ($flagCount === 0) {
            $score = 'clean';
        } elseif ($flagCount <= 2) {
            $score = 'warning';
        } else {
            $score = 'suspect';
        }

        return ['score' => $score, 'flags' => $flags];
    }

    public static function flagToArabic(string $flag): string
    {
        return match ($flag) {
            'code_mismatch' => 'الرمز غير مطابق',
            'no_exif_data' => 'الصورة ما عندهاش بيانات EXIF',
            'old_image_date' => 'تاريخ الصورة قديم (أكثر من 7 أيام)',
            'small_image_dimensions' => 'أبعاد الصورة صغيرة',
            'bad_history' => 'للطالب طلبات مرفوضة سابقاً',
            'submitted_too_fast' => 'تم الإرسال بسرعة مشبوهة',
            default => $flag,
        };
    }
}
