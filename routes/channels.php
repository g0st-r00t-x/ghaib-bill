<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('mikrotik-status', function () {
    return true;
});
