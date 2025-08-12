import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-white px-6 text-center text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_30%_at_50%_10%,rgba(122,28,28,0.12),transparent)]" />
      <h1 className="mb-2 bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] bg-clip-text text-2xl font-extrabold text-transparent font-[family-name:var(--font-display)]">
        Pedido confirmado
      </h1>
      <p className="mb-6 text-sm text-neutral-700 dark:text-neutral-300">¡Gracias! Estamos preparando tu pedido.</p>
      <Link href="/menu">
        <Button className="bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white hover:brightness-105">
          Volver a la carta
        </Button>
      </Link>
    </main>
  )
}
