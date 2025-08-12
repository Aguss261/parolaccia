"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore, cartSelectors } from "@/store/cart-store"

export function Header() {
  const count = useCartStore((s) => cartSelectors.count(s))
  const setChatOpen = useCartStore((s) => s.setChatOpen)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="relative mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-[family-name:var(--font-display)] bg-gradient-to-r from-[#7a1c1c] to-[#d4af37] bg-clip-text text-transparent">
            Parolaccia Trattoria
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/menu">
            <Button
              variant="outline"
              className="rounded-full border-[#d4af37]/50 bg-white/70 text-sm text-[#7a1c1c] hover:bg-[#fff6e6] dark:border-[#7a1c1c] dark:bg-neutral-900 dark:text-[#e7c97e] dark:hover:bg-neutral-800"
            >
              Ver Carta
            </Button>
          </Link>
          <Button
            aria-label="Abrir chat"
            variant="ghost"
            className="relative rounded-full"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="h-6 w-6 text-[#7a1c1c]" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] px-1 text-xs font-medium text-white shadow-sm">
                {count}
              </span>
            )}
          </Button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-[1px] h-[2px] bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37]" />
      </div>
    </header>
  )
}
