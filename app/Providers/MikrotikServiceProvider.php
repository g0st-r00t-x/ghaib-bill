<?php

namespace App\Providers;

use App\Services\MikrotikService;
use App\Services\RouterOsService;
use Illuminate\Support\ServiceProvider;

class MikrotikServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Registrasi file konfigurasi
        $this->mergeConfigFrom(
            __DIR__.'/../../config/mikrotik.php', 'mikrotik'
        );
        
        // Registrasi MikrotikService sebagai singleton
        $this->app->singleton(MikrotikService::class, function ($app) {
            return new MikrotikService();
        });

        // Register the RouterOsService as a singleton
        // $this->app->singleton(RouterOsService::class, function ($app) {
        //     $service = $app->make(RouterOsService::class);
            
        //     // Auto-connect if config is set to auto-connect
        //     if (config('mikrotik.auto_connect', false)) {
        //         $service->connect();
        //     }
            
        //     return $service;
        // });

        // Register a callback to disconnect on application termination
        // $this->app->terminating(function () {
        //     if ($this->app->resolved(RouterOsService::class)) {
        //         $mikrotikService = $this->app->make(RouterOsService::class);
        //         if (method_exists($mikrotikService, 'disconnect')) {
        //             $mikrotikService->disconnect();
        //         }
        //     }
        // });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publikasikan file konfigurasi
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../../config/mikrotik.php' => config_path('mikrotik.php'),
            ], 'mikrotik-config');
        }
    }
}
