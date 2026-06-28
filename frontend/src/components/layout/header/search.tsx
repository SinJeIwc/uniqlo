"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchButton() {
  return (
    <Button className="w-full flex items-center justify-start h-10 px-3 ml-auto mr-3 rounded-full bg-white text-zinc-400 border border-zinc-200 lg:flex-none">
      <Search className="size-4" strokeWidth={1.5} />
      <span className="lg:hidden">Поиск</span>
      <span className="hidden lg:inline">Что вы ищете?</span>
    </Button>
  );
}
