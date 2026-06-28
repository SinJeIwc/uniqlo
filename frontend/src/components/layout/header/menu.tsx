"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import type { TabId } from "./navbar";

interface MenuProps {
  activeTab: TabId | null;
}

export function Menu({ activeTab }: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        <MenuIcon className="size-5" strokeWidth={1.5} />
      </Button>

      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        activeTab={activeTab}
      />
    </>
  );
}
