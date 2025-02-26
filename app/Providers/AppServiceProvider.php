<?php

namespace App\Providers;

use App\Jobs\MikrotikLogs;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Konfigurasi Vite prefetch
        Vite::prefetch(concurrency: 1);
        
        // Mulai monitoring MikroTik jika tidak dalam mode console dan fitur diaktifkan
        if (!$this->app->runningInConsole() && config('mikrotik.monitor_enabled', true)) {
            // Gunakan polling interval dari konfigurasi
            $pollInterval = config('mikrotik.poll_interval', 30);
            dispatch(new MikrotikLogs($pollInterval));
        }
    }
}