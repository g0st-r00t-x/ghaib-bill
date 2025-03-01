"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@/Components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { FilterIcon } from "lucide-react"
import type { ColumnFilter } from "@/types/data-table"

interface DataTableFilterProps<TData> {
  table: Table<TData>
  filter: ColumnFilter
  onFilterChange: (columnId: string, value: string[]) => void
}

export function DataTableFilter<TData>({ table, filter, onFilterChange }: DataTableFilterProps<TData>) {
  const selectedValues = (table.getColumn(filter.id)?.getFilterValue() as string[]) || []

  const handleFilterChange = (value: string) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]

    onFilterChange(filter.id, updatedValues)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <FilterIcon className="mr-2 h-4 w-4" />
          {filter.label}
          {selectedValues?.length > 0 && (
            <span className="ml-1 rounded-full bg-primary w-4 h-4 text-xs flex items-center justify-center text-primary-foreground">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filter.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues?.includes(option.value)}
            onCheckedChange={() => handleFilterChange(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

