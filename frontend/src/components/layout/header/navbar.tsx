import Link from "next/link";
import { cn } from "@/lib/utils";

export const TABS = [
  { id: "women", label: "WOMEN", href: "/" },
  { id: "men", label: "MEN", href: "/men" },
  { id: "kids", label: "KIDS", href: "/kids" },
  { id: "baby", label: "BABY", href: "/baby" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface NavbarProps {
  activeTab: TabId | null;
}

function tabLinkClass(isActive: boolean) {
  return cn(
    "flex items-center justify-center text-[17px] font-normal tracking-[0.022em] border-b-2 transition-colors whitespace-nowrap",
    "font-[UniqloPro]",
    isActive ? cn("border-white") : cn("border-transparent"),
  );
}

/** Desktop: inline tabs in the main header row */
export function NavbarDesktop({ activeTab }: NavbarProps) {
  return (
    <nav className="hidden lg:flex items-center h-full ml-6">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(tabLinkClass(activeTab === tab.id), "h-full px-3")}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

/** Mobile: 4-column grid below the main row, 44px height */
export function NavbarMobile({ activeTab }: NavbarProps) {
  return (
    <div className="lg:hidden max-w-[1200px] mx-auto px-4 h-11 grid grid-cols-4">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(tabLinkClass(activeTab === tab.id), "h-full px-0")}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
