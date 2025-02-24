import { DashboardShell } from "@/Components/layout/dashboard-shell"
import { BreadcrumbNav } from "@/Components/breadcrumb-nav"
import DataTable from "@/Components/Tables/DataTable"
import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Filter, MoreHorizontal, Signal, X } from "lucide-react"

import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Badge } from "@/Components/ui/badge"

// This would come from your backend
const data: Connection[] = [
  {
    id: "1",
    username: "john.doe",
    ipAddress: "192.168.1.100",
    macAddress: "00:1B:44:11:3A:B7",
    uptime: "2 hours",
    downloadSpeed: "15.5",
    uploadSpeed: "5.2",
    signal: -65,
    status: "active",
    plan: "Premium",
  },
  {
    id: "2",
    username: "jane.smith",
    ipAddress: "192.168.1.101",
    macAddress: "00:1B:44:11:3A:B8",
    uptime: "5 hours",
    downloadSpeed: "22.3",
    uploadSpeed: "8.1",
    signal: -55,
    status: "active",
    plan: "Basic",
  },
]

export type Connection = {
  id: string
  username: string
  ipAddress: string
  macAddress: string
  uptime: string
  downloadSpeed: string
  uploadSpeed: string
  signal: number
  status: "active" | "inactive"
  plan: string
}

const getSignalStrength = (signal: number) => {
  if (signal >= -50) return "Excellent"
  if (signal >= -60) return "Good"
  if (signal >= -70) return "Fair"
  return "Poor"
}

const getSignalColor = (signal: number) => {
  if (signal >= -50) return "bg-green-500"
  if (signal >= -60) return "bg-blue-500"
  if (signal >= -70) return "bg-yellow-500"
  return "bg-red-500"
}

export const columns: ColumnDef<Connection>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
  },
  {
    accessorKey: "macAddress",
    header: "MAC Address",
  },
  {
    accessorKey: "uptime",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Uptime
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "downloadSpeed",
    header: "Download",
    cell: ({ row }) => `${row.getValue("downloadSpeed")} Mbps`,
  },
  {
    accessorKey: "uploadSpeed",
    header: "Upload",
    cell: ({ row }) => `${row.getValue("uploadSpeed")} Mbps`,
  },
  {
    accessorKey: "signal",
    header: "Signal",
    cell: ({ row }) => {
      const signal = row.getValue("signal") as number
      return (
        <div className="flex items-center gap-2">
          <Signal className="h-4 w-4" />
          <Badge variant="outline" className={getSignalColor(signal)}>
            {getSignalStrength(signal)}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-green-500/10 text-green-500">
        {row.getValue("status")}
      </Badge>
    ),
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(connection.ipAddress)}>
              Copy IP address
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View traffic</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Disconnect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface FilterOption {
  field: keyof Connection
  value: string
  label: string
}

export default function PPPoEActivePage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [activeFilters, setActiveFilters] = React.useState<FilterOption[]>([])
    const [highlightedRow, setHighlightedRow] = React.useState<string | null>(null)
    const table = useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
    })
  
    const addFilter = (field: keyof Connection, value: string, label: string) => {
      if (!activeFilters.some((f) => f.field === field && f.value === value)) {
        const newFilter = { field, value, label }
        setActiveFilters([...activeFilters, newFilter])
  
        // Update table filters
        const currentFilters = table.getState().columnFilters
        const fieldFilters = (currentFilters.find((f) => f.id === field)?.value as string[]) || []
        table.getColumn(field)?.setFilterValue([...fieldFilters, value])
      }
    }
  
    const removeFilter = (filter: FilterOption) => {
      setActiveFilters(activeFilters.filter((f) => !(f.field === filter.field && f.value === filter.value)))
  
      // Update table filters
      const currentFilters = table.getState().columnFilters
      const fieldFilters = (currentFilters.find((f) => f.id === filter.field)?.value as string[]) || []
      table.getColumn(filter.field)?.setFilterValue(fieldFilters.filter((v) => v !== filter.value))
    }
  const resetFilters = () => {
    setActiveFilters([]);
    table.resetColumnFilters();
  };
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
          table={table}
          columns={columns}
          highlightedRow={highlightedRow}
          activeFilters={activeFilters}
          addFilter={addFilter}
          removeFilter={removeFilter}
          resetFilters={resetFilters}
        />
      </div>
    </DashboardShell>
  )
}

