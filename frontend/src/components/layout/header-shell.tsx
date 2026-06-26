"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import type { TabId } from "./header/navbar";

function getActiveTab(pathname: string): TabId | null {
  if (pathname === "/" || pathname.startsWith("/categories/women")) return "women";
  if (pathname.startsWith("/men") || pathname.startsWith("/categories/men")) return "men";
  if (pathname.startsWith("/kids") || pathname.startsWith("/categories/kids")) return "kids";
  if (pathname.startsWith("/baby") || pathname.startsWith("/categories/baby")) return "baby";
  return null;
}

export function HeaderShell() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);
  const isHome = pathname === "/";

  return <Header activeTab={activeTab} isHome={isHome} />;
}
