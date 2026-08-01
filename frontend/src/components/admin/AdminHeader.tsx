"use client";

import { FolderTree, LayoutDashboard, LogOut, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  user: SessionUser;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
  },
];

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full container mx-auto border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center gap-6 px-4">
        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-lg tracking-tight transition-colors hover:text-primary"
        >
          <Image
            src="/uniqlo-logo.svg"
            alt="Logo"
            width={75}
            height={34}
          />
          <span>Admin Panel</span>
        </Link>

        <Separator orientation="vertical" className="h-6" />

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-transform group-hover:scale-110",
                    isActive && "text-primary",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Section */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
