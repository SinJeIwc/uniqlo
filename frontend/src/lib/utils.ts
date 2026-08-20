import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price with thousand separators (server/client consistent).
 * Avoids hydration mismatch from toLocaleString().
 */
export function formatPrice(price: number): string {
	return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
