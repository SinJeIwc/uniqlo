import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClientProviders } from "@/components/layout/ClientProviders"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "UNIQLO | Кыргызстан",
  description: "Стильная и комфортная одежда от UNIQLO Кыргызстан.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <body className="min-h-full">
        <ClientProviders>
          <TooltipProvider>{children}</TooltipProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
