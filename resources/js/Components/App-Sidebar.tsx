import React from "react"
import { Globe2 } from "lucide-react"
import { Link } from "@inertiajs/react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset
} from "@/Components/ui/sidebar"
import { MainNav } from "@/Components/main-nav"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Globe2 className="h-6 w-6" />
          <span>Admin Portal</span>
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <MainNav />
      </SidebarContent>
    </Sidebar>
  )
}