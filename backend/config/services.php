<?php

return [
    'google' => [
        'api_key' => env('GOOGLE_API_KEY', ''),
    ],

    'konnect' => [
        'api_key' => env('KONNECT_API_KEY', ''),
        'wallet_id' => env('KONNECT_WALLET_ID', ''),
        'sandbox_url' => 'https://api.sandbox.konnect.network/api/v2',
        'production_url' => 'https://api.prod.konnect.network/api/v2',
        'mode' => env('KONNECT_MODE', 'sandbox'),
    ],

    'flouci' => [
        'public_key' => env('FLOUCI_PUBLIC_KEY', ''),
        'secret_key' => env('FLOUCI_SECRET_KEY', ''),
        'sandbox_url' => 'https://developers.flouci.com/api/v2',
        'production_url' => 'https://developers.flouci.com/api/v2',
        'mode' => env('FLOUCI_MODE', 'sandbox'),
    ],

    'd17' => [
        'merchant_id' => env('D17_MERCHANT_ID', ''),
        'merchant_key' => env('D17_MERCHANT_KEY', ''),
        'api_url' => env('D17_API_URL', 'https://api.d17.com.tn/v1'),
    ],

    'twilio' => [
        'account_sid' => env('TWILIO_ACCOUNT_SID', ''),
        'auth_token' => env('TWILIO_AUTH_TOKEN', ''),
        'from_number' => env('TWILIO_FROM_NUMBER', ''),
    ],
];
