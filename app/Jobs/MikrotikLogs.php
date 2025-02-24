<?php

namespace App\Jobs;

use App\Http\Controllers\MikrotikController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Exception;

class MikrotikLogs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $Mikrotik = new MikrotikController();
            $Mikrotik->sendRealtimeLogs();
            
            // Re-dispatch the job to run again in 5 seconds
            self::dispatch()->delay(now()->addSeconds(10));
            
        } catch (Exception $e) {
            Log::error('Failed to process Mikrotik logs: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            // Re-dispatch even on error, but maybe with a longer delay
            self::dispatch()->delay(now()->addSeconds(10));
            
            throw $e;
        }
    }
}