"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Button } from "@/Components/ui/button"
import { Menu } from "lucide-react"
import { NavItems } from "@/Components/nav-items"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <NavItems className="p-2" />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

