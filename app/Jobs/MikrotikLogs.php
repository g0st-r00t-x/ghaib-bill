<?php

namespace App\Jobs;

use App\Services\MikrotikService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Events\MikroTikLogUpdated;
use App\Events\MikroTikStatusChanged;
use Exception;

class MikrotikLogs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = 60;
    public $timeout = 30;
    
    // Menghindari duplikasi job dalam antrian
    public $uniqueFor = 300;

    /**
     * Interval polling dalam detik
     */
    protected $pollInterval;
    
    /**
     * Jenis data yang akan dimonitor
     * logs, pppoe, hotspot, dhcp
     */
    protected $dataTypes = [];

    /**
     * Create a new job instance.
     * 
     * @param array $dataTypes Jenis data yang akan dimonitor
     * @param int $pollInterval Interval polling dalam detik
     */
    public function __construct(array $dataTypes = ['logs'], int $pollInterval = 10)
    {
        $this->dataTypes = $dataTypes;
        $this->pollInterval = $pollInterval;
    }

    /**
     * Execute the job.
     */
    public function handle(MikrotikService $mikrotikService): void
    {
        // Simpan status koneksi sebelumnya
        $prevConnectionStatus = Cache::get('mikrotik_connection_status', false);
        $currentConnectionStatus = false;
        
        try {
            // Cek koneksi terlebih dahulu
            if (!$mikrotikService->isConnected()) {
                if (!$mikrotikService->connect()) {
                    $this->handleConnectionFailure($prevConnectionStatus);
                    return;
                }
            }
            
            $currentConnectionStatus = true;
            
            // Jika status berubah dari offline ke online, kirim event
            if (!$prevConnectionStatus && $currentConnectionStatus) {
                event(new MikroTikStatusChanged(true, 'MikroTik router kembali online'));
                Log::info('MikroTik router kembali online');
            }
            
            // Simpan status koneksi saat ini
            Cache::put('mikrotik_connection_status', true, now()->addMinutes(5));
            
            // Ambil dan broadcast data sesuai jenis
            $this->processDataTypes($mikrotikService);
            
            // Schedule job berikutnya
            $this->scheduleNextJob();
            
        } catch (Exception $e) {
            Log::error('Gagal memproses Mikrotik monitoring: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            
            $this->handleConnectionFailure($prevConnectionStatus);
        }
    }
    
    /**
     * Proses data sesuai jenis yang diminta
     * 
     * @param MikrotikService $mikrotikService
     */
    private function processDataTypes(MikrotikService $mikrotikService): void
    {
        foreach ($this->dataTypes as $type) {
            try {
                switch ($type) {
                    case 'logs':
                        $this->processLogs($mikrotikService);
                        break;
                    case 'pppoe':
                        $this->processPPPoE($mikrotikService);
                        break;
                    case 'hotspot':
                        $this->processHotspot($mikrotikService);
                        break;
                    case 'dhcp':
                        $this->processDHCP($mikrotikService);
                        break;
                }
            } catch (Exception $e) {
                Log::error("Gagal memproses data tipe {$type}: " . $e->getMessage(), [
                    'exception' => $e
                ]);
                // Lanjutkan dengan tipe data berikutnya
                continue;
            }
        }
    }
    
    /**
     * Proses dan kirim log ke client
     * 
     * @param MikrotikService $mikrotikService
     */
    private function processLogs(MikrotikService $mikrotikService): void
    {
        // Dapatkan logs terakhir
        $logLimit = config('mikrotik.log_limit', 50);
        $logs = $mikrotikService->getLogs();
        
        // Dapatkan ID log terakhir dari cache
        $lastLogId = Cache::get('mikrotik_last_log_id');
        
        // Filter hanya log baru
        $newLogs = $this->filterNewLogs($logs, $lastLogId);
        
        // Jika ada log baru, broadcast ke client
        if (!empty($newLogs)) {
            event(new MikroTikStatusChanged(true, 'MikroTik router kembali online'));
            
            // Simpan ID log terakhir
            if (!empty($logs)) {
                Cache::put('mikrotik_last_log_id', $logs[0]['.id'] ?? null, now()->addDay());
            }
            
            Log::debug('Mengirim ' . count($newLogs) . ' log baru ke client');
        }
    }
    
    /**
     * Filter hanya log baru
     * 
     * @param array $logs
     * @param string|null $lastLogId
     * @return array
     */
    private function filterNewLogs(array $logs, ?string $lastLogId): array
    {
        if ($lastLogId === null) {
            return $logs;
        }
        
        $newLogs = [];
        foreach ($logs as $log) {
            if ($log['.id'] === $lastLogId) {
                break;
            }
            $newLogs[] = $log;
        }
        
        return $newLogs;
    }
    
    /**
     * Proses dan kirim data PPPoE ke client
     * 
     * @param MikrotikService $mikrotikService
     */
    private function processPPPoE(MikrotikService $mikrotikService): void
    {
        $activePPPoE = $mikrotikService->getActivePPPoEUsers();
        // Kirim event PPPoE jika diperlukan
        // event(new MikroTikPPPoEUpdated($activePPPoE));
    }
    
    /**
     * Proses dan kirim data Hotspot ke client
     * 
     * @param MikrotikService $mikrotikService
     */
    private function processHotspot(MikrotikService $mikrotikService): void
    {
        $activeHotspot = $mikrotikService->getActiveHotspotUsers();
        // Kirim event Hotspot jika diperlukan
        // event(new MikroTikHotspotUpdated($activeHotspot));
    }
    
    /**
     * Proses dan kirim data DHCP ke client
     * 
     * @param MikrotikService $mikrotikService
     */
    private function processDHCP(MikrotikService $mikrotikService): void
    {
        $dhcpLeases = $mikrotikService->getDHCPLeases();
        // Kirim event DHCP jika diperlukan
        // event(new MikroTikDHCPUpdated($dhcpLeases));
    }
    
    /**
     * Tangani kegagalan koneksi
     * 
     * @param bool $prevStatus
     */
    private function handleConnectionFailure(bool $prevStatus): void
    {
        // Jika status berubah dari online ke offline, kirim event
        if ($prevStatus) {
            event(new MikroTikStatusChanged(false, 'MikroTik router offline'));
            Log::warning('MikroTik router offline');
        }
        
        // Simpan status offline
        Cache::put('mikrotik_connection_status', false, now()->addMinutes(5));
        
        // Schedule job berikutnya dengan delay lebih panjang
        $retryInterval = min($this->pollInterval * 2, 300); // Maksimal 5 menit
        self::dispatch($this->dataTypes, $this->pollInterval)
            ->delay(now()->addSeconds($retryInterval));
    }
    
    /**
     * Schedule job berikutnya
     */
    private function scheduleNextJob(): void
    {
        // Jadwalkan job berikutnya sesuai interval
        self::dispatch($this->dataTypes, $this->pollInterval)
            ->delay(now()->addSeconds($this->pollInterval));
    }

    /**
     * Get the unique ID for the job.
     */
    public function uniqueId(): string
    {
        return 'mikrotik_monitor_' . implode('_', $this->dataTypes);
    }
}