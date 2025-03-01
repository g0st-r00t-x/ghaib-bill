import { useEffect, useState } from 'react';
import axios from 'axios';
import { NetworkStats } from '@/Components/network-stats';
import { Overview } from '@/Components/overview';
import { RecentActivity } from '@/Components/recent-activity';
import echo from '@/echo';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { DashboardShell } from '@/Components/layout/dashboard-shell';

export default function Dashboard() {
    // State untuk menyimpan data dari endpoint
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Fungsi untuk mengambil data awal dari endpoint
        const fetchInitialData = async () => {
            try {
                const response = await axios.get('/api/mikrotik/logs');
                setLogs(response.data); // Simpan data ke state
                console.log('Data awal dari cache:', response.data);
            } catch (error) {
                console.error('Gagal mengambil data awal:', error);
            }
        };

        // Panggil fungsi untuk mengambil data awal
        fetchInitialData();

        // Use the imported Echo instance to listen for real-time updates
        const channel = echo.channel('mikrotik-logs');
        channel.listen('MikroTikLogUpdated', (event) => {
            console.log('Event Dashboard diterima:', event);
            setLogs(event); // Perbarui state dengan data baru dari event
        });
    }, []);

    return (
        <DashboardShell>
            <div className="space-y-4 p-4 pt-6 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                {/* Kirim data logs ke komponen child jika diperlukan */}
                <NetworkStats />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Overview />
                    <RecentActivity />
                </div>
            </div>
        </DashboardShell>
    );
}