"use client"

import { MenuIcon } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Menu() {
  return (
    <SidebarTrigger size="icon-lg" aria-label="Меню">
      <MenuIcon className="size-5" strokeWidth={1.5} />
    </SidebarTrigger>
  )
}
