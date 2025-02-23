"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Globe2, Menu } from "lucide-react"
import { Navbar } from "@/Components/navbar"
import { NavItems } from "@/Components/nav-items"
import { MobileSidebar } from "@/Components/layout/mobile-sidebar"
import { Link } from "@inertiajs/react"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background transition-transform lg:block",
          !isSidebarOpen && "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Globe2 className="h-6 w-6" />
            <span>Network Monitor</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <NavItems className="p-4" />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all", isSidebarOpen ? "lg:pl-64" : "lg:pl-0")}>
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center gap-4 px-4">
            <div className="flex items-center gap-2">
              <MobileSidebar />
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </div>
            <div className="ml-auto">
              <Navbar />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

