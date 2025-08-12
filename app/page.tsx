"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { BottomBar } from "@/components/bottom-bar"
import { ChatWidget } from "@/components/chat-widget"
import { TableSetupModal } from "@/components/table-setup-modal"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="relative mx-auto min-h-screen max-w-md bg-white pb-24 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_40%_at_50%_0%,rgba(122,28,28,0.12),transparent),linear-gradient(180deg,rgba(212,175,55,0.06),transparent)]" />
      <Header />
      <section className="relative px-6 py-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#7a1c1c] via-[#a6342f] to-[#d4af37] p-[1px]">
          <div className="rounded-2xl bg-white/92 p-5 dark:bg-neutral-950/80">
            <h1 className="mb-2 bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] bg-clip-text text-2xl font-extrabold text-transparent font-[family-name:var(--font-display)]">
              Parolaccia Trattoria
            </h1>
            <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">Cucina italiana. Pedí desde tu mesa.</p>
            <div className="flex gap-3">
              <Link href="/menu">
                <Button className="bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white hover:brightness-105">
                  Ver Carta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <BottomBar />
      <ChatWidget />
      <TableSetupModal />
    </main>
  )
}
