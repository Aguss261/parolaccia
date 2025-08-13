"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, Bot, Check, X } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import { useCartStore, cartSelectors, type Message } from "@/store/cart-store"
import { formatARS } from "@/lib/format"
import { useRouter } from "next/navigation"

type MenuItem = { sku: string; name: string; price: number }
type Category = { id: string; name: string; items: MenuItem[] }
type MenuJSON = { currency: string; categories: Category[] }

export function ChatWidget() {
  const router = useRouter()
  const isOpen = useCartStore((s) => s.isChatOpen)
  const setOpen = useCartStore((s) => s.setChatOpen)
  const mesaId = useCartStore((s) => s.mesaId)
  const comensales = useCartStore((s) => s.comensales)
  const primerPedido = useCartStore((s) => s.primerPedido)
  const cart = useCartStore((s) => s.cart)
  const addToCart = useCartStore((s) => s.addToCart)
  const updateNotes = useCartStore((s) => s.updateNotes)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const setPrimerPedido = useCartStore((s) => s.setPrimerPedido)
  // const resetSession = useCartStore((s) => s.resetSession) // Commented out to fix unused var
  const total = useCartStore((s) => cartSelectors.total(s))
  const chatPrefilledText = useCartStore((s) => s.chatPrefilledText)
  const clearChatPrefilledText = useCartStore((s) => s.clearChatPrefilledText)
  const messages = useCartStore((s) => s.messages)
  const addMessage = useCartStore((s) => s.addMessage)
  // const setMessages = useCartStore((s) => s.setMessages) // Commented out to fix unused var

  const [menu, setMenu] = useState<MenuJSON | null>(null)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const summary = useMemo(
    () => cart.map((i) => `${i.qty} x ${i.name}${i.notes ? ` (${i.notes})` : ""}`).join(" · "),
    [cart],
  )

  useEffect(() => {
    fetch("/menu.json")
      .then((r) => r.json())
      .then((j) => setMenu(j))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Solo inicializar mensaje de bienvenida si no hay mensajes previos
      const greeting = "Hola, ¿qué van a pedir?"
      addMessage({ id: "welcome", role: "assistant", content: greeting })
    }
    // No limpiar mensajes al cerrar - mantener la conversación
  }, [isOpen, messages.length, addMessage])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing, awaitingConfirm])

  // Manejar el texto pre-llenado cuando se abre el chat
  useEffect(() => {
    if (isOpen && chatPrefilledText) {
      setInput(chatPrefilledText)
      clearChatPrefilledText()
    }
  }, [isOpen, chatPrefilledText, clearChatPrefilledText])

  async function handleSend() {
    if (!input.trim() || !menu) return
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input.trim() }
    addMessage(userMessage)
    setInput("")
    setTyping(true)
    setAwaitingConfirm(false)

    const payload = {
      message: userMessage.content,
      locale: typeof navigator !== "undefined" ? navigator.language : "es-AR",
      mesaId,
      comensales,
      primerPedido,
      cart,
      menu,
    }

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data: {
        assistantMessage: string
        cartOps?: Array<
          | { type: "add"; sku: string; qty: number; notes?: string }
          | { type: "remove"; sku: string; qty?: number }
          | { type: "updateNotes"; sku: string; notes: string }
        >
        requireConfirmation?: boolean
      } = await res.json()

      data.cartOps?.forEach((op) => {
        const cat = menu.categories.find((c) => c.items.some((i) => i.sku === op.sku))
        const item = cat?.items.find((i) => i.sku === op.sku)
        if (!cat || !item) return
        if (op.type === "add") {
          addToCart({
            sku: item.sku,
            name: item.name,
            price: item.price,
            qty: op.qty,
            notes: op.notes,
            categoryId: cat.id,
          })
        } else if (op.type === "remove") {
          removeFromCart(op.sku, op.qty)
        } else if (op.type === "updateNotes") {
          updateNotes(op.sku, op.notes)
        }
      })

      await new Promise((r) => setTimeout(r, 450))
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: data.assistantMessage })
      if (data.requireConfirmation) {
        setAwaitingConfirm(true)
      }
    } catch {
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: "Ocurrió un error. Intenta de nuevo." })
    } finally {
      setTyping(false)
    }
  }

  function confirmOrder() {
    setAwaitingConfirm(false)
    setPrimerPedido(false)
    router.push("/success")
  }

  function cancelConfirm() {
    setAwaitingConfirm(false)
    addMessage({
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Ok. ¿Te ayudo con algo más?",
    })
  }

  const canSend = input.trim().length > 0

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-2xl border-neutral-200 bg-white p-0 pb-2 dark:border-neutral-800 dark:bg-neutral-950"
        aria-label="Asistente Parolaccia"
      >
        <div className="flex flex-col">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] px-4 py-3 text-white dark:border-neutral-800">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-sm font-semibold font-[family-name:var(--font-display)]">Asistente Parolaccia</h2>
          </div>

          <div ref={listRef} className="h-[55vh] overflow-y-auto px-3 py-3" aria-live="polite">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {typing && (
              <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Escribiendo…</span>
              </div>
            )}
          </div>

          {awaitingConfirm && (
            <div
              className="mx-3 mb-2 rounded-xl border bg-[#fff7e6] p-3 text-sm text-[#7a1c1c] shadow-sm dark:border-[#7a1c1c]/40 dark:bg-[#1b1513]"
              role="region"
              aria-label="Confirmación de pedido"
            >
              <p className="mb-2">Resumen: {summary}</p>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{formatARS(total)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={confirmOrder}
                  className="flex-1 bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white hover:brightness-105"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar
                </Button>
                <Button
                  onClick={cancelConfirm}
                  variant="outline"
                  className="flex-1 border-[#d4af37]/60 text-[#7a1c1c] hover:bg-[#fff6e6] dark:border-[#7a1c1c] dark:text-[#e7c97e] dark:hover:bg-neutral-900 bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          )}

          <div className="mt-auto flex items-end gap-2 border-t px-3 py-2 dark:border-neutral-800">
            <label htmlFor="chat-input" className="sr-only">
              Escribe un mensaje
            </label>
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pedido…"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Enviar mensaje"
              className="bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white hover:brightness-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 py-2 text-right text-xs text-neutral-600 dark:text-neutral-400">
            Total: {formatARS(total)}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
