<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\RouterOsService;

class RouterOsController extends Controller
{
    protected $mikrotik;

    public function __construct(RouterOsService $mikrotik)
    {
        $this->mikrotik = $mikrotik;
    }

    public function index()
    {
        return response()->json(['status' => 'Service Ready']);
    }
}
