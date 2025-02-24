import React from 'react';
import { Input } from '@/Components/ui/input';

export const TableSearch = ({ table }) => (
  <div className="flex-1 min-w-[200px]">
    <Input
      placeholder="Filter by username..."
      value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
      onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
      className="w-full"
    />
  </div>
);