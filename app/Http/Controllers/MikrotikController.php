<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use RouterOS\Query;
use RouterOS\Client;
use App\Events\MikroTikLogUpdated;
use function GuzzleHttp\json_decode;

class MikrotikController extends Controller
{
    private function connectMikrotik()
    {
        try {
            return new Client([
                'host' => env('MIKROTIK_HOST'),
                'user' => env('MIKROTIK_USER'),
                'pass' => env('MIKROTIK_PASS'),
                'port' => (int) env('MIKROTIK_PORT'), // Konversi ke integer
                'timeout' => 10,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal terhubung ke MikroTik: ' . $e->getMessage()], 500);
        }
    }

    public function sendRealtimeLogs()
    {
            $logs = $this->fetchData('/log/print', 'Log Real-time');
            $data = [];

for ($i = 1; $i <= 2; $i++) {
    $data[] = [
        "id" => $i,
        "name" => "User_$i",
        "details" => [
            "age" => rand(18, 50),
            "skills" => [
                "Programming" => ["PHP", "JavaScript", "Python", "GoLang"][array_rand(["PHP", "JavaScript", "Python", "GoLang"])],
                "Database" => ["MySQL", "PostgreSQL", "MongoDB"][array_rand(["MySQL", "PostgreSQL", "MongoDB"])],
                "Cloud" => ["AWS", "Azure", "GCP"][array_rand(["AWS", "Azure", "GCP"])]
            ],
            "address" => [
                "city" => ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali"][array_rand(["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali"])],
                "country" => "Indonesia"
            ]
        ]
    ];
}
            // Broadcast log ke WebSockets dengan Reverb
            broadcast(new MikroTikLogUpdated($data));

            return response()->json([
                'message' => 'Logs sent to WebSocket',
                'logs' => $logs,
            ]);
    }

    // 1. Mendapatkan daftar user PPPoE yang sedang aktif
    public function getActivePPPoEUsers()
    {
        return $this->fetchData('/ppp/active/print', 'PPPoE aktif');
    }

    // 2. Mendapatkan daftar user PPPoE (Secret)
    public function getPPPoEUsers()
    {
        return $this->fetchData('/ppp/secret/print', 'Daftar pengguna PPPoE');
    }

    // 3. Mendapatkan daftar user Hotspot
    public function getHotspotUsers()
    {
        return $this->fetchData('/ip/hotspot/user/print', 'Daftar pengguna Hotspot');
    }

    // 4. Mendapatkan daftar user Hotspot yang sedang aktif
    public function getActiveHotspotUsers()
    {
        return $this->fetchData('/ip/hotspot/active/print', 'Hotspot aktif');
    }

    // 5. Mendapatkan daftar DHCP leases
    public function getDHCPLeases()
    {
        return $this->fetchData('/ip/dhcp-server/lease/print', 'DHCP leases');
    }

    // 5. Mendapatkan daftar DHCP leases
    public function getLogs()
    {
        $logs = $this->fetchData('/log/print', 'Logs');
    }

    // Fungsi untuk mengambil data dari MikroTik
    private function fetchData($path, $desc)
    {
        $client = $this->connectMikrotik();
        if ($client instanceof \Illuminate\Http\JsonResponse) {
            return $client; // Mengembalikan error jika koneksi gagal
        }

        try {
            $query = new Query($path);
            $data = $client->query($query)->read();

            return response()->json([$desc => $data]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }
}
