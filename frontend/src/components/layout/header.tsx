"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, User, ShoppingCart, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "women", label: "WOMEN", href: "/" },
  { id: "men", label: "MEN", href: "/men" },
  { id: "kids", label: "KIDS", href: "/kids" },
  { id: "baby", label: "BABY", href: "/baby" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/categories/women"))
      return "women";
    if (pathname.startsWith("/men") || pathname.startsWith("/categories/men"))
      return "men";
    if (pathname.startsWith("/kids") || pathname.startsWith("/categories/kids"))
      return "kids";
    if (pathname.startsWith("/baby") || pathname.startsWith("/categories/baby"))
      return "baby";
    return null;
  };

  const activeTab = getActiveTab();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full container mx-auto">
      {/* Main bar — 64px desktop, 56px mobile — transparent, no background space */}
      <div
        className={cn(
          "max-w-[1200px] mx-auto px-4 lg:px-6",
          "h-14 lg:h-16",
          "flex items-center gap-0",
        )}
      >
        {/* Logo — SVG */}
        <Link href="/" className="flex-shrink-0 mr-6 lg:mr-8">
          <Image
            src="/uniqlo-logo.svg"
            alt="UNIQLO KG"
            width={75}
            height={34}
            className="h-[34px] w-auto"
            priority
          />
        </Link>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center h-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "h-full flex items-center px-3 font-bold tracking-wide border-b-2 transition-colors",
                  "text-[17px]",
                  "font-[UniqloPro]",
                  isActive
                    ? cn(
                        isHome
                          ? "text-white border-white"
                          : "text-black border-black",
                      )
                    : cn(
                        "border-transparent",
                        isHome
                          ? "text-white/70 hover:text-white"
                          : "text-zinc-400 hover:text-black",
                      ),
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Icons */}
        <div className="flex items-center gap-1">
          {[
            { href: "/search", icon: Search, label: "Поиск" },
            { href: "/wishlist", icon: Heart, label: "Избранное" },
            { href: "/account", icon: User, label: "Аккаунт" },
            { href: "/cart", icon: ShoppingCart, label: "Корзина" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "p-2.5 transition-colors",
                isHome
                  ? "text-white/70 hover:text-white"
                  : "text-zinc-400 hover:text-black",
              )}
              aria-label={label}
            >
              <Icon className="size-[18px]" strokeWidth={1.5} />
            </Link>
          ))}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "lg:hidden p-2.5 transition-colors",
              isHome
                ? "text-white/70 hover:text-white"
                : "text-zinc-400 hover:text-black",
            )}
            aria-label="Меню"
          >
            <Menu className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile tabs row — 44px */}
      <div
        className={cn(
          "lg:hidden",
          "max-w-[1200px] mx-auto px-4",
          "h-11",
          "flex items-center gap-0 overflow-x-auto",
        )}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex-shrink-0 px-3 text-[17px] font-bold tracking-wide border-b-2 transition-colors whitespace-nowrap",
                "font-[UniqloPro]",
                isActive
                  ? cn(
                      isHome
                        ? "text-white border-white"
                        : "text-black border-black",
                    )
                  : cn(
                      "border-transparent",
                      isHome ? "text-white/70" : "text-zinc-400",
                    ),
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-xl">
            <div className="p-6 space-y-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-500"
              >
                ✕ Закрыть
              </button>
              <div className="space-y-3">
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
      )}
    </header>
  );
}
