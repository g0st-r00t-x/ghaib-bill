<?php

namespace App\Providers;


use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use RouterOS\Client;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('MikrotikClient', function () {
            return new Client(
                [
                    'host' => env('MIKROTIK_HOST'),
                    'port' => (int) env('MIKROTIK_PORT'),
                    'user' => env('MIKROTIK_USER'),
                    'pass' => env('MIKROTIK_PASS'),

                ]
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Konfigurasi Vite prefetch
        Vite::prefetch(concurrency: 1);
    }
}