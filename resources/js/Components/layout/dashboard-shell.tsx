import type React from "react";
import { Globe2 } from "lucide-react";
import { Navbar } from "@/Components/navbar";
import { MainNav } from "@/Components/main-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Link } from "@inertiajs/react";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:8080");
// Buat instance socket.io di luar komponen
// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
// const socket = io(SOCKET_URL, {
//   reconnectionDelay: 1000,
//   reconnection: true,
//   reconnectionAttempts: 10,
//   transports: ['websocket'],
//   agent: false,
//   upgrade: false,
//   rejectUnauthorized: false
// });

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // State untuk menyimpan data PPP
  const [pppData, setPppData] = useState({
    pppSecret: [],
    pppActive: [],
    pppInactive: []
  });

  // State untuk status koneksi
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Menangani koneksi socket dan pembaruan data
  useEffect(() => {
    // Event handlers
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onPppDataUpdate = (data) => {
      setPppData(data);
    };

    // Registrasi event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pppDataUpdate', onPppDataUpdate);

    // Jika socket tidak terhubung, coba hubungkan
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup function
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pppDataUpdate', onPppDataUpdate);
    };
  }, []);

  // Menghitung jumlah pengguna aktif dan tidak aktif
  const activeUserCount = pppData.pppActive?.length || 0;
  const inactiveUserCount = pppData.pppInactive?.length || 0;
  const totalUserCount = pppData.pppSecret?.length || 0;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Globe2 className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Network Monitor</span>
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? (
                        <span className="text-green-500">●</span>
                      ) : (
                        <span className="text-red-500">●</span>
                      )}
                      {isConnected ? " Online" : " Offline"}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="ml-auto">
              <Navbar />
            </div>
          </div>
        </header>
        {/* Tambahkan status koneksi sebagai bagian dari UI */}
        {!isConnected && (
          <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">
            Koneksi ke server terputus. Mencoba menghubungkan kembali...
          </div>
        )}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}