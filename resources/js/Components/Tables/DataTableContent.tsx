import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/Components/ui/table';
import { flexRender, HeaderGroup, Row } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface DataTableContentProps<TData> {
  table: {
    getHeaderGroups: () => HeaderGroup<TData>[];
    getRowModel: () => { rows: Row<TData>[] };
  };
  columns: any[];
  highlightedRow?: string | number;
}

export const DataTableContent = <TData,>({
  table,
  columns,
  highlightedRow
}: DataTableContentProps<TData>) => (
  <div className="w-full border rounded-md">
    <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <Table className="w-full table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="w-20 min-w-[5rem] whitespace-nowrap"
                >
                  <div className="truncate">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  highlightedRow === (row.original as any).id && "bg-muted"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="w-20 min-w-[5rem] whitespace-nowrap"
                  >
                    <div className="truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
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
  </div>
);