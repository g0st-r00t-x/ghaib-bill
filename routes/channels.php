<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('mikrotik-logs', function () {
    return true;
});
