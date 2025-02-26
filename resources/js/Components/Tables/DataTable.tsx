import { Card, CardContent } from '@/Components/ui/card';
import { TableSearch } from './TableSearch';
import { TableFilters } from './TableFilter';
import { TableColumns } from './TableColumns';
import { ActiveFilters } from './ActiveFilter';
import { DataTableContent } from './DataTableContent';
import { TablePagination } from './Pagination';
import { ScrollArea } from '../ui/scroll-area';

const DataTable = ({
  table,
  columns,
  highlightedRow,
  activeFilters,
  addFilter,
  removeFilter,
  resetFilters,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-background rounded-lg border">
      {/* Filter Section */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <TableSearch table={table} />
          <div className="flex gap-2 flex-wrap">
            <TableFilters addFilter={addFilter} />
            <TableColumns table={table} />
          </div>
        </div>

        <ActiveFilters
          activeFilters={activeFilters}
          removeFilter={removeFilter}
          resetFilters={resetFilters}
        />
      </div>

      {/* Table Section - akan mengambil sisa ruang yang tersedia */}
        <DataTableContent
          table={table}
          columns={columns}
          highlightedRow={highlightedRow}
        />

      {/* Pagination Section */}
      <div className="p-4 border-t mt-auto">
        <TablePagination table={table} />
      </div>
    </div>
  );
};

export default DataTable;