<?php

namespace App\Http\Controllers;

use App\Events\MikroTikStatusChanged;
use App\Services\MikrotikService;
use App\Events\MikroTikLogUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class MikrotikController extends Controller
{
    /**
     * MikroTik service instance.
     */
    protected $mikrotik;

    /**
     * Create a new controller instance.
     *
     * @param MikrotikService $mikrotik
     */
    public function __construct(MikrotikService $mikrotik)
    {
        $this->mikrotik = $mikrotik;
    }

    /**
     * Mengirimkan log realtime ke WebSocket
     *
     * @return JsonResponse
     */
    public function sendRealtimeLogs(): JsonResponse
{
    try {
        // Mencoba membuat koneksi secara langsung
        if (!$this->mikrotik->connect()) {
            return response()->json(['error' => 'Tidak dapat terhubung ke MikroTik router'], 503);
        }
        
        // Ambil log dengan limit dari konfigurasi
        $limit = config('mikrotik.log_limit', 50);
        $logs = $this->mikrotik->getLogs();
        
        // Dispatch event untuk mengirim data ke WebSocket
        event(new MikroTikStatusChanged(true, 'Hello World!'));

        return response()->json([
            'success' => true,
            'message' => 'Logs berhasil dikirim ke WebSocket',
            'count' => count($logs),
        ]);
    } catch (Exception $e) {
        Log::error('Gagal mengirim log realtime: ' . $e->getMessage(), [
            'exception' => $e
        ]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    /**
     * Mengambil daftar pengguna PPPoE yang aktif
     *
     * @return JsonResponse
     */
    public function getActivePPPoEUsers(): JsonResponse
    {
        return $this->executeAndRespond(function() {
            return [
                'success' => true,
                'data' => $this->mikrotik->getActivePPPoEUsers(),
                'count' => count($this->mikrotik->getActivePPPoEUsers())
            ];
        }, 'PPPoE aktif');
    }

    /**
     * Mengambil semua pengguna PPPoE
     *
     * @return JsonResponse
     */
    public function getPPPoEUsers(): JsonResponse
    {
        return $this->executeAndRespond(function() {
            return [
                'success' => true,
                'data' => $this->mikrotik->getPPPoEUsers(),
                'count' => count($this->mikrotik->getPPPoEUsers())
            ];
        }, 'Daftar pengguna PPPoE');
    }

    /**
     * Mengambil semua pengguna Hotspot
     *
     * @return JsonResponse
     */
    public function getHotspotUsers(): JsonResponse
    {
        return $this->executeAndRespond(function() {
            return [
                'success' => true,
                'data' => $this->mikrotik->getHotspotUsers(),
                'count' => count($this->mikrotik->getHotspotUsers())
            ];
        }, 'Daftar pengguna Hotspot');
    }

    /**
     * Mengambil pengguna Hotspot yang aktif
     *
     * @return JsonResponse
     */
    public function getActiveHotspotUsers(): JsonResponse
    {
        return $this->executeAndRespond(function() {
            return [
                'success' => true,
                'data' => $this->mikrotik->getActiveHotspotUsers(),
                'count' => count($this->mikrotik->getActiveHotspotUsers())
            ];
        }, 'Hotspot aktif');
    }

    /**
     * Mengambil daftar DHCP Leases
     *
     * @return JsonResponse
     */
    public function getDHCPLeases(): JsonResponse
    {
        return $this->executeAndRespond(function() {
            return [
                'success' => true,
                'data' => $this->mikrotik->getDHCPLeases(),
                'count' => count($this->mikrotik->getDHCPLeases())
            ];
        }, 'DHCP leases');
    }

    /**
     * Method helper untuk mengeksekusi fungsi dan menanggapi dengan format yang konsisten
     *
     * @param callable $callback
     * @param string $operation
     * @return JsonResponse
     */
    private function executeAndRespond(callable $callback, string $operation): JsonResponse
    {
        try {
            // Periksa koneksi sebelum mengambil data
            if (!$this->mikrotik->isConnected()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat terhubung ke MikroTik router'
                ], 503);
            }
            
            return response()->json($callback());
            
        } catch (Exception $e) {
            Log::error("Gagal mendapatkan {$operation}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}