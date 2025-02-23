import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Input } from "@/Components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Card, CardContent } from "@/Components/ui/card"
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area"
import { cn } from "@/lib/utils"

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

export function ConnectionsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [activeFilters, setActiveFilters] = React.useState<FilterOption[]>([])
  const [highlightedRow, setHighlightedRow] = React.useState<string | null>(null)

  // Handle search params for highlighting and filtering
  // React.useEffect(() => {

  //   if (highlight) {
  //     setHighlightedRow(highlight)
  //   }
  //   if (username) {
  //     addFilter("username", username, `Username: ${username}`)
  //   }
  //   if (ip) {
  //     addFilter("ipAddress", ip, `IP: ${ip}`)
  //   }
  // }, [])

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

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 border-b p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Filter by username..."
              value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Speed</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuLabel>Download Speed</DropdownMenuLabel>
                    {["10", "20", "50"].map((speed) => (
                      <DropdownMenuRadioItem
                        key={`download-${speed}`}
                        value={speed}
                        onClick={() => addFilter("downloadSpeed", speed, `Download > ${speed}Mbps`)}
                      >
                        {`> ${speed} Mbps`}
                      </DropdownMenuRadioItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Upload Speed</DropdownMenuLabel>
                    {["5", "10", "20"].map((speed) => (
                      <DropdownMenuRadioItem
                        key={`upload-${speed}`}
                        value={speed}
                        onClick={() => addFilter("uploadSpeed", speed, `Upload > ${speed}Mbps`)}
                      >
                        {`> ${speed} Mbps`}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Plan</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {["Basic", "Premium", "Business"].map((plan) => (
                      <DropdownMenuRadioItem
                        key={plan}
                        value={plan}
                        onClick={() => addFilter("plan", plan, `Plan: ${plan}`)}
                      >
                        {plan}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Signal Strength</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {[
                      { value: "-50", label: "Excellent" },
                      { value: "-60", label: "Good" },
                      { value: "-70", label: "Fair" },
                      { value: "-80", label: "Poor" },
                    ].map((signal) => (
                      <DropdownMenuRadioItem
                        key={signal.value}
                        value={signal.value}
                        onClick={() => addFilter("signal", signal.value, `Signal: ${signal.label}`)}
                      >
                        {signal.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={`${filter.field}-${filter.value}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(filter)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setActiveFilters([])
                  table.resetColumnFilters()
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          <ScrollArea className="h-[calc(100vh-24rem)] rounded-md border-0">
            <div className="relative min-w-max">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={cn(highlightedRow === row.original.id && "bg-muted")}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex items-center justify-end space-x-2 border-t p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

