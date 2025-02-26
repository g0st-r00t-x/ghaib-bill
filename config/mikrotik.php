<?php
// config/mikrotik.php

return [
    /*
    |--------------------------------------------------------------------------
    | MikroTik Connection Settings
    |--------------------------------------------------------------------------
    |
    | Pengaturan untuk koneksi ke router MikroTik
    |
    */

    'host' => env('MIKROTIK_HOST', '192.168.88.1'),
    'user' => env('MIKROTIK_USER', 'admin'),
    'pass' => env('MIKROTIK_PASS', ''),
    'port' => env('MIKROTIK_PORT', 8728),
    'timeout' => env('MIKROTIK_TIMEOUT', 10),
    
    /*
    |--------------------------------------------------------------------------
    | MikroTik Monitoring Settings
    |--------------------------------------------------------------------------
    |
    | Pengaturan untuk monitoring MikroTik
    |
    */
    
    'poll_interval' => env('MIKROTIK_POLL_INTERVAL', 10),
    'log_limit' => env('MIKROTIK_LOG_LIMIT', 50),
    'monitor_enabled' => env('MIKROTIK_MONITOR_ENABLED', true),
    'monitor_types' => explode(',', env('MIKROTIK_MONITOR_TYPES', 'logs')),
    
    /*
    |--------------------------------------------------------------------------
    | MikroTik Caching Settings
    |--------------------------------------------------------------------------
    |
    | Pengaturan untuk caching data MikroTik
    | Mengaktifkan cache sangat direkomendasikan untuk mengurangi beban router
    |
    */
    
    'use_cache' => env('MIKROTIK_USE_CACHE', true),
    'cache_ttl' => env('MIKROTIK_CACHE_TTL', 5), // Dalam detik
];