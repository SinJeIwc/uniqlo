"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import type { TabId } from "./navbar";

interface MobileMenuProps {
  activeTab: TabId | null;
}

export function MobileMenu({ activeTab }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={() => setOpen(!open)}
        aria-label="Меню"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </Button>

      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        activeTab={activeTab}
      />
    </>
  );
}
