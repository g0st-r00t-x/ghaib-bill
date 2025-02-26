import { useEffect } from 'react';
import { NetworkStats } from '@/Components/network-stats';
import { Overview } from '@/Components/overview';
import { RecentActivity } from '@/Components/recent-activity';
import  echo  from '@/echo';
import { DashboardLayout } from '@/Layouts/DashboardLayout';

export default function Dashboard() {
    useEffect(() => {
        // Use the imported Echo instance directly
        echo.channel('mikrotik-status')
            .listen('status.changed', event => {
            console.log(event);
        });

    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <NetworkStats />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Overview />
                    <RecentActivity />
                </div>
            </div>
        </DashboardLayout>
    );
}

