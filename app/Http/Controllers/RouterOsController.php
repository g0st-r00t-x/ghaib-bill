<?php

namespace App\Http\Controllers;

use App\Jobs\MikrotikLogs;
use App\Services\MikrotikService;
use Illuminate\Http\JsonResponse;

class RouterOsController extends Controller
{
    /**
     * @var MikrotikService
     */
    protected $mikrotik;

    /**
     * RouterOsController constructor.
     *
     * @param MikrotikService $mikrotik
     */
    public function __construct(MikrotikService $mikrotik)
    {
        $this->mikrotik = $mikrotik;
    }

    /**
     * Endpoint to check service readiness
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json(['status' => 'Service Ready']);
    }

    /**
     * Endpoint to connect to Mikrotik router
     *
     * @return JsonResponse
     */
    public function connect(): JsonResponse
    {
        $response = $this->mikrotik->connect();
        
        return response()->json($response);
    }

    /**
     * Endpoint to get all interfaces
     *
     * @return JsonResponse
     */

    /**
     * Endpoint to get all users
     *
     * @return JsonResponse
     */
    public function getUsers(): JsonResponse
    {
        $response = $this->mikrotik->getActivePpp();

        return response()->json($response);
    }

    /**
     * Endpoint to get system resources
     *
     * @return JsonResponse
     */


}
