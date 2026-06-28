"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileButtons() {
  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        render={<Link href="/wishlist" />}
        nativeButton={false}
        className="hidden lg:inline-flex"
        aria-label="Избранное"
      >
        <Heart className="size-5" strokeWidth={1.5} />
      </Button>

      <Button
        variant="ghost"
        size="icon-lg"
        render={<Link href="/member" />}
        nativeButton={false}
        aria-label="Аккаунт"
      >
        <User className="size-5" strokeWidth={1.5} />
      </Button>
    </>
  );
}
