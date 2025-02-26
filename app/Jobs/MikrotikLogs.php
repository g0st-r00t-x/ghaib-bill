<?php

namespace App\Jobs;

use App\Services\MikrotikService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Events\MikroTikLogUpdated;
use Exception;

class MikrotikLogs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60;
    public $timeout = 30;
    
    // Menghindari duplikasi job dalam antrian
    public $uniqueFor = 60;

    /**
     * Interval polling dalam detik
     */
    protected int $pollInterval;
    /**
     * Create a new job instance.
     */
    public function __construct(int $pollInterval = 10)
    {
        // Menggunakan property promotion PHP 8+
        $this->pollInterval = $pollInterval;
    }

    /**
     * Execute the job.
     */
    public function handle(MikrotikService $mikrotikService): void
    {
        try {
            // Cek koneksi terlebih dahulu
            if (!$mikrotikService->isConnected()) {
                Log::warning('MikroTik service tidak terhubung, mencoba kembali dalam ' . $this->pollInterval . ' detik');
                $this->release($this->pollInterval);
                return;
            }

            // Ambil logs dari MikrotikService dan lakukan broadcasting
            $logs = $mikrotikService->getLogs(50); // Batasi jumlah log
            
            // Hanya broadcast jika ada log
            if (!empty($logs)) {
                event(new MikroTikLogUpdated($logs));
            }

            // Re-dispatch the job untuk berjalan lagi sesuai interval
            self::dispatch($this->pollInterval)->delay(now()->addSeconds($this->pollInterval));

        } catch (Exception $e) {
            Log::error('Gagal memproses Mikrotik logs: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            // Re-dispatch dengan delay yang lebih panjang jika terjadi kesalahan
            self::dispatch($this->pollInterval)->delay(now()->addSeconds($this->pollInterval * 2));
        }
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return 'mikrotik_logs_monitor';
    }
}