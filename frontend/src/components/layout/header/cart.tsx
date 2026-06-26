"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      render={<Link href="/cart" />}
      nativeButton={false}
      className="size-11"
      aria-label="Корзина"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} />
    </Button>
  );
}
