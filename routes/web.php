<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MikrotikController;
use App\Http\Controllers\RouterOsController;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () { 
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/analytics', function () {
        return Inertia::render('Analytics');
    })->name('analytics');
    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings');

    //Route for PPPoE
    Route::get('/pppoe/active', function () {
        return Inertia::render('PPPoE/Active/page');  
    })->name('pppoe.active');
    Route::get('/pppoe/history', function () {
        return Inertia::render('PPPoE/History');  
    })->name('pppoe.history'); 
    Route::get('/pppoe/settings', function () {
        return Inertia::render('PPPoE/Settings');  
    })->name('pppoe.settings');
    
    //Route for Hotspot
    Route::get('/hotspot/active', function () {
        return Inertia::render('Hotspot/Active');  
    })->name('hotspot.active'); 
    Route::get('/hotspot/history', function () {
        return Inertia::render('Hotspot/History');  
    })->name('hotspot.history'); 
    Route::get('/hotspot/profiles', function () {
        return Inertia::render('Hotspot/Profiles');  
    })->name('hotspot.profiles'); 
    Route::get('/hotspot/config', function () {
        return Inertia::render('Hotspot/Config');  
    })->name('hotspot.config'); 

    //User route
    Route::get('/users/index', function () {
        return Inertia::render('Users');  
    })->name('users.index'); 
    Route::get('/users/create', function () {
        return Inertia::render('Users/Create');  
    })->name('users.create'); 
    Route::get('/Users/groups', function () {
        return Inertia::render('Users/Groups');  
    })->name('users.groups'); 

    //Network route
    Route::get('/network/bandwidth', function () {
        return Inertia::render('Network/page');  
    })->name('network.bandwidth'); 
    Route::get('/network/traffic', function () {
        return Inertia::render('Network/Traffic');  
    })->name('network.traffic'); 
    Route::get('/network/map', function () {
        return Inertia::render('Network/Map');  
    })->name('network.map'); 
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/pppoe-active', [MikrotikController::class, 'getActivePPPoEUsers']);
Route::get('/pppoe-users', [MikrotikController::class, 'getPPPoEUsers']);
Route::get('/hotspot-users', [MikrotikController::class, 'getHotspotUsers']);
Route::get('/hotspot-active', [MikrotikController::class, 'getActiveHotspotUsers']);
Route::get('/dhcp-leases', [MikrotikController::class, 'getDHCPLeases']);
Route::get('/logs', [MikrotikController::class, 'getLogs']);

Route::get('/mikrotik/logs', [MikrotikController::class, 'sendRealtimeLogs']);
Route::get('/mikrotik/monitor', [MikrotikController::class, 'startLogMonitoring']);

Route::prefix('router-os')->group(function () {
    Route::get('/', [RouterOsController::class, 'index']);
    Route::get('/connect', [RouterOsController::class, 'connect']);
    Route::get('/interfaces', [RouterOsController::class, 'getInterfaces']);
    Route::get('/ppp/active', [RouterOsController::class, 'getUsers']);
    Route::get('/resources', [RouterOsController::class, 'getResources']);
    Route::post('/create-hotspot-user', [RouterOsController::class, 'createHotspotUser']);
});


//Initialize data when the application starts
Route::get('/api/mikrotik/logs', function () {
    $cacheKey = 'mikrotik_logs_cache';
    $data = Cache::get($cacheKey, []);
    return response()->json($data);
});

Route::get('/api/mikrotik/ppp/active', function () {
    $cacheKey = 'mikrotik_activePpp_cache';
    $data = Cache::get($cacheKey, []);
    return response()->json($data);
});

Route::get('/api/mikrotik/hotspot/active', function () {
    $cacheKey = 'mikrotik_activeHotspot_cache';
    $data = Cache::get($cacheKey, []);
    return response()->json($data);
});

require __DIR__.'/auth.php';
