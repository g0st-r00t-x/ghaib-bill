// TableFilters.tsx
import { Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';

export const TableFilters = ({ addFilter }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="whitespace-nowrap">
        <Filter className="mr-2 h-4 w-4" />
        Filter
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[200px]">
      <SpeedFilters addFilter={addFilter} />
      <PlanFilters addFilter={addFilter} />
      <SignalFilters addFilter={addFilter} />
    </DropdownMenuContent>
  </DropdownMenu>
);

// SpeedFilters.tsx
const SpeedFilters = ({ addFilter }) => (
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
);

// PlanFilters.tsx
const PlanFilters = ({ addFilter }) => (
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
);

// SignalFilters.tsx
const SignalFilters = ({ addFilter }) => (
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
);