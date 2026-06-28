"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchButton() {
  return (
    <Button
      variant="pill"
      className="min-w-0 flex-1 lg:flex-none w-full max-w-95.5 ml-auto h-9.5 lg:h-11 px-3 lg:mr-3 justify-start bg-white text-muted-foreground/90 font-normal text-base border border-border"
    >
      <Search className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="lg:hidden">Поиск</span>
      <span className="hidden lg:inline">Что вы ищете?</span>
    </Button>
  )
}
