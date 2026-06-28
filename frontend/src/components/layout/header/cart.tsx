"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartButton() {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      render={<Link href="/cart" />}
      nativeButton={false}
      aria-label="Корзина"
    >
      <ShoppingCartIcon className="size-5" strokeWidth={1.5} />
    </Button>
  );
}
