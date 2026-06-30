<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $accountSid;
    protected string $authToken;
    protected string $fromNumber;
    protected string $apiUrl;

    public function __construct()
    {
        $this->accountSid = config('services.twilio.account_sid', '');
        $this->authToken = config('services.twilio.auth_token', '');
        $this->fromNumber = config('services.twilio.from_number', '');
        $this->apiUrl = 'https://api.twilio.com/2010-04-01/Accounts';
    }

    public function send(string $to, string $message): bool
    {
        if (empty($this->accountSid) || empty($this->authToken)) {
            Log::warning('[SMS] Twilio not configured. Skipping SMS to: ' . $to);
            return false;
        }

        // Normalize Tunisian phone numbers
        $to = $this->normalizePhone($to);

        if (!$to) {
            Log::warning('[SMS] Invalid phone number: ' . $to);
            return false;
        }

        try {
            $response = Http::withBasicAuth($this->accountSid, $this->authToken)
                ->asForm()
                ->post("{$this->apiUrl}/{$this->accountSid}/Messages.json", [
                    'To' => $to,
                    'From' => $this->fromNumber,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info('[SMS] Sent successfully', ['to' => $to, 'sid' => $response->json('sid')]);
                return true;
            }

            Log::error('[SMS] Failed to send', ['to' => $to, 'status' => $response->status(), 'body' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('[SMS] Exception', ['to' => $to, 'error' => $e->getMessage()]);
            return false;
        }
    }

    public function sendBulk(array $numbers, string $message): array
    {
        $results = [];
        foreach ($numbers as $number) {
            $results[$number] = $this->send($number, $message);
        }
        return $results;
    }

    protected function normalizePhone(string $phone): ?string
    {
        $phone = preg_replace('/[\s\-\(\)]/', '', trim($phone));

        // Already international
        if (preg_match('/^\+216\d{8}$/', $phone)) {
            return $phone;
        }

        // Local Tunisian format
        if (preg_match('/^(\d{8})$/', $phone)) {
            return '+216' . $phone;
        }

        // With 0 prefix
        if (preg_match('/^0(\d{8})$/', $phone)) {
            return '+216' . $1;
        }

        return null;
    }
}
