<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\KonnectGateway;
use App\Services\FlouciGateway;
use App\Services\D17Gateway;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private KonnectGateway $konnect;
    private FlouciGateway $flouci;
    private D17Gateway $d17;

    public function __construct(KonnectGateway $konnect, FlouciGateway $flouci, D17Gateway $d17)
    {
        $this->konnect = $konnect;
        $this->flouci = $flouci;
        $this->d17 = $d17;
    }

    private function getPlanAmount(string $plan): float
    {
        return match ($plan) {
            'premium' => 39.00,
            default => 0,
        };
    }

    private function getAmountMillimes(float $amount): int
    {
        return (int) ($amount * 1000);
    }

    public function initiateD17(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string|min:8|max:8',
            'plan' => 'required|in:free,premium,enterprise',
        ]);

        $amount = $this->getPlanAmount($validated['plan']);
        if ($amount <= 0) {
            return response()->json(['message' => 'Free plan requires no payment'], 400);
        }

        $user = $request->user();
        $payment = Payment::create([
            'user_id' => $user->id,
            'gateway' => 'd17',
            'amount_dt' => $amount,
            'status' => 'pending',
            'gateway_response' => ['phone' => $validated['phone']],
        ]);

        $result = $this->d17->initiatePayment([
            'amount' => $this->getAmountMillimes($amount),
            'reference' => "EDUTN-{$payment->id}",
            'description' => "EQUINOX Premium - {$validated['plan']}",
        ]);

        if ($result['success']) {
            $payment->update([
                'gateway_reference' => $result['payment_id'] ?? null,
                'gateway_response' => array_merge($payment->gateway_response ?? [], $result),
            ]);
            return response()->json([
                'payment_id' => $payment->id,
                'qr_code' => $result['qr_code'] ?? null,
                'deep_link' => $result['deep_link'] ?? null,
                'message' => $result['message'] ?? 'Scan QR code with D17 app',
            ]);
        }

        $payment->update(['status' => 'failed']);
        return response()->json([
            'message' => $result['error'] ?? 'Payment initiation failed',
            'setup_url' => $result['setup_url'] ?? null,
        ], 422);
    }

    public function initiateKonnect(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:premium,enterprise',
        ]);

        $amount = $this->getPlanAmount($validated['plan']);
        if ($amount <= 0) {
            return response()->json(['message' => 'Free plan requires no payment'], 400);
        }

        $user = $request->user();
        $payment = Payment::create([
            'user_id' => $user->id,
            'gateway' => 'konnect',
            'amount_dt' => $amount,
            'status' => 'pending',
        ]);

        $nameParts = explode(' ', $user->name, 2);
        $result = $this->konnect->initPayment([
            'amount' => $this->getAmountMillimes($amount),
            'description' => "EQUINOX Premium",
            'first_name' => $nameParts[0] ?? '',
            'last_name' => $nameParts[1] ?? '',
            'phone' => $user->phone ?? '',
            'email' => $user->email,
            'order_id' => "EDUTN-{$payment->id}",
        ]);

        if ($result['success']) {
            $payment->update([
                'gateway_reference' => $result['payment_ref'],
            ]);
            return response()->json([
                'payment_id' => $payment->id,
                'pay_url' => $result['pay_url'],
                'payment_ref' => $result['payment_ref'],
            ]);
        }

        $payment->update(['status' => 'failed']);
        return response()->json(['message' => $result['error'] ?? 'Payment initiation failed'], 422);
    }

    public function initiateFlouci(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:premium,enterprise',
        ]);

        $amount = $this->getPlanAmount($validated['plan']);
        if ($amount <= 0) {
            return response()->json(['message' => 'Free plan requires no payment'], 400);
        }

        $user = $request->user();
        $payment = Payment::create([
            'user_id' => $user->id,
            'gateway' => 'flouci',
            'amount_dt' => $amount,
            'status' => 'pending',
        ]);

        $result = $this->flouci->generatePayment([
            'amount' => $this->getAmountMillimes($amount),
            'tracking_id' => "EDUTN-{$payment->id}",
            'client_email' => $user->email,
            'success_link' => url('/payment/success'),
            'fail_link' => url('/payment/fail'),
        ]);

        if ($result['success']) {
            $payment->update([
                'gateway_reference' => $result['payment_id'],
            ]);
            return response()->json([
                'payment_id' => $payment->id,
                'payment_url' => $result['payment_url'],
                'payment_id_gateway' => $result['payment_id'],
            ]);
        }

        $payment->update(['status' => 'failed']);
        return response()->json(['message' => $result['error'] ?? 'Payment initiation failed'], 422);
    }

    public function submitBankProof(Request $request)
    {
        $validated = $request->validate([
            'plan' => 'required|in:premium,enterprise',
            'proof' => 'required|file|mimes:jpg,png,pdf|max:5120',
        ]);

        $amount = $this->getPlanAmount($validated['plan']);
        $proofPath = $request->file('proof')->store('bank-proofs', 'public');

        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'gateway' => 'bank',
            'amount_dt' => $amount,
            'status' => 'pending',
            'gateway_response' => ['proof_path' => $proofPath],
        ]);

        return response()->json([
            'payment_id' => $payment->id,
            'message' => 'Proof submitted. Awaiting admin approval.',
        ]);
    }

    public function d17Webhook(Request $request)
    {
        $reference = $request->input('reference') ?? $request->input('payment_ref');
        $status = $request->input('status');

        Log::info('D17 webhook received', $request->all());

        $payment = Payment::where('gateway_reference', $reference)
            ->orWhere('id', str_replace('EDUTN-', '', $reference ?? ''))
            ->first();

        if ($payment) {
            $success = in_array($status, ['success', 'completed', 'SUCCESS']);
            $payment->update([
                'status' => $success ? 'success' : 'failed',
                'gateway_response' => array_merge($payment->gateway_response ?? [], $request->all()),
            ]);

            if ($success) {
                $this->activateSubscription($payment);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function konnectWebhook(Request $request)
    {
        $paymentRef = $request->query('payment_ref');

        Log::info('Konnect webhook received', ['payment_ref' => $paymentRef]);

        if (!$paymentRef) {
            return response()->json(['error' => 'Missing payment_ref'], 400);
        }

        $payment = Payment::where('gateway_reference', $paymentRef)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $result = $this->konnect->getPaymentDetails($paymentRef);

        if ($result['success'] && $result['is_completed']) {
            $payment->update([
                'status' => 'success',
                'gateway_response' => $result['raw'] ?? $result,
            ]);
            $this->activateSubscription($payment);
        } elseif ($result['success']) {
            $payment->update([
                'gateway_response' => $result['raw'] ?? $result,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function flouciWebhook(Request $request)
    {
        $body = $request->all();
        $paymentId = $body['payment_id'] ?? $body['result']['payment_id'] ?? null;

        Log::info('Flouci webhook received', ['payment_id' => $paymentId]);

        if (!$paymentId) {
            return response()->json(['error' => 'Missing payment_id'], 400);
        }

        $payment = Payment::where('gateway_reference', $paymentId)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        $result = $this->flouci->verifyPayment($paymentId);

        if ($result['success'] && $result['is_completed']) {
            $payment->update([
                'status' => 'success',
                'gateway_response' => $result['raw'] ?? $result,
            ]);
            $this->activateSubscription($payment);
        } elseif ($result['success']) {
            $payment->update([
                'gateway_response' => $result['raw'] ?? $result,
            ]);
        }

        return response()->json(['status' => 'ok']);
    }

    public function checkStatus(Request $request, string $id)
    {
        $payment = Payment::where('user_id', $request->user()->id)->findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json([
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);
        }

        switch ($payment->gateway) {
            case 'konnect':
                if ($payment->gateway_reference) {
                    $result = $this->konnect->getPaymentDetails($payment->gateway_reference);
                    if ($result['success'] && $result['is_completed']) {
                        $payment->update(['status' => 'success']);
                        $this->activateSubscription($payment);
                    }
                }
                break;

            case 'flouci':
                if ($payment->gateway_reference) {
                    $result = $this->flouci->verifyPayment($payment->gateway_reference);
                    if ($result['success'] && $result['is_completed']) {
                        $payment->update(['status' => 'success']);
                        $this->activateSubscription($payment);
                    }
                }
                break;

            case 'd17':
                if ($payment->gateway_reference) {
                    $result = $this->d17->checkStatus($payment->gateway_reference);
                    if ($result['success'] && $result['is_completed']) {
                        $payment->update(['status' => 'success']);
                        $this->activateSubscription($payment);
                    }
                }
                break;
        }

        $payment->refresh();
        return response()->json([
            'payment_id' => $payment->id,
            'status' => $payment->status,
        ]);
    }

    public function history(Request $request)
    {
        $payments = Payment::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    public function invoice(Request $request, $id)
    {
        $payment = Payment::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json(['payment' => $payment]);
    }

    private function activateSubscription(Payment $payment): void
    {
        Subscription::updateOrCreate(
            [
                'user_id' => $payment->user_id,
                'status' => 'active',
            ],
            [
                'plan' => $payment->amount_dt >= 39 ? 'premium' : 'free',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'gateway' => $payment->gateway,
                'amount_dt' => $payment->amount_dt,
            ]
        );
    }
}
