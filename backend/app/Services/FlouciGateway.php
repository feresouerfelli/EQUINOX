<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlouciGateway
{
    private string $publicKey;
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->publicKey = config('services.flouci.public_key');
        $this->secretKey = config('services.flouci.secret_key');
        $mode = config('services.flouci.mode', 'sandbox');
        $this->baseUrl = $mode === 'production'
            ? config('services.flouci.production_url')
            : config('services.flouci.sandbox_url');
    }

    private function authHeader(): string
    {
        return "Bearer {$this->publicKey}:{$this->secretKey}";
    }

    public function generatePayment(array $params): array
    {
        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => $this->authHeader(),
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/generate_payment", [
            'amount' => (string) $params['amount'], // millimes as string
            'developer_tracking_id' => $params['tracking_id'] ?? uniqid('EDUTN-'),
            'accept_card' => true,
            'success_link' => $params['success_link'] ?? url('/payment/success'),
            'fail_link' => $params['fail_link'] ?? url('/payment/fail'),
            'webhook' => url('/api/payments/flouci/webhook'),
            'client_id' => $params['client_email'] ?? '',
            'session_timeout_secs' => 1200,
        ]);

        $body = $response->json();

        if ($response->successful() && ($body['result']['success'] ?? false)) {
            return [
                'success' => true,
                'payment_id' => $body['result']['payment_id'],
                'payment_url' => $body['result']['link'],
                'tracking_id' => $body['result']['developer_tracking_id'],
            ];
        }

        Log::error('Flouci generatePayment failed', [
            'status' => $response->status(),
            'body' => $body,
        ]);

        return [
            'success' => false,
            'error' => $body['result']['message'] ?? 'Payment generation failed',
        ];
    }

    public function verifyPayment(string $paymentId): array
    {
        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => $this->authHeader(),
        ])->get("{$this->baseUrl}/verify_payment/{$paymentId}");

        $body = $response->json();

        if ($response->successful() && ($body['result']['success'] ?? false)) {
            $details = $body['result']['details'] ?? [];
            $status = $details['status'] ?? 'unknown';

            return [
                'success' => true,
                'status' => $status,
                'is_completed' => $status === 'SUCCESS',
                'payment_id' => $body['result']['payment_id'],
                'raw' => $body['result'],
            ];
        }

        return [
            'success' => false,
            'error' => 'Failed to verify payment',
        ];
    }
}
