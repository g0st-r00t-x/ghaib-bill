<?php

namespace App\Providers;

use App\Services\MikrotikService;
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