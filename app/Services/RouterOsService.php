<?php

namespace App\Services;

use RouterosAPI;

class RouterOsService
{
    /**
     * @var RouterosAPI
     */
    protected $api;

    /**
     * @var array
     */
    protected $config;

    /**
     * @var bool
     */
    protected $connected = false;

    /**
     * MikrotikService constructor.
     */
    public function __construct()
    {
        $this->api = new RouterosAPI();
        $this->api->debug = config('mikrotik.debug', false);
        $this->api->ssl = config('mikrotik.ssl', false);
        $this->api->port = config('mikrotik.port', 8728);
        $this->api->timeout = config('mikrotik.timeout', 3);
        $this->api->attempts = config('mikrotik.attempts', 5);
        $this->api->delay = config('mikrotik.delay', 3);
    }

    /**
     * Connect to Mikrotik router
     *
     * @param string|null $ip
     * @param string|null $username
     * @param string|null $password
     * @return bool
     */
    public function connect(?string $ip = null, ?string $username = null, ?string $password = null): bool
    {
        // Use parameters or fallback to config values
        $ip = $ip ?? config('mikrotik.host');
        $username = $username ?? config('mikrotik.username');
        $password = $password ?? config('mikrotik.password');

        $this->connected = $this->api->connect($ip, $username, $password);
        return $this->connected;
    }

    /**
     * Check if connected to router
     *
     * @return bool
     */
    public function isConnected(): bool
    {
        return $this->connected;
    }

    /**
     * Disconnect from router
     */
    public function disconnect(): void
    {
        if ($this->connected) {
            $this->api->disconnect();
            $this->connected = false;
        }
    }

    /**
     * Get the RouterosAPI instance
     *
     * @return RouterosAPI
     */
    public function getApi(): RouterosAPI
    {
        return $this->api;
    }

    /**
     * Execute command on router
     *
     * @param string $command
     * @param array $params
     * @return array
     */
    public function execute(string $command, array $params = []): array
    {
        if (!$this->connected) {
            $this->connect();
        }
        
        return $this->api->comm($command, $params);
    }

    /**
     * Get all interfaces
     *
     * @return array
     */
    public function getInterfaces(): array
    {
        return $this->execute('/interface/print');
    }

    /**
     * Get all users
     *
     * @return array
     */
    public function getUsers(): array
    {
        return $this->execute('/user/print');
    }

    /**
     * Get system resources
     *
     * @return array
     */
    public function getResources(): array
    {
        return $this->execute('/system/resource/print');
    }

    /**
     * Create hotspot user
     *
     * @param string $name
     * @param string $password
     * @param string $profile
     * @return array
     */
    public function createHotspotUser(string $name, string $password, string $profile = 'default'): array
    {
        return $this->execute('/ip/hotspot/user/add', [
            'name' => $name,
            'password' => $password,
            'profile' => $profile
        ]);
    }

    /**
     * Forward any method calls to the RouterosAPI instance
     *
     * @param string $method
     * @param array $arguments
     * @return mixed
     */
    public function __call(string $method, array $arguments)
    {
        if (method_exists($this->api, $method)) {
            return $this->api->{$method}(...$arguments);
        }
        
        throw new \BadMethodCallException("Method {$method} does not exist in RouterosAPI");
    }
    
    /**
     * Destructor
     */
    public function __destruct()
    {
        // We don't disconnect here to maintain persistent connections
        // The disconnect should be explicitly called or handled by the service provider
    }
}