"use client"

import { X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import type { NavItem } from "@/lib/api/categories"
import { cn } from "@/lib/utils"
import { HeaderLogo } from "../logo"
import { TABS, type TabId } from "../navbar"
import { SearchButton } from "../search"
import { SidebarCategories } from "./sidebar-categories"

interface SidebarDesktopProps {
  activeTab: TabId | null
  items: NavItem[]
}

export function SidebarDesktop({ activeTab, items }: SidebarDesktopProps) {
  const { open, setOpen } = useSidebar()

  if (!open) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[85vh] bg-white flex flex-col gap-0 overflow-y-auto">
      <div className="container mx-auto px-3 h-14 flex items-center gap-6 shrink-0">
        <HeaderLogo />
        <nav className="flex items-center h-full gap-6">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "h-full flex items-center text-[17px] tracking-[0.022em] border-b-2 whitespace-nowrap font-[UniqloProRegular,sans-serif]",
                activeTab === tab.id ? "border-black" : "border-transparent",
              )}
              onClick={() => setOpen(false)}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Button variant="ghost" size="icon-lg" onClick={() => setOpen(false)} aria-label="Закрыть">
          <X className="size-5" />
        </Button>
      </div>

      <div className="container mx-auto px-3 pb-4 shrink-0">
        <SearchButton />
      </div>

      <div className="container mx-auto px-3 pb-8">
        <SidebarCategories items={items} onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
