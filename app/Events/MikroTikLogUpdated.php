<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

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
        return new Channel('mikrotik-logs');
    }

    public function broadcastWith()
{
    return [
        'logs' => json_encode($this->logs),
        'timestamp' => now()->toDateTimeString(),
    ];
}

}
