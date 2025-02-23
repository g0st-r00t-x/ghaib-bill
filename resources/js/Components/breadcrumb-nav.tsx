import { ChevronRight, Home } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";

export function BreadcrumbNav() {
  const { url } = usePage();
  const segments = url.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span className="hidden md:inline">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        // Optional: Format segment text for display
        const formattedSegment = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            <Link
              href={path}
              className={cn(
                "capitalize ml-1 transition-colors",
                isLast
                  ? "text-foreground pointer-events-none font-medium"
                  : "hover:text-foreground"
              )}
            >
              {formattedSegment}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}