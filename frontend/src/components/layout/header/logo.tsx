import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function HeaderLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("shrink-0 px-3 lg:px-0", className)} aria-label="UNIQLO">
      <Image
        src="/uniqlo-logo.svg"
        alt="UNIQLO KG"
        width={75}
        height={34}
        className="h-7 sm:h-8.5 w-auto"
        priority
      />
    </Link>
  )
}
