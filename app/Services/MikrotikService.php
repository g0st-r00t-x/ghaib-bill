<?php

namespace App\Services;

use App\Libraries\RouterOsAPI;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MikrotikService
{
    /**
     * @var RouterOsAPI
     */
    protected $api;

    /**
     * @var bool
     */
    protected $connected = false;

    /**
     * @var string
     */
    protected $connectionKey;

    /**
     * @var int
     */
    protected $dataCacheTtl = 3600; // 1 hour default TTL for data comparison cache

    /**
     * Pool koneksi statis untuk digunakan di seluruh instance
     * 
     * @var array
     */
    private static $connectionPool = [];

    /**
     * RouterosAPI constructor.
     */
    public function __construct()
    {
        $this->initializeApi();
    }

    /**
     * Initialize the RouterOS API with configuration
     *
     * @return void
     */
    private function initializeApi(): void
    {
        $this->api = new RouterOsAPI();
        $this->api->debug = config('mikrotik.debug', false);
        $this->api->ssl = config('mikrotik.ssl', false);
        $this->api->port = config('mikrotik.port', 8728);
        $this->api->timeout = config('mikrotik.timeout', 3);
        $this->api->attempts = config('mikrotik.attempts', 5);
        $this->api->delay = config('mikrotik.delay', 3);
    }

    /**
     * Connect to Mikrotik router with connection pooling
     *
     * @param string|null $ip
     * @param string|null $username
     * @param string|null $password
     * @return array
     */
    public function connect(?string $ip = null, ?string $username = null, ?string $password = null): array
    {
        try {
            // Use parameters or fallback to config values
            $ip = $ip ?? config('mikrotik.host');
            $username = $username ?? config('mikrotik.user');
            $password = $password ?? config('mikrotik.pass');

            // Create unique key for this connection
            $this->connectionKey = md5($ip . $username . $password);

            // Try to reuse existing connection from pool
            if ($this->tryReusePooledConnection()) {
                return $this->createSuccessResponse(
                    'Successfully connected to the Mikrotik router using pooled connection.',
                    [
                        'ip' => $ip,
                        'username' => $username,
                        'password' => $password,
                        'pooled' => true
                    ]
                );
            }

            // Create new connection as none was available in pool
            $this->connected = $this->api->connect($ip, $username, $password);

            if ($this->connected) {
                // Save connection to pool
                self::$connectionPool[$this->connectionKey] = [
                    'api' => $this->api,
                    'lastUsed' => time()
                ];

                return $this->createSuccessResponse(
                    'Successfully connected to the Mikrotik router.',
                    [
                        'ip' => $ip,
                        'username' => $username,
                        'password' => $password,
                        'pooled' => false
                    ]
                );
            } else {
                return $this->createErrorResponse(
                    'Failed to connect to the Mikrotik router.',
                    [
                        'ip' => $ip,
                        'username' => $username,
                        'password' => $password
                    ]
                );
            }
        } catch (\Exception $e) {
            return $this->createErrorResponse(
                'An error occurred while connecting to the Mikrotik router: ' . $e->getMessage()
            );
        }
    }

    /**
     * Try to reuse an existing connection from the pool
     *
     * @return bool True if a pooled connection was successfully reused
     */
    private function tryReusePooledConnection(): bool
    {
        if (isset(self::$connectionPool[$this->connectionKey])) {
            $pooledConnection = self::$connectionPool[$this->connectionKey];

            try {
                $testResult = $pooledConnection['api']->comm('/system/identity/print');
                if ($testResult !== false) {
                    // Connection still valid
                    $this->api = $pooledConnection['api'];
                    $this->connected = true;

                    // Update last used time
                    self::$connectionPool[$this->connectionKey]['lastUsed'] = time();
                    return true;
                }
            } catch (\Exception $e) {
                // Connection may be broken, remove from pool
                unset(self::$connectionPool[$this->connectionKey]);
            }
        }

        return false;
    }

    /**
     * Execute command on router with data comparison caching
     *
     * @param string $command
     * @param array $params
     * @return array
     */
    public function execute(string $command, array $params = []): array
    {
        try {
            if (!$this->connected) {
                $connectResponse = $this->connect();
                if ($connectResponse['status'] === 'error') {
                    return $connectResponse;
                }
            }

            $this->updateConnectionLastUsedTime();
            $cacheKey = $this->generateCacheKey($command, $params);

            // Get data from cache if available
            $cachedData = Cache::get($cacheKey);

            // Execute command on router
            $newResult = $this->api->comm($command, $params);

            if ($newResult === false) {
                return $this->createErrorResponse(
                    'No response received from the router.',
                    [],
                    false
                );
            }

            // If cache exists, compare with new result
            if ($cachedData) {
                $oldHash = md5(json_encode($cachedData['data']));
                $newHash = md5(json_encode($newResult));
                Log::info('Old data', $cachedData['data']);
                Log::info('New data', $newResult);
                Log::info('Command executed. Old hash: ' . $oldHash . ', New hash: ' . $newHash);

                if ($oldHash === $newHash) {
                    return $this->createSuccessResponse(
                        'Cache hit. Data has not changed.',
                        $cachedData['data'],
                        false
                    );
                }
            }

            // If data changed or cache doesn't exist, save to cache
            Cache::put($cacheKey, ['data' => $newResult], $this->dataCacheTtl);

            return $this->createSuccessResponse(
                'Command executed successfully. Data updated.',
                $newResult,
                true
            );
        } catch (\Exception $e) {
            $this->handleConnectionFailure();

            return $this->createErrorResponse(
                'An error occurred while executing the command: ' . $e->getMessage(),
                [],
                false
            );
        }
    }

    /**
     * Handle connection failure by cleaning up pool
     *
     * @return void
     */
    private function handleConnectionFailure(): void
    {
        if (isset(self::$connectionPool[$this->connectionKey])) {
            unset(self::$connectionPool[$this->connectionKey]);
            $this->connected = false;
        }
    }

    /**
     * Update last used time for the current connection in pool
     *
     * @return void
     */
    private function updateConnectionLastUsedTime(): void
    {
        if (isset(self::$connectionPool[$this->connectionKey])) {
            self::$connectionPool[$this->connectionKey]['lastUsed'] = time();
        }
    }

    /**
     * Generate cache key for command and parameters
     *
     * @param string $command
     * @param array $params
     * @return string
     */
    private function generateCacheKey(string $command, array $params): string
    {
        $normalizedParams = json_encode($params, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);
        return 'mikrotik_data_' . md5($command . $normalizedParams . $this->connectionKey);
    }

    /**
     * Create success response array
     *
     * @param string $message
     * @param array $data
     * @param bool $dataChanged
     * @return array
     */
    private function createSuccessResponse(string $message, array $data = [], bool $dataChanged = false): array
    {
        return [
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'data_changed' => $dataChanged
        ];
    }

    /**
     * Create error response array
     *
     * @param string $message
     * @param array $data
     * @param bool $dataChanged
     * @return array
     */
    private function createErrorResponse(string $message, array $data = [], bool $dataChanged = false): array
    {
        return [
            'status' => 'error',
            'message' => $message,
            'data' => $data,
            'data_changed' => $dataChanged
        ];
    }

    /**
     * Get all PPP connections with separation between active and inactive
     *
     * @return array
     */
    public function getActivePpp(): array
    {
        // Get active PPP connections
        $activeResponse = $this->execute('/ppp/active/print');
        if ($activeResponse['status'] === 'error') {
            return $activeResponse;
        }

        // Get all PPP secrets
        $secretsResponse = $this->execute('/ppp/secret/print');
        if ($secretsResponse['status'] === 'error') {
            return $secretsResponse;
        }

        $mergedData = $this->mergePppData($activeResponse['data'], $secretsResponse['data']);

        // Separate into active and inactive
        $active = [];
        $inactive = [];

        foreach ($mergedData as $item) {
            if ($item['is_active']) {
                $active[] = $item;
            } else {
                $inactive[] = $item;
            }
        }

        return $this->createSuccessResponse(
            'PPP connections retrieved successfully',
            [
                'all' => $mergedData,
                'active' => $active,
                'inactive' => $inactive,
                'total' => count($mergedData),
                'active_count' => count($active),
                'inactive_count' => count($inactive)
            ],
            $activeResponse['data_changed'] || $secretsResponse['data_changed']
        );
    }

    /**
     * Merge PPP active and secrets data
     *
     * @param array $activeData
     * @param array $secretsData
     * @return array
     */
    private function mergePppData(array $activeData, array $secretsData): array
    {
        // Map active connections by name for easy lookup
        $activeByName = $this->mapDataByKey($activeData, 'name');

        // Add active status to each secret
        $result = [];
        foreach ($secretsData as $secret) {
            $name = $secret['name'] ?? '';
            $isActive = isset($activeByName[$name]);

            $secretWithStatus = $secret;
            $secretWithStatus['is_active'] = $isActive;

            // Add active connection details if available
            if ($isActive) {
                $secretWithStatus['active_details'] = $activeByName[$name];

                // Add useful connection info to the main level
                if (isset($activeByName[$name]['uptime'])) {
                    $secretWithStatus['uptime'] = $activeByName[$name]['uptime'];
                }
                if (isset($activeByName[$name]['address'])) {
                    $secretWithStatus['current_address'] = $activeByName[$name]['address'];
                }
                if (isset($activeByName[$name]['caller-id'])) {
                    $secretWithStatus['caller_id'] = $activeByName[$name]['caller-id'];
                }
            } else {
                $secretWithStatus['uptime'] = null;
                $secretWithStatus['current_address'] = null;
                $secretWithStatus['caller_id'] = null;
            }

            $result[] = $secretWithStatus;
        }

        return $result;
    }

    /**
     * Get all hotspot connections with separation between active and inactive
     *
     * @return array
     */
    public function getActiveHotspot(): array
    {
        // Get active hotspot connections
        $activeResponse = $this->execute('/ip/hotspot/active/print');
        if ($activeResponse['status'] === 'error') {
            return $activeResponse;
        }

        // Get all hotspot users
        $usersResponse = $this->execute('/ip/hotspot/user/print');
        if ($usersResponse['status'] === 'error') {
            return $usersResponse;
        }

        $mergedData = $this->mergeHotspotData($activeResponse['data'], $usersResponse['data']);

        // Separate into active and inactive
        $active = [];
        $inactive = [];

        foreach ($mergedData as $item) {
            if ($item['is_active']) {
                $active[] = $item;
            } else {
                $inactive[] = $item;
            }
        }

        return $this->createSuccessResponse(
            'Hotspot connections retrieved successfully',
            [
                'all' => $mergedData,
                'active' => $active,
                'inactive' => $inactive,
                'total' => count($mergedData),
                'active_count' => count($active),
                'inactive_count' => count($inactive)
            ],
            $activeResponse['data_changed'] || $usersResponse['data_changed']
        );
    }

    /**
     * Merge hotspot active and users data
     *
     * @param array $activeData
     * @param array $usersData
     * @return array
     */
    private function mergeHotspotData(array $activeData, array $usersData): array
    {
        // Group active connections by user
        $activeByUser = $this->groupDataByKey($activeData, 'user');

        // Add active status to each user
        $result = [];
        foreach ($usersData as $user) {
            $userName = $user['name'] ?? '';
            $isActive = isset($activeByUser[$userName]);

            $userWithStatus = $user;
            $userWithStatus['is_active'] = $isActive;

            // Add active connection details if available
            if ($isActive) {
                $userWithStatus['active_connections'] = $activeByUser[$userName];
                $userWithStatus['active_count'] = count($activeByUser[$userName]);

                // Add information from the first active connection
                $firstActive = $activeByUser[$userName][0];
                if (isset($firstActive['uptime'])) {
                    $userWithStatus['uptime'] = $firstActive['uptime'];
                }
                if (isset($firstActive['address'])) {
                    $userWithStatus['current_address'] = $firstActive['address'];
                }
                if (isset($firstActive['mac-address'])) {
                    $userWithStatus['mac_address'] = $firstActive['mac-address'];
                }
            } else {
                $userWithStatus['active_connections'] = [];
                $userWithStatus['active_count'] = 0;
                $userWithStatus['uptime'] = null;
                $userWithStatus['current_address'] = null;
                $userWithStatus['mac_address'] = null;
            }

            $result[] = $userWithStatus;
        }

        return $result;
    }

    /**
     * Map array data by specified key
     *
     * @param array $data
     * @param string $key
     * @return array
     */
    private function mapDataByKey(array $data, string $key): array
    {
        $result = [];
        foreach ($data as $item) {
            if (isset($item[$key])) {
                $result[$item[$key]] = $item;
            }
        }
        return $result;
    }

    /**
     * Group array data by specified key
     *
     * @param array $data
     * @param string $key
     * @return array
     */
    private function groupDataByKey(array $data, string $key): array
    {
        $result = [];
        foreach ($data as $item) {
            if (isset($item[$key])) {
                $keyValue = $item[$key];
                if (!isset($result[$keyValue])) {
                    $result[$keyValue] = [];
                }
                $result[$keyValue][] = $item;
            }
        }
        return $result;
    }

    /**
     * Clean up unused connections from the pool
     * 
     * @param int $maxIdleTime Waktu maksimum koneksi tidak digunakan (dalam detik)
     * @return void
     */
    public static function cleanConnectionPool(int $maxIdleTime = 600): void
    {
        $now = time();
        foreach (self::$connectionPool as $key => $connection) {
            if ($now - $connection['lastUsed'] > $maxIdleTime) {
                // Koneksi sudah lama tidak digunakan, kita coba tutup jika memungkinkan
                try {
                    if (method_exists($connection['api'], 'disconnect')) {
                        $connection['api']->disconnect();
                    }
                } catch (\Exception $e) {
                    // Abaikan error saat mencoba menutup koneksi
                }
                unset(self::$connectionPool[$key]);
            }
        }
    }

    /**
     * Set data comparison cache TTL
     * 
     * @param int $seconds
     * @return void
     */
    public function setDataCacheTtl(int $seconds): void
    {
        $this->dataCacheTtl = $seconds;
    }

    /**
     * Destroy the service instance
     */
    public function __destruct()
    {
        // Tidak menutup koneksi secara otomatis, koneksi dikelola oleh pool
    }
}
