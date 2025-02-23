<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
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
        return Inertia::render('Network/Bandwidth');  
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

require __DIR__.'/auth.php';
