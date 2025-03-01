<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mikrotik Connection Settings
    |--------------------------------------------------------------------------
    |
    | Here you can configure your Mikrotik connection settings
    |
    */

    // Mikrotik Router connection details
    'host' => env('MIKROTIK_HOST', '192.168.1.1'),
    'user' => env('MIKROTIK_USER', 'admin'),
    'pass' => env('MIKROTIK_PASS', ''),
    
    // Connection settings
    'port' => env('MIKROTIK_PORT', 8728),
    'ssl' => env('MIKROTIK_SSL', false),
    'timeout' => env('MIKROTIK_TIMEOUT', 3),
    'attempts' => env('MIKROTIK_ATTEMPTS', 5),
    'delay' => env('MIKROTIK_DELAY', 3),
    
    // Debug mode
    'debug' => env('MIKROTIK_DEBUG', false),
    
    // Auto-connect on service initialization
    'auto_connect' => env('MIKROTIK_AUTO_CONNECT', false),
    
    // Session persistence - if true, will maintain connection through multiple requests
    'persistent' => env('MIKROTIK_PERSISTENT', true),
];