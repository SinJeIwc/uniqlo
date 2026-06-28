"use client"

import { Heart, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import type { NavItem } from "@/lib/api/categories"
import { cn } from "@/lib/utils"
import { TABS, type TabId } from "../navbar"
import { SearchButton } from "../search"
import { SidebarCategories } from "./sidebar-categories"

interface SidebarMobileProps {
  activeTab: TabId | null
  items: NavItem[]
}

export function SidebarMobile({ activeTab, items }: SidebarMobileProps) {
  const { setOpenMobile } = useSidebar()
  const close = () => setOpenMobile(false)

  return (
    <Sidebar side="right" className="bg-white">
      <SidebarHeader className="flex flex-col gap-0 p-0">
        <div className="flex items-center gap-1 px-3 h-14">
          <SearchButton />
          <Button
            variant="ghost"
            size="icon-lg"
            render={<Link href="/wishlist" />}
            nativeButton={false}
            aria-label="Избранное"
            onClick={close}
          >
            <Heart className="size-5" strokeWidth={1.5} />
          </Button>
          <Button variant="ghost" size="icon-lg" onClick={close} aria-label="Закрыть">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex px-3 h-11 items-center gap-0 border-b border-border">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex-1 flex items-center justify-center h-full text-[15px] tracking-[0.022em] border-b-2 whitespace-nowrap font-[UniqloProRegular,sans-serif]",
                activeTab === tab.id ? "border-black" : "border-transparent",
              )}
              onClick={close}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarCategories items={items} onClose={close} />
      </SidebarContent>
    </Sidebar>
  )
}
