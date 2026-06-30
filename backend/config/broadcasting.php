<?php

return [
    'default' => env('BROADCAST_DRIVER', 'reverb'),

    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'app_id' => env('REVERB_APP_ID', 'edutn'),
            'key' => env('REVERB_APP_KEY', 'edutn-key'),
            'secret' => env('REVERB_APP_SECRET', 'edutn-secret'),
            'host' => env('REVERB_HOST', '127.0.0.1'),
            'port' => (int) env('REVERB_PORT', 8080),
            'scheme' => env('REVERB_SCHEME', 'http'),
            'use_tls' => env('REVERB_TLS', false),
        ],

        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY', 'edutn-key'),
            'secret' => env('PUSHER_APP_SECRET', 'edutn-secret'),
            'app_id' => env('PUSHER_APP_ID', 'edutn-app'),
            'options' => [
                'host' => env('PUSHER_HOST', '127.0.0.1'),
                'port' => (int) env('PUSHER_PORT', 6001),
                'scheme' => env('PUSHER_SCHEME', 'http'),
                'useTLS' => env('PUSHER_USE_TLS', false),
            ],
            'allowed_origins' => ['http://localhost:3000'],
        ],
    ],
];
