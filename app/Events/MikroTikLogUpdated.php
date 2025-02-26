<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MikroTikLogUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $logs;

    public function __construct(array $logs)
    { 
        $this->logs = $logs;
    }

    public function broadcastOn()
    {
        Log::info('Data', $this->logs);
        return new Channel('mikrotik-logs');
    }

    public function broadcastWith()
{
    return [
        'logs' => $this->logs,
        'timestamp' => now()->toDateTimeString(),
    ];
}

}
