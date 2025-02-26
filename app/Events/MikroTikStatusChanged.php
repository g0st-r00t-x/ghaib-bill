<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MikroTikStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Status koneksi
     * 
     * @var bool
     */
    public $status;
    
    /**
     * Pesan status
     * 
     * @var string
     */
    public $message;
    
    /**
     * Timestamp
     * 
     * @var string
     */
    public $timestamp;

    /**
     * Create a new event instance.
     * 
     * @param bool $status
     * @param string $message
     */
    public function __construct(bool $status, string $message)
    {
        $this->status = $status;
        $this->message = $message;
        $this->timestamp = now()->toIso8601String();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('mikrotik-status');
    }
    
    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'status.changed';
    }
}