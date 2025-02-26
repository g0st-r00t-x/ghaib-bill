<?php

namespace App\Services;

use RouterOS\Client;
use RouterOS\Query;
use Illuminate\Support\Facades\Log;
use Exception;

class MikrotikService
{
    protected $client;
    protected $isConnected = false;

    public function __construct()
    {
        $this->connect();
    }

    /**
     * Membuat koneksi ke router MikroTik
     * 
     * @return bool
     */
    public function connect(): bool
    {
        try {
            $this->client = new Client([
                'host' => config('mikrotik.host'),
                'user' => config('mikrotik.user'),
                'pass' => config('mikrotik.pass'),
                'port' => (int) config('mikrotik.port'),
                'timeout' => (int) config('mikrotik.timeout', 10),
            ]);
            $this->isConnected = true;
            return true;
        } catch (Exception $e) {
            Log::error('Gagal terhubung ke MikroTik: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            $this->isConnected = false;
            return false;
        }
    }

    /**
     * Memeriksa apakah layanan terhubung ke router
     * 
     * @return bool
     */
    public function isConnected(): bool
    {
        return $this->isConnected;
    }

    /**
     * Mengambil log dari router MikroTik
     * 
     * @param int $limit Jumlah log yang ingin diambil
     * @return array
     * @throws Exception
     */
    public function getLogs(): array
    {
        try {
            $query = new Query('/ppp/secret/print');
            $logs = $this->client->query($query)->read();
            return $logs;
        } catch (Exception $e) {
            Log::error('Gagal mengambil data log: ' . $e->getMessage());
            throw new Exception('Gagal mengambil data log: ' . $e->getMessage());
        }
    }

    /**
     * Mengambil daftar pengguna PPPoE yang aktif
     * 
     * @return array
     */
    public function getActivePPPoEUsers(): array
    {
        return $this->fetchData('/ppp/active/print');
    }

    /**
     * Mengambil semua pengguna PPPoE
     * 
     * @return array
     */
    public function getPPPoEUsers(): array
    {
        return $this->fetchData('/ppp/secret/print');
    }

    /**
     * Mengambil semua pengguna Hotspot
     * 
     * @return array
     */
    public function getHotspotUsers(): array
    {
        return $this->fetchData('/ip/hotspot/user/print');
    }

    /**
     * Mengambil pengguna Hotspot yang aktif
     * 
     * @return array
     */
    public function getActiveHotspotUsers(): array
    {
        return $this->fetchData('/ip/hotspot/active/print');
    }

    /**
     * Mengambil daftar DHCP Leases
     * 
     * @return array
     */
    public function getDHCPLeases(): array
    {
        return $this->fetchData('/ip/dhcp-server/lease/print');
    }

    /**
     * Mengambil data dari router MikroTik
     * 
     * @param string $path Path API RouterOS
     * @param array $where Parameter tambahan untuk query
     * @return array
     * @throws Exception
     */
    private function fetchData(string $path, array $where = []): array
    {
        try {
            if (!$this->isConnected) {
                $this->connect();
                if (!$this->isConnected) {
                    throw new Exception('Tidak terhubung ke MikroTik');
                }
            }

            $query = new Query($path);
            
            foreach ($where as $key => $value) {
                $query->where($key, $value);
            }
            
            return $this->client->query($query)->read();
        } catch (Exception $e) {
            Log::error('Gagal mengambil data: ' . $e->getMessage(), [
                'path' => $path,
                'exception' => $e
            ]);
            throw new Exception('Gagal mengambil data: ' . $e->getMessage());
        }
    }
}