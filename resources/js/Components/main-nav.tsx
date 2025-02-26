import type React from "react"

import { useState, useEffect } from "react"
import { usePage } from "@inertiajs/react"
import { Activity, BarChart3, ChevronDown, Home, Network, Settings, Users, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/Components/ui/sidebar"
import { Link } from "@inertiajs/react"

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

function NavSection({ item }: { item: NavItem }) {
  const { url } = usePage()
  const [isOpen, setIsOpen] = useState(false)

  // Check if any child route is active
  const isChildActive = item.items?.some((subItem) => url === subItem.href)
  const isActive = url === item.href || isChildActive

  // Set initial open state based on active child
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true)
    }
  }, [isChildActive])

  if (item.items) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={isActive} className="w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
          {item.icon}
          <span>{item.title}</span>
          <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </SidebarMenuButton>
        {isOpen && (
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton asChild isActive={url === subItem.href}>
                  <Link href={subItem.href}>{subItem.title}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href!}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function MainNav() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <NavSection key={item.title} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}