"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart3, ChevronDown, Home, Network, Settings, Users, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible"

interface NavItem {
  title: string
  icon: React.ReactNode
  href?: string
  items?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    icon: <Home className="w-5 h-5" />,
    href: "/",
  },
  {
    title: "PPPoE",
    icon: <Network className="w-5 h-5" />,
    items: [
      { title: "Active Connections", href: "/pppoe/active" },
      { title: "Connection History", href: "/pppoe/history" },
      { title: "Settings", href: "/pppoe/settings" },
    ],
  },
  {
    title: "Hotspot",
    icon: <Wifi className="w-5 h-5" />,
    items: [
      { title: "Active Users", href: "/hotspot/active" },
      { title: "User Profiles", href: "/hotspot/profiles" },
      { title: "Configuration", href: "/hotspot/config" },
    ],
  },
  {
    title: "Users",
    icon: <Users className="w-5 h-5" />,
    items: [
      { title: "All Users", href: "/users" },
      { title: "Add User", href: "/users/add" },
      { title: "User Groups", href: "/users/groups" },
    ],
  },
  {
    title: "Network",
    icon: <Activity className="w-5 h-5" />,
    items: [
      { title: "Bandwidth Monitor", href: "/network/bandwidth" },
      { title: "Traffic Analysis", href: "/network/traffic" },
      { title: "Network Map", href: "/network/map" },
    ],
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/analytics",
  },
  {
    title: "Settings",
    icon: <Settings className="w-5 h-5" />,
    href: "/settings",
  },
]

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Check if any child route is active
  const isChildActive = item.items?.some((subItem) => pathname === subItem.href)

  // Set initial open state based on active child
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true)
    }
  }, [isChildActive])

  if (item.items) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted",
            isChildActive ? "text-primary font-medium" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {item.title}
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 px-9 py-1">
          {item.items.map((subItem) => (
            <Link
              key={subItem.href}
              href={subItem.href}
              className={cn(
                "flex rounded-lg py-1.5 text-sm transition-colors hover:text-primary",
                pathname === subItem.href ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              {subItem.title}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-primary",
        pathname === item.href ? "bg-muted text-primary font-medium" : "text-muted-foreground",
      )}
    >
      {item.icon}
      {item.title}
    </Link>
  )
}

export function NavItems({ className }: { className?: string }) {
  return (
    <nav className={cn("space-y-1", className)}>
      {navItems.map((item) => (
        <NavLink key={item.title} item={item} />
      ))}
    </nav>
  )
}

