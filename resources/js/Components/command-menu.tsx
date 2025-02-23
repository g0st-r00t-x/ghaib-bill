"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calculator, Calendar, CreditCard, Settings, User, Network, Wifi, Search } from "lucide-react"
import type { Connection } from "@/Components/connections-table"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/Components/ui/command"
import { Button } from "./ui/button"

// This would come from your API
const connections: Connection[] = [
  {
    id: "1",
    username: "john.doe",
    ipAddress: "192.168.1.100",
    macAddress: "00:1B:44:11:3A:B7",
    uptime: "2 hours",
    downloadSpeed: "15.5",
    uploadSpeed: "5.2",
    signal: -65,
    status: "active",
    plan: "Premium",
  },
  {
    id: "2",
    username: "jane.smith",
    ipAddress: "192.168.1.101",
    macAddress: "00:1B:44:11:3A:B8",
    uptime: "5 hours",
    downloadSpeed: "22.3",
    uploadSpeed: "8.1",
    signal: -55,
    status: "active",
    plan: "Basic",
  },
]

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigateToConnection = (connection: Connection) => {
    const searchParams = new URLSearchParams({
      highlight: connection.id,
      username: connection.username,
      ip: connection.ipAddress,
    }).toString()

    router.push(`/pppoe/active?${searchParams}`)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="PPPoE Connections">
            {connections.map((connection) => (
              <CommandItem key={connection.id} onSelect={() => navigateToConnection(connection)}>
                <Network className="mr-2 h-4 w-4" />
                <span>{connection.username}</span>
                <span className="ml-2 text-sm text-muted-foreground">({connection.ipAddress})</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => router.push("/pppoe/active")}>
              <Network className="mr-2 h-4 w-4" />
              <span>All PPPoE Connections</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push("/hotspot/active")}>
              <Wifi className="mr-2 h-4 w-4" />
              <span>Active Hotspots</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="User">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tools">
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>IP Calculator</span>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Schedule</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

