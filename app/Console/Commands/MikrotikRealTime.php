<?php

namespace App\Console\Commands;

use App\Jobs\ActiveHotspot;
use App\Jobs\ActivePpp;
use App\Jobs\MikrotikLogs;
use Illuminate\Console\Command;

class MikrotikRealTime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:mikrotik-real-time';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // dispatch(new MikrotikLogs());
        // dispatch(new ActiveHotspot());
        dispatch(new ActivePpp());
    }
}
