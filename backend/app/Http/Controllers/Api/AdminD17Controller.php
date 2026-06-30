<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use App\Models\PaymentCode;
use App\Models\Subscription;
use App\Models\Notification;
use App\Models\FraudLog;
use App\Events\PaymentApproved;
use App\Events\PaymentRejected;
use App\Events\FraudAlert;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminD17Controller extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentRequest::with('user');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(50);

        // Append fraud flag labels
        $requests->getCollection()->transform(function ($item) {
            $item->fraud_flags_labels = array_map(
                [FraudDetectionService::class, 'flagToArabic'],
                $item->fraud_flags ?? []
            );
            $item->previous_bad_count = PaymentRequest::where('user_id', $item->user_id)
                ->whereIn('status', ['rejected', 'fraud'])
                ->count();
            return $item;
        });

        return response()->json($requests);
    }

    public function show($id)
    {
        $request = PaymentRequest::with(['user', 'paymentCode', 'approver'])
            ->findOrFail($id);

        $request->fraud_flags_labels = array_map(
            [FraudDetectionService::class, 'flagToArabic'],
            $request->fraud_flags ?? []
        );
        $request->previous_bad_count = PaymentRequest::where('user_id', $request->user_id)
            ->whereIn('status', ['rejected', 'fraud'])
            ->count();

        return response()->json($request);
    }

    public function screenshot($id)
    {
        $request = PaymentRequest::findOrFail($id);
        $path = $request->screenshot_path;

        if (!Storage::disk('private')->exists($path)) {
            return response()->json(['message' => 'Screenshot not found'], 404);
        }

        $url = Storage::disk('private')->temporaryUrl($request->screenshot_path, now()->addMinutes(10));

        return response()->json(['url' => $url]);
    }

    public function approve(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        if ($paymentRequest->status !== 'pending') {
            return response()->json(['message' => 'تمت معالجة هذا الطلب مسبقاً'], 422);
        }

        $admin = $request->user();

        // Mark payment request approved
        $paymentRequest->update([
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        // Mark code as used
        PaymentCode::where('id', $paymentRequest->payment_code_id)
            ->update(['status' => 'used']);

        // Create subscription
        Subscription::updateOrCreate(
            [
                'user_id' => $paymentRequest->user_id,
                'status' => 'active',
            ],
            [
                'plan' => 'premium',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'gateway' => 'd17',
                'amount_dt' => $paymentRequest->amount_dt,
            ]
        );

        // Create payment record in payments table
        \App\Models\Payment::create([
            'user_id' => $paymentRequest->user_id,
            'gateway' => 'd17',
            'gateway_reference' => $paymentRequest->ticket_number,
            'amount_dt' => $paymentRequest->amount_dt,
            'status' => 'success',
            'gateway_response' => [
                'ticket_number' => $paymentRequest->ticket_number,
                'fraud_score' => $paymentRequest->fraud_score,
            ],
        ]);

        // Notify student
        Notification::create([
            'user_id' => $paymentRequest->user_id,
            'type' => 'subscription_activated',
            'title' => 'اشتراك مفعّل',
            'message' => "🎉 تم تفعيل اشتراكك في EQUINOX! صلاحية حتى " . now()->addMonth()->format('Y-m-d'),
            'channel' => 'inapp',
        ]);

        // Broadcast real-time notification
        broadcast(new PaymentApproved(
            $paymentRequest->user_id,
            'تم تفعيل اشتراكك بنجاح!',
            now()->addMonth()->toDateString()
        ))->toOthers();

        // Send SMS
        $student = User::find($paymentRequest->user_id);
        if ($student && $student->phone) {
            app(SmsService::class)->send(
                $student->phone,
                "EQUINOX: تم تفعيل اشتراكك بنجاح! صلاحية حتى " . now()->addMonth()->format('Y-m-d')
            );
        }

        return response()->json([
            'message' => 'تم تفعيل الاشتراك بنجاح',
            'subscription_end' => now()->addMonth()->toDateString(),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        if ($paymentRequest->status !== 'pending') {
            return response()->json(['message' => 'تمت معالجة هذا الطلب مسبقاً'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $paymentRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Free up user to submit again
        Notification::create([
            'user_id' => $paymentRequest->user_id,
            'type' => 'payment_rejected',
            'title' => 'طلب دفع مرفوض',
            'message' => 'للأسف، تعذّر التحقق من دفعك. تواصل معنا على WhatsApp للمساعدة',
            'channel' => 'inapp',
        ]);

        // Broadcast real-time notification
        broadcast(new PaymentRejected(
            $paymentRequest->user_id,
            'تم رفض طلب الدفع. تواصل معنا للمساعدة.'
        ))->toOthers();

        // Send SMS
        $student = User::find($paymentRequest->user_id);
        if ($student && $student->phone) {
            app(SmsService::class)->send(
                $student->phone,
                "EQUINOX: تم رفض طلب الدفع. تواصل معنا على WhatsApp للمساعدة."
            );
        }

        return response()->json(['message' => 'تم رفض الطلب']);
    }

    public function reportFraud(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        if ($paymentRequest->status !== 'pending') {
            return response()->json(['message' => 'تمت معالجة هذا الطلب مسبقاً'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $admin = $request->user();

        // Mark as fraud
        $paymentRequest->update([
            'status' => 'fraud',
            'rejection_reason' => $validated['reason'],
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        // Increment fraud strikes
        $user = User::find($paymentRequest->user_id);
        $strikes = $user->fraud_strikes + 1;
        $update = ['fraud_strikes' => $strikes];

        if ($strikes >= 3) {
            $update['is_fraud_banned'] = true;
            $update['banned_until'] = now()->addDays(7);
        }

        $user->update($update);

        // Log fraud
        FraudLog::create([
            'user_id' => $paymentRequest->user_id,
            'request_id' => $paymentRequest->id,
            'reason' => $validated['reason'],
            'reported_by' => $admin->id,
        ]);

        // Notify student
        $message = $strikes >= 3
            ? 'تم إيقاف حسابك مؤقتاً بسبب نشاط مشبوه. تواصل معنا'
            : 'تم الإبلاغ عن طلبك كطلب مشبوه';

        Notification::create([
            'user_id' => $paymentRequest->user_id,
            'type' => 'fraud_reported',
            'title' => 'نشاط مشبوه',
            'message' => $message,
            'channel' => 'inapp',
        ]);

        // Broadcast fraud alert to admins
        broadcast(new FraudAlert(
            $admin->id,
            $user->name,
            $validated['reason'],
            $paymentRequest->fraud_score
        ));

        return response()->json([
            'message' => 'تم الإبلاغ عن احتيال',
            'fraud_strikes' => $strikes,
            'user_banned' => $strikes >= 3,
        ]);
    }
}
