"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { X, Filter, Search } from "lucide-react"
import type { ColumnFilter, SearchableColumn } from "@/types/data-table"
import { Badge } from "@/Components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/Components/ui/dropdown-menu"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/Components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filters?: ColumnFilter[]
  searchableColumns?: SearchableColumn[]
}

export function DataTableToolbar<TData>({ table, filters, searchableColumns }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchColumn, setSearchColumn] = React.useState<string | undefined>(searchableColumns?.[0]?.id)
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Get active filters for display
  const activeFilters = table.getState().columnFilters.flatMap((filter) => {
    const columnFilter = filters?.find((f) => f.id === filter.id)
    if (!columnFilter) return []

    return (filter.value as string[]).map((value) => ({
      id: filter.id,
      value,
      label: `${columnFilter.label}: ${columnFilter.options.find((opt) => opt.value === value)?.label}`,
    }))
  })

  const handleFilterChange = (columnId: string, values: string[]) => {
    if (values.length === 0) {
      table.getColumn(columnId)?.setFilterValue(undefined)
    } else {
      table.getColumn(columnId)?.setFilterValue(values)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-1 items-center space-x-2">
        {/* {searchableColumns && searchableColumns.length > 0 && (
          <div className="flex items-center">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Search className="mr-2 h-4 w-4" />
                  {searchColumn ? searchableColumns.find((col) => col.id === searchColumn)?.label : "Search"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Search columns..." />
                  <CommandList>
                    <CommandEmpty>No column found.</CommandEmpty>
                    <CommandGroup>
                      {searchableColumns.map((column) => (
                        <CommandItem
                          key={column.id}
                          onSelect={() => {
                            setSearchColumn(column.id)
                            setSearchOpen(false)
                          }}
                        >
                          {column.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              placeholder={`Search ${searchableColumns.find((col) => col.id === searchColumn)?.label.toLowerCase()}...`}
              value={(table.getColumn(searchColumn!)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchColumn!)?.setFilterValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px] ml-2"
            />
          </div>
        )} */}

        {filters && filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 font-normal">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {filters.map((filter) => (
                <DropdownMenuGroup key={filter.id}>
                  <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
                  {filter.options.map((option) => {
                    const values = (table.getColumn(filter.id)?.getFilterValue() as string[]) || []
                    return (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={values?.includes(option.value)}
                        onCheckedChange={() => {
                          const updatedValues = values?.includes(option.value)
                            ? values.filter((v) => v !== option.value)
                            : [...(values || []), option.value]
                          handleFilterChange(filter.id, updatedValues)
                        }}
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                </DropdownMenuGroup>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        <DataTableViewOptions table={table} />
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.id}-${filter.value}-${index}`}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  const currentValues = table.getColumn(filter.id)?.getFilterValue() as string[]
                  handleFilterChange(
                    filter.id,
                    currentValues.filter((value) => value !== filter.value),
                  )
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => table.resetColumnFilters()}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

