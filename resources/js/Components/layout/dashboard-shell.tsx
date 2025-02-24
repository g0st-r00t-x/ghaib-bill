
import type React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Globe2, Menu } from "lucide-react"
import { Navbar } from "@/Components/navbar"
import { NavItems } from "@/Components/nav-items"
import { MobileSidebar } from "@/Components/layout/mobile-sidebar"
import { Link } from "@inertiajs/react"

export function DashboardShell({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-screen w-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden h-screen w-72 border-r bg-background transition-transform lg:block",
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
      <main className={cn("w-full overflow-hidden transition-all ")}>
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center gap-4 px-4">
            <div className="flex items-center gap-2">
              <MobileSidebar />
            </div>
            <div className="ml-auto">
              <Navbar />
            </div>
          </div>
        </header>
        <section className="w-full overflow-hidden max-w-7xl mx-auto">
          {children}
        </section>
      </main>
    </div>
  )
}

