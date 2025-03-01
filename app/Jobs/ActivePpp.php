<?php

namespace App\Jobs;

use App\Services\MikrotikService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Events\ActivePppUpdated;
use Exception;

class ActivePpp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3; // Batas maksimal percobaan
    public $backoff = 60; // Waktu tunggu sebelum retry
    public $timeout = 30; // Timeout maksimal job
    protected int $pollInterval;

    public function __construct(int $pollInterval = 30)
    {
        $this->pollInterval = $pollInterval;
    }

    public function handle(MikrotikService $mikrotikService): void
    {
        try {
            $cacheKey = 'mikrotik_activePpp_cache';
            $hashKey = 'mikrotik_logs_hash';

            // Ambil data terakhir dari cache
            $cachedData = Cache::get($cacheKey, []);
            $cachedHash = Cache::get($hashKey, '');

            // Ambil logs dari MikrotikService
            $result = $mikrotikService->getActivePpp();
            $newData = $result;

            // Hitung hash dari data baru
            $newHash = md5(serialize($newData));

            // Debug log untuk membandingkan hash
            Log::info('Hash comparison', [
                'cachedHash' => $cachedHash,
                'newHash' => $newHash,
                'isDifferent' => ($newHash !== $cachedHash)
            ]);

            // Selalu kirim event dan update cache pada setiap perubahan
            if (empty($cachedData)) {
                Log::info('Inisialisasi cache dengan data awal.');
                Cache::put($cacheKey, $newData, now()->addMinutes(60)); // Simpan data baru ke cache
                Cache::put($hashKey, $newHash, now()->addMinutes(60)); // Simpan hash baru
                event(new ActivePppUpdated($newData)); // Kirim event ke frontend
            } elseif ($newHash !== $cachedHash) {
                // Data berubah, kirim event dan update cache
                Log::info('Data berubah, memperbarui cache dan mengirim event.');
                event(new ActivePppUpdated($newData));
                Cache::put($cacheKey, $newData, now()->addMinutes(60)); // Simpan data baru ke cache
                Cache::put($hashKey, $newHash, now()->addMinutes(60)); // Simpan hash baru
            } else {
                // Tambahkan log saat tidak ada perubahan
                Log::info('Tidak ada perubahan data terdeteksi.');
            }

            // Jadwalkan ulang job dengan metode release
            $this->release($this->pollInterval);
        } catch (Exception $e) {
            // Perbaikan untuk array to string conversion error
            $errorMessage = is_array($e->getMessage()) ? json_encode($e->getMessage()) : $e->getMessage();

            Log::error('Gagal memproses Mikrotik logs: ' . $errorMessage, [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // Jadwalkan ulang dengan metode yang konsisten (menggunakan release daripada dispatch)
            $this->release($this->pollInterval * 2);
        }
    }

    public function uniqueId(): string
    {
        return 'mikrotik_logs_monitor';
    }
}
