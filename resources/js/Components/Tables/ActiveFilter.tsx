import { X } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

export const ActiveFilters = ({ activeFilters, removeFilter, resetFilters }) => (
  activeFilters.length > 0 && (
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
        onClick={resetFilters}
      >
        Clear all
      </Button>
    </div>
  )
);