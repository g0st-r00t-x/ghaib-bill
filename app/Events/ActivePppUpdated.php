<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ActivePppUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $logs;

    public function __construct(array $logs)
    {
        $this->logs = $logs;
    }

    public function broadcastOn()
    {
        return new Channel('mikrotik-active-ppp');
    }

    public function broadcastWith()
    {
        return [
            'logs' => $this->logs,
            'timestamp' => now()->toDateTimeString(),
        ];
    }
}
