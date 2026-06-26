"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchButton() {
  return (
    <>
      {/* Desktop: pill button */}
      <Link
        href="/search"
        className="hidden lg:flex items-center gap-1.5 h-10 px-4 mr-3 rounded-full border transition-colors text-sm"
      >
        <Search className="size-5" strokeWidth={1.5} />
        <span>Поиск</span>
      </Link>

      {/* Mobile: icon only */}
      <Button
        variant="ghost"
        size="icon"
        render={<Link href="/search" />}
        nativeButton={false}
        className="size-11"
        aria-label="Поиск"
      >
        <Search className="size-5" strokeWidth={1.5} />
      </Button>
    </>
  );
}
