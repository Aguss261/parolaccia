"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatARS } from "@/lib/format"

type MenuItem = { sku: string; name: string; price: number }
export type Category = { id: string; name: string; items: MenuItem[] }

export function MenuCategory({ category }: { category: Category }) {
  return (
    <section aria-label={category.name} className="space-y-3">
      <h3 className="px-1 text-base font-semibold font-[family-name:var(--font-display)] bg-gradient-to-r from-[#7a1c1c] to-[#d4af37] bg-clip-text text-transparent">
        {category.name}
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {category.items.map((item) => (
          <MenuItemCard key={item.sku} item={item} categoryId={category.id} />
        ))}
      </div>
    </section>
  )
}

function MenuItemCard({ item, categoryId }: { item: MenuItem; categoryId: string }) {
  const [qty, setQty] = useState(1)
  const addToCart = useCartStore((s) => s.addToCart)
  const openChatWithProduct = useCartStore((s) => s.openChatWithProduct)

  return (
    <Card className="rounded-xl border-[#e8dcc0] shadow-sm dark:border-neutral-800">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 pb-4">
        <span className="text-sm font-medium">{formatARS(item.price)}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Disminuir cantidad"
            className="h-8 w-8 border-[#e7c97e] bg-transparent hover:bg-[#fff6e6] dark:border-[#7a1c1c] dark:hover:bg-neutral-900"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => {
              const v = Number.parseInt(e.target.value || "1", 10)
              setQty(isNaN(v) ? 1 : Math.max(1, v))
            }}
            className="h-8 w-12 text-center"
            aria-label="Cantidad"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Aumentar cantidad"
            className="h-8 w-8 border-[#e7c97e] bg-transparent hover:bg-[#fff6e6] dark:border-[#7a1c1c] dark:hover:bg-neutral-900"
            onClick={() => setQty((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            className="ml-2 bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white hover:brightness-105"
            onClick={() => openChatWithProduct(item.name)}
          >
            Agregar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
