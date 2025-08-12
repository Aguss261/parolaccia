"use client"

import Link from "next/link"
import { Home, UtensilsCrossed, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore, cartSelectors } from "@/store/cart-store"

export function BottomBar() {
  const count = useCartStore((s) => cartSelectors.count(s))
  const setChatOpen = useCartStore((s) => s.setChatOpen)

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t bg-white/85 px-4 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="grid grid-cols-3 items-center text-sm">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 text-neutral-700 dark:text-neutral-200">
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link href="/menu" className="flex flex-col items-center gap-1 p-2 text-neutral-700 dark:text-neutral-200">
            <UtensilsCrossed className="h-5 w-5" />
            <span>Carta</span>
          </Link>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="relative flex flex-col items-center gap-1 p-2 text-neutral-700 dark:text-neutral-200"
            aria-label="Abrir chat"
          >
            <MessageCircle className="h-5 w-5 text-[#7a1c1c]" />
            <span>Chat</span>
            {count > 0 && (
              <span className="absolute -right-1 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] px-1 text-xs font-medium text-white shadow-sm">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <Button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-16 right-4 z-50 rounded-full bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] px-4 py-6 text-white shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a1c1c]"
        aria-label="Abrir Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  )
}
