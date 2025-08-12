"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart-store"

export function TableSetupModal() {
  const mesaId = useCartStore((s) => s.mesaId)
  const comensales = useCartStore((s) => s.comensales)
  const setMesa = useCartStore((s) => s.setMesa)
  const setComensales = useCartStore((s) => s.setComensales)

  const [open, setOpen] = useState(false)
  const [mesa, setMesaLocal] = useState(mesaId || "")
  const [people, setPeople] = useState(comensales || 2)

  useEffect(() => {
    if (!mesaId) setOpen(true)
  }, [mesaId])

  function save() {
    setMesa(mesa.trim() || "1")
    setComensales(Math.max(1, people))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Configurar mesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="mesa" className="text-sm">
              Mesa
            </label>
            <Input id="mesa" value={mesa} onChange={(e) => setMesaLocal(e.target.value)} placeholder="Ej: 12" />
          </div>
          <div>
            <label htmlFor="comensales" className="text-sm">
              Comensales
            </label>
            <Input
              id="comensales"
              inputMode="numeric"
              pattern="[0-9]*"
              value={people}
              onChange={(e) => setPeople(Number.parseInt(e.target.value || "1", 10) || 1)}
            />
          </div>
          <Button
            onClick={save}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
