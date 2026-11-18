<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Storefront settings
    |--------------------------------------------------------------------------
    |
    | These values are shared by the API (checkout calculations) and exposed
    | to the frontend through the /api/settings endpoint.
    |
    */

    'currency' => env('STORE_CURRENCY', 'USD'),

    'shipping' => [
        'flat_fee' => (float) env('STORE_SHIPPING_FLAT_FEE', 5),
        'free_over' => (float) env('STORE_FREE_SHIPPING_OVER', 150),
    ],

    'tax_rate' => (float) env('STORE_TAX_RATE', 0),

    'payment_methods' => ['cod', 'khqr'],

];
