"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TABS, type TabId } from "./navbar";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: TabId | null;
}

export function Sidebar({ open, onClose, activeTab }: SidebarProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50 cursor-default"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        aria-label="Закрыть меню"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-xl">
        <div className="p-6 space-y-6">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-zinc-500"
          >
            <X className="size-5" />
          </Button>

          <div className="space-y-3">
            {TABS.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "block text-sm",
                  activeTab === tab.id ? "text-black font-medium" : "text-zinc-600",
                )}
                onClick={onClose}
              >
                {tab.label}
              </Link>
            ))}
            <hr />
            <Link href="/search" className="block text-sm text-zinc-600">
              Поиск
            </Link>
            <Link href="/wishlist" className="block text-sm text-zinc-600">
              Избранное
            </Link>
            <Link href="/account" className="block text-sm text-zinc-600">
              Аккаунт
            </Link>
            <Link href="/cart" className="block text-sm text-zinc-600">
              Корзина
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
