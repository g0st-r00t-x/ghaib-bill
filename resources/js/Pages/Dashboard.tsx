import { useEffect } from 'react';
import { DashboardShell } from '@/Components/layout/dashboard-shell';
import { NetworkStats } from '@/Components/network-stats';
import { Overview } from '@/Components/overview';
import { RecentActivity } from '@/Components/recent-activity';
import { ScrollArea } from '@/Components/ui/scroll-area';
import  echo  from '@/echo';

export default function Dashboard() {
    useEffect(() => {
        // Use the imported Echo instance directly
        echo.channel('mikrotik-logs')
        .listen('MikroTikLogUpdated', event => {
            console.log(event);
        });

    }, []);

    return (
        <DashboardShell>
            <ScrollArea>
                <div className="w-full h-screen overflow-y-auto space-y-4 p-4 pt-6 md:p-8">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    </div>
                    <NetworkStats />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Overview />
                        <RecentActivity />
                    </div>
                </div>
            </ScrollArea>
        </DashboardShell>
    );
}