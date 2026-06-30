<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class D17Gateway
{
    private string $merchantId;
    private string $merchantKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->merchantId = config('services.d17.merchant_id');
        $this->merchantKey = config('services.d17.merchant_key');
        $this->apiUrl = config('services.d17.api_url');
    }

    public function initiatePayment(array $params): array
    {
        if (empty($this->merchantId) || empty($this->merchantKey)) {
            Log::warning('D17 credentials not configured');
            return [
                'success' => false,
                'error' => 'D17 merchant credentials not configured. Contact La Poste Tunisienne to get API access.',
                'setup_url' => 'https://d17.tn/fr/commercant',
            ];
        }

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . base64_encode("{$this->merchantId}:{$this->merchantKey}"),
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/payments", [
                'merchant_id' => $this->merchantId,
                'amount' => $params['amount'], // millimes
                'currency' => 'TND',
                'reference' => $params['reference'] ?? uniqid('EDUTN-'),
                'callback_url' => url('/api/payments/d17/webhook'),
                'description' => $params['description'] ?? 'EQUINOX Payment',
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'payment_id' => $response->json('payment_id'),
                    'qr_code' => $response->json('qr_code'),
                    'deep_link' => $response->json('deep_link'),
                    'message' => 'Scan the QR code with D17 app to pay',
                ];
            }

            Log::error('D17 initiatePayment failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => $response->json('message', 'Payment initiation failed'),
            ];
        } catch (\Exception $e) {
            Log::error('D17 API error', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'D17 API unreachable. Ensure merchant credentials are configured.',
                'setup_url' => 'https://d17.tn/fr/commercant',
            ];
        }
    }

    public function checkStatus(string $paymentId): array
    {
        if (empty($this->merchantId) || empty($this->merchantKey)) {
            return ['success' => false, 'error' => 'D17 not configured'];
        }

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . base64_encode("{$this->merchantId}:{$this->merchantKey}"),
            ])->get("{$this->apiUrl}/payments/{$paymentId}");

            if ($response->successful()) {
                $status = $response->json('status', 'unknown');
                return [
                    'success' => true,
                    'status' => $status,
                    'is_completed' => $status === 'success',
                ];
            }

            return ['success' => false, 'error' => 'Status check failed'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'D17 API unreachable'];
        }
    }
}
