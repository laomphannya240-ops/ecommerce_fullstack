<?php

return [
    'mode' => env('PAYMENT_MODE', 'mock'), // mock|live

    'khqr' => [
        'enabled' => ! empty(env('KHQR_MERCHANT_ID')),
        'base_url' => env('KHQR_API_BASE_URL'),
        'merchant_id' => env('KHQR_MERCHANT_ID'),
        'merchant_name' => env('KHQR_MERCHANT_NAME', env('APP_NAME', 'Store')),
        'api_token' => env('KHQR_API_TOKEN'),
        'webhook_secret' => env('KHQR_WEBHOOK_SECRET'),
        'currency' => env('KHQR_CURRENCY', 'USD'),
        'account_id' => env('BAKONG_ACCOUNT_ID'),
    ],

    'cod' => [
        'enabled' => filter_var(env('COD_ENABLED', true), FILTER_VALIDATE_BOOL),
    ],
];
