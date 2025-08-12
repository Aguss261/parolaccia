"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type LineItem = {
  sku: string
  name: string
  qty: number
  price: number
  notes?: string
  categoryId: string
}

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const BEVERAGE_CATEGORIES = new Set(["bebidas", "cerveza", "aperitivo", "caffetteria"])
const MAIN_CATEGORIES = new Set(["carni", "risotti", "pesce", "polli", "la-nostra-pasta", "pasta-ripiena"])

type StoreState = {
  mesaId: string
  comensales: number
  primerPedido: boolean
  cart: LineItem[]
  messages: Message[]
  isChatOpen: boolean
  chatPrefilledText: string
}

type StoreActions = {
  setMesa: (mesaId: string) => void
  setComensales: (n: number) => void
  setPrimerPedido: (b: boolean) => void
  addToCart: (item: Omit<LineItem, "notes"> & { notes?: string }) => void
  removeFromCart: (sku: string, qty?: number) => void
  updateQty: (sku: string, qty: number) => void
  updateNotes: (sku: string, notes: string) => void
  clearCart: () => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  resetSession: () => void
  setChatOpen: (b: boolean) => void
  openChatWithProduct: (productName: string) => void
  clearChatPrefilledText: () => void
}

type Store = StoreState & StoreActions

export const useCartStore = create<Store>()(
  persist(
    (set, get) => ({
      mesaId: "",
      comensales: 2,
      primerPedido: true,
      cart: [],
      messages: [],
      isChatOpen: false,
      chatPrefilledText: "",

      setMesa: (mesaId) => set({ mesaId }),
      setComensales: (n) => set({ comensales: Math.max(1, n) }),
      setPrimerPedido: (b) => set({ primerPedido: b }),

      addToCart: (item) => {
        const cart = [...get().cart]
        const idx = cart.findIndex((i) => i.sku === item.sku)
        if (idx >= 0) {
          cart[idx] = { ...cart[idx], qty: cart[idx].qty + item.qty, notes: item.notes ?? cart[idx].notes }
        } else {
          cart.push({ ...item })
        }
        set({ cart })
      },

      removeFromCart: (sku, qty) => {
        const cart = [...get().cart]
        const idx = cart.findIndex((i) => i.sku === sku)
        if (idx >= 0) {
          if (qty && cart[idx].qty > qty) {
            cart[idx] = { ...cart[idx], qty: cart[idx].qty - qty }
          } else {
            cart.splice(idx, 1)
          }
          set({ cart })
        }
      },

      updateQty: (sku, qty) => {
        const cart = get().cart.map((i) => (i.sku === sku ? { ...i, qty: Math.max(1, qty) } : i))
        set({ cart })
      },

      updateNotes: (sku, notes) => {
        const cart = get().cart.map((i) => (i.sku === sku ? { ...i, notes } : i))
        set({ cart })
      },

      clearCart: () => set({ cart: [] }),

      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),

      resetSession: () => set({ 
        mesaId: "", 
        comensales: 2, 
        primerPedido: true, 
        cart: [],
        messages: [],
        chatPrefilledText: ""
      }),

      setChatOpen: (b) => set({ isChatOpen: b }),
      openChatWithProduct: (productName) => set({ isChatOpen: true, chatPrefilledText: productName }),
      clearChatPrefilledText: () => set({ chatPrefilledText: "" }),
    }),
    {
      name: "parolaccia-store",
      partialize: (s) => ({
        mesaId: s.mesaId,
        comensales: s.comensales,
        primerPedido: s.primerPedido,
        cart: s.cart,
        messages: s.messages,
      }),
    },
  ),
)

export const cartSelectors = {
  count: (s: Store) => s.cart.reduce((acc, i) => acc + i.qty, 0),
  total: (s: Store) => s.cart.reduce((acc, i) => acc + i.qty * i.price, 0),
  hasBebidas: (s: Store) => s.cart.some((i) => BEVERAGE_CATEGORIES.has(i.categoryId)),
  principalesCount: (s: Store) =>
    s.cart.filter((i) => MAIN_CATEGORIES.has(i.categoryId)).reduce((acc, i) => acc + i.qty, 0),
}
