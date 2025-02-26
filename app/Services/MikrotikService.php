<?php

namespace App\Services;

use RouterOS\Client;
use RouterOS\Query;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class MikrotikService
{
    protected $client;
    protected $isConnected = false;
    protected $connectionAttempts = 0;
    protected $maxConnectionAttempts = 3;
    
    // Cache key untuk singleton connection
    protected const CONNECTION_CACHE_KEY = 'mikrotik_connection_active';
    protected const CACHE_TTL = 600; // 10 menit
    
    public function __construct()
    {
        // Tidak membuat koneksi di constructor untuk mencegah koneksi yang tidak perlu
    }

    /**
     * Mendapatkan klien RouterOS yang telah ada atau membuat yang baru jika diperlukan
     * 
     * @return Client
     */
    public function getClient(): Client
{
    if (!$this->isConnected || $this->client === null) {
        if (!$this->connect()) {
            throw new Exception('Tidak dapat terhubung ke MikroTik');
        }
    }

    if ($this->client === null) {
        throw new Exception('Client MikroTik masih null setelah koneksi.');
    }

    return $this->client;
}

    /**
     * Membuat koneksi ke router MikroTik
     * 
     * @return bool
     */
    public function connect(): bool
    {
        // Cek apakah koneksi sudah dibuat dan masih berlaku
        if ($this->isConnected && $this->client !== null) {
            return true;
        }
        
        // Jika sudah mencoba terlalu banyak, tunggu sejenak
        if ($this->connectionAttempts >= $this->maxConnectionAttempts) {
            Log::warning('Terlalu banyak upaya koneksi MikroTik, menunda koneksi selama 30 detik');
            Cache::put('mikrotik_connection_backoff', true, now()->addSeconds(30));
            $this->connectionAttempts = 0;
            return false;
        }
        
        // Cek backoff
        if (Cache::has('mikrotik_connection_backoff')) {
            return false;
        }
        
        try {
            $this->connectionAttempts++;
            
            $this->client = new Client([
                'host' => config('mikrotik.host'),
                'user' => config('mikrotik.user'),
                'pass' => config('mikrotik.pass'),
                'port' => (int) config('mikrotik.port'),
                'timeout' => (int) config('mikrotik.timeout', 10),
                'attempts' => 2, // Batas percobaan koneksi internal
            ]);
            
            // Tes koneksi dengan query sederhana
            $query = new Query('/system/identity/print');
            $this->client->query($query)->read();
            
            // Jika berhasil, atur status
            $this->isConnected = true;
            $this->connectionAttempts = 0;
            
            // Simpan status koneksi di cache
            Cache::put(self::CONNECTION_CACHE_KEY, true, now()->addSeconds(self::CACHE_TTL));
            
            Log::info('Koneksi MikroTik berhasil dibuat');
            return true;
        } catch (Exception $e) {
            Log::error('Gagal terhubung ke MikroTik: ' . $e->getMessage(), [
                'exception' => $e,
                'attempt' => $this->connectionAttempts
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
        // Periksa cache terlebih dahulu
        if (Cache::has(self::CONNECTION_CACHE_KEY)) {
            return true;
        }
        
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
        return $this->fetchData('/ppp/secret/print');
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
    $cacheKey = 'mikrotik_data_' . md5($path . serialize($where));
    $cacheTTL = config('mikrotik.cache_ttl', 5);

    if (config('mikrotik.use_cache', true) && Cache::has($cacheKey)) {
        return Cache::get($cacheKey, []);
    }

    try {
        // Force a new connection attempt to ensure client is available
        if (!$this->connect()) {
            throw new Exception('Tidak dapat terhubung ke MikroTik');
        }

        // Double-check the client is not null before using it
        if (!$this->client) {
            throw new Exception('Client MikroTik masih null setelah koneksi.');
        }

        $query = new Query($path);
        foreach ($where as $key => $value) {
            $query->where($key, $value);
        }

        $result = $this->client->query($query)->read();

        if (config('mikrotik.use_cache', true)) {
            Cache::put($cacheKey, $result, now()->addSeconds($cacheTTL));
        }

        return $result;
    } catch (Exception $e) {
        Log::error('Gagal mengambil data dari MikroTik: ' . $e->getMessage(), [
            'path' => $path,
            'exception' => $e
        ]);

        $this->isConnected = false;
        $this->client = null;
        Cache::forget(self::CONNECTION_CACHE_KEY);

        throw new Exception('Gagal mengambil data dari MikroTik: ' . $e->getMessage());
    }
}
    
    /**
     * Menutup koneksi saat objek dihancurkan
     */
    public function __destruct()
    {
        // Koneksi akan ditutup secara otomatis oleh RouterOS Client
        $this->client = null;
        $this->isConnected = false;
    }
}