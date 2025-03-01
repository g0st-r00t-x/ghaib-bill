import { DataTable } from "@/Components/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import type { ColumnFilter, SearchableColumn } from "@/types/data-table"
import { DashboardShell } from "@/Components/layout/dashboard-shell"
import { BreadcrumbNav } from "@/Components/breadcrumb-nav"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

// Updated interface to match the new structure
interface PPPConnection {
  ".id": string
  name: string
  service: string
  "caller-id"?: string
  caller_id: string | null
  current_address: string | null
  disabled: string
  "ipv6-routes": string
  is_active: boolean
  "last-logged-out": string
  "limit-bytes-in": string
  "limit-bytes-out": string
  password: string
  profile: string
  routes: string
}

// Sample data with the new structure


// Define your filters for the new structure
const filters: ColumnFilter[] = [
  {
    id: "service",
    label: "Service",
    options: [
      { value: "any", label: "Any" },
      { value: "pppoe", label: "PPPoE" },
      { value: "pptp", label: "PPTP" },
      { value: "l2tp", label: "L2TP" },
    ],
  },
  {
    id: "is_active",
    label: "Status",
    options: [
      { value: "true", label: "Aktif" },
      { value: "false", label: "Tidak Aktif" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    options: [
      { value: "default", label: "Default" },
      // Add other profile options as needed
    ],
  },
]

// Define searchable columns for the new structure
const searchableColumns: SearchableColumn[] = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "caller-id",
    label: "Caller ID",
  },
  {
    id: "current_address",
    label: "IP Address",
  },
]

// Updated columns definition to match the new structure
const columns: ColumnDef<PPPConnection>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => {
      // Get the row index and add 1 to start from 1 instead of 0
      return row.index + 1;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "profile",
    header: "Profile",
  },
  {
    accessorKey: "current_address",
    header: "IP Address",
    cell: ({ row }) => {
      const address = row.getValue("current_address")
      return address || "Not connected"
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active")
      return (
        <div className={isActive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
          {isActive ? "Aktif" : "Tidak Aktif"}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const connection = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(connection[".id"])}>
              Copy connection ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Disconnect</DropdownMenuItem>
            <DropdownMenuItem>Edit connection</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
//Socket
const socket = io("http://localhost:8080");

export default function PppActive() {
  // State to store data from the endpoint
  const [logs, setLogs] = useState<PPPConnection[]>([]);

  // State untuk menyimpan data PPP
  const [pppData, setPppData] = useState<PPPConnection[]>([]);
  
  
    // Menangani koneksi socket dan pembaruan data
    useEffect(() => {
      const onPppDataUpdate = (data) => {
        console.log("Data PPP diperbarui:", data);
        setPppData(data.pppSecret);
      };
  
      // Registrasi event listeners
      socket.on('pppDataUpdate', onPppDataUpdate);
  
      // Jika socket tidak terhubung, coba hubungkan
      if (!socket.connected) {
        socket.connect();
      }
  
      // Cleanup function
      return () => {
        socket.off('pppDataUpdate', onPppDataUpdate);
      };
    }, []);

  return (
    <DashboardShell>
      <div className="space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col gap-4">
          <BreadcrumbNav />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active PPPoE Connections</h2>
            <p className="text-muted-foreground">Manage and monitor all active PPPoE connections</p>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={pppData}
          filters={filters}
          searchableColumns={searchableColumns}
        />
      </div>
    </DashboardShell>
  )
}