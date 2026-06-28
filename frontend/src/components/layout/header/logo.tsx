import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function HeaderLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("shrink-0", className)} aria-label="UNIQLO">
      <Image
        src="/uniqlo-logo.svg"
        alt="UNIQLO KG"
        width={75}
        height={34}
        className="h-8.5 w-auto"
        priority
      />
    </Link>
  );
}
