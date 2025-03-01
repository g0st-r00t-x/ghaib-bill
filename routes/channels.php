<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('mikrotik-logs', function ($user) {
    return $user !== null; // Hanya pengguna yang login yang bisa mengakses
});

Broadcast::channel('mikrotik-active-ppp', function ($user) {
    return $user !== null; // Hanya pengguna yang login
});

Broadcast::channel('mikrotik-active-hotspot', function ($user) {
    return $user !== null; // Hanya pengguna yang login
});
