import React, { type ReactNode } from "react";
import { Activity, BarChart3, ChevronDown, Home, Network, Settings, Users, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

interface NavItem {
  title: string;
  icon: ReactNode;
  href?: string;
  items?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    icon: <Home className="h-5 w-5" />,
    href: route('dashboard'),
  },
  {
    title: "PPPoE",
    icon: <Network className="h-5 w-5" />,
    items: [
      { title: "Active Connections", href: route('pppoe.active') },
      { title: "Connection History", href: route('pppoe.history') },
      { title: "Settings", href: route('pppoe.settings') },
    ],
  },
  {
    title: "Hotspot",
    icon: <Wifi className="h-5 w-5" />,
    items: [
      { title: "Active Users", href: route('hotspot.active') },
      { title: "User Profiles", href: route('hotspot.profiles') },
      { title: "Configuration", href: route('hotspot.config') },
    ],
  },
  {
    title: "Users",
    icon: <Users className="h-5 w-5" />,
    items: [
      { title: "All Users", href: route('users.index') },
      { title: "Add User", href: route('users.create') },
      { title: "User Groups", href: route('users.groups') },
    ],
  },
  {
    title: "Network",
    icon: <Activity className="h-5 w-5" />,
    items: [
      { title: "Bandwidth Monitor", href: route('network.bandwidth') },
      { title: "Traffic Analysis", href: route('network.traffic') },
      { title: "Network Map", href: route('network.map') },
    ],
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    href: route('analytics'),
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: route('settings'),
  },
];


function NavLink({ item }: { item: NavItem }) {
  const { url } = usePage();
  const [isOpen, setIsOpen] = useState(false);

  // Check if current URL matches any child route
  const isChildActive = item.items?.some((subItem) => url.startsWith(subItem.href));

  // Check if current URL exactly matches the item's href
  const isExactMatch = item.href === url;

  // Combined active state for parent
  const isParentActive = isChildActive || isExactMatch;

  // Persist open state in localStorage
  useEffect(() => {
    const storedState = localStorage.getItem(`nav-${item.title}`);
    if (storedState) {
      setIsOpen(JSON.parse(storedState));
    }
  }, [item.title]);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(`nav-${item.title}`, JSON.stringify(isOpen));
  }, [isOpen, item.title]);

  // Auto-open when child is active
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  if (item.items) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted",
            isParentActive
              ? "bg-muted/50 font-medium text-primary"
              : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            {React.cloneElement(item.icon as React.ReactElement, {
              className: cn(
                "h-5 w-5",
                isParentActive ? "text-primary" : "text-muted-foreground"
              )
            })}
            {item.title}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180",
              isParentActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 px-9 py-1">
          {item.items.map((subItem) => (
            <Link
              key={subItem.href}
              href={subItem.href}
              className={cn(
                "flex rounded-lg py-1.5 text-sm transition-colors hover:text-primary",
                url.startsWith(subItem.href)
                  ? "font-medium text-blue-700"
                  : "text-red-700"
              )}
            >
              {subItem.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-primary",
        isExactMatch
          ? "bg-muted/50 font-medium text-primary"
          : "text-muted-foreground"
      )}
    >
      {React.cloneElement(item.icon as React.ReactElement, {
        className: cn(
          "h-5 w-5",
          isExactMatch ? "text-primary" : "text-muted-foreground"
        )
      })}
      {item.title}
    </Link>
  );
}

export function NavItems({ className }: { className?: string }) {
  return (
    <nav className={cn("space-y-1", className)}>
      {navItems.map((item) => (
        <NavLink key={item.title} item={item} />
      ))}
    </nav>
  );
}