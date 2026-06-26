"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileButtons() {
  return (
    <>
      {/* Wishlist — only desktop (lg+) */}
      <Button
        variant="ghost"
        size="icon"
        render={<Link href="/wishlist" />}
        nativeButton={false}
        className="size-11 hidden lg:flex"
        aria-label="Избранное"
      >
        <Heart className="size-5" strokeWidth={1.5} />
      </Button>

      {/* Account — always visible */}
      <Button
        variant="ghost"
        size="icon"
        render={<Link href="/account" />}
        nativeButton={false}
        className="size-11"
        aria-label="Аккаунт"
      >
        <User className="size-5" strokeWidth={1.5} />
      </Button>
    </>
  );
}
