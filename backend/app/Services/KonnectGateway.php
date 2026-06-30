<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KonnectGateway
{
    private string $apiKey;
    private string $walletId;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.konnect.api_key');
        $this->walletId = config('services.konnect.wallet_id');
        $mode = config('services.konnect.mode', 'sandbox');
        $this->baseUrl = $mode === 'production'
            ? config('services.konnect.production_url')
            : config('services.konnect.sandbox_url');
    }

    public function initPayment(array $params): array
    {
        $response = Http::withoutVerifying()->withHeaders([
            'x-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/payments/init-payment", [
            'receiverWalletId' => $this->walletId,
            'token' => 'TND',
            'amount' => $params['amount'], // millimes
            'type' => 'immediate',
            'description' => $params['description'] ?? 'EQUINOX Payment',
            'acceptedPaymentMethods' => ['wallet', 'bank_card', 'e-DINAR'],
            'lifespan' => $params['lifespan'] ?? 30,
            'checkoutForm' => true,
            'addPaymentFeesToAmount' => false,
            'firstName' => $params['first_name'] ?? '',
            'lastName' => $params['last_name'] ?? '',
            'phoneNumber' => $params['phone'] ?? '',
            'email' => $params['email'] ?? '',
            'orderId' => $params['order_id'] ?? '',
            'webhook' => url('/api/payments/konnect/webhook'),
            'theme' => 'light',
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'pay_url' => $response->json('payUrl'),
                'payment_ref' => $response->json('paymentRef'),
            ];
        }

        Log::error('Konnect initPayment failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return [
            'success' => false,
            'error' => $response->json('message', 'Payment initiation failed'),
        ];
    }

    public function getPaymentDetails(string $paymentRef): array
    {
        $response = Http::withoutVerifying()->withHeaders([
            'x-api-key' => $this->apiKey,
        ])->get("{$this->baseUrl}/payments/{$paymentRef}");

        if ($response->successful()) {
            $payment = $response->json('payment', []);
            $status = $payment['status'] ?? 'unknown';
            $transactions = $payment['transactions'] ?? [];
            $txnStatus = $transactions[0]['status'] ?? null;

            return [
                'success' => true,
                'status' => $status,
                'transaction_status' => $txnStatus,
                'is_completed' => $status === 'completed' && $txnStatus === 'success',
                'amount' => $payment['amount'] ?? 0,
                'raw' => $payment,
            ];
        }

        return [
            'success' => false,
            'error' => 'Failed to fetch payment details',
        ];
    }
}
