import type { ColumnDef } from "@tanstack/react-table"

export type FilterOption = {
  value: string
  label: string
}

export type ColumnFilter = {
  id: string
  label: string
  options: FilterOption[]
}

export type SearchableColumn = {
  id: string
  label: string
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  filters?: ColumnFilter[]
  searchableColumns?: SearchableColumn[]
}

