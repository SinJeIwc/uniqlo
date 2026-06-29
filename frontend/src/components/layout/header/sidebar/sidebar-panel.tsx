"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TABS, type TabId } from "../navbar";
import { SearchButton } from "../search";
import { SidebarCategories } from "./sidebar-categories";
import type { CategoryNavItem } from "@/components/home/types";

const SM = 640;

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SM - 1}px)`);
    const onChange = () => setMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

interface SidebarPanelProps {
  activeTab: TabId | null;
  items: CategoryNavItem[];
}

export function SidebarPanel({ activeTab, items }: SidebarPanelProps) {
  const { setOpen } = useSidebar();
  const isMobile = useMobile();
  const close = () => setOpen(false);

  return (
    <Sidebar side={isMobile ? "right" : "top"}>
      <SidebarHeader>
        <div className="flex items-center gap-1 px-3 h-14">
          <SearchButton />
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={close}
            aria-label="Закрыть"
          >
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
  );
}
