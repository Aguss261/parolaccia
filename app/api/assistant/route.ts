import type { NextRequest } from "next/server"

type MenuItem = { sku: string; name: string; price: number }
type Category = { id: string; name: string; items: MenuItem[] }
type MenuJSON = { currency: string; categories: Category[] }

type ChatPayload = {
  message: string
  locale?: string
  mesaId: string
  comensales: number
  primerPedido: boolean
  cart: Array<{ sku: string; name: string; qty: number; price: number; notes?: string; category: string }>
  menu: MenuJSON
}

type AssistantResponse = {
  assistantMessage: string
  cartOps?: Array<
    | { type: "add"; sku: string; qty: number; notes?: string }
    | { type: "remove"; sku: string; qty?: number }
    | { type: "updateNotes"; sku: string; notes: string }
  >
  requireConfirmation?: boolean
}

function detectLang(locale?: string, text?: string): "es" | "en" {
  const lc = (locale || "").toLowerCase()
  if (lc.startsWith("es")) return "es"
  if (lc.startsWith("en")) return "en"
  const t = (text || "").toLowerCase()
  if (/\b(hola|por favor|gracias|quiero|una|dos|tres|buenas|limonada)\b/.test(t)) return "es"
  if (/\b(please|thanks|hi|hello|water|lemonade)\b/.test(t)) return "en"
  return "es"
}

function t(lang: "es" | "en", key: string, vars: Record<string, string> = {}) {
  const dict: Record<string, Record<string, string>> = {
    es: {
      notFound: "No lo tenemos.",
      added: "Agregué {qty} {name}. ¿Algo más?",
      removed: "Ok, quité {name}. ¿Algo más?",
      beverageQ: "¿Qué desean beber?",
      shareQ: "¿Van a compartir los principales?",
      confirmQ: "Este es el resumen: {summary}. Total {total}. ¿Confirmás?",
      confirmed: "Pedido listo para confirmar. ¿Enviamos?",
      askMore: "¿Algo más?",
    },
    en: {
      notFound: "We don't have that.",
      added: "Added {qty} {name}. Anything else?",
      removed: "Removed {name}. Anything else?",
      beverageQ: "What would you like to drink?",
      shareQ: "Will you share the mains?",
      confirmQ: "Here is the summary: {summary}. Total {total}. Confirm?",
      confirmed: "Order ready to confirm. Send?",
      askMore: "Anything else?",
    },
  }
  let s = dict[lang][key] || ""
  Object.entries(vars).forEach(([k, v]) => {
    s = s.replace(new RegExp(`{${k}}`, "g"), v)
  })
  return s
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function parseQty(text: string): number {
  const t = normalize(text)
  const digit = t.match(/(\d{1,2})/)
  if (digit) return Math.max(1, Number.parseInt(digit[1], 10))
  const map: Record<string, number> = {
    una: 1,
    uno: 1,
    un: 1,
    "1": 1,
    dos: 2,
    "2": 2,
    tres: 3,
    "3": 3,
    cuatro: 4,
    "4": 4,
  }
  for (const [w, n] of Object.entries(map)) {
    if (t.includes(w)) return n
  }
  return 1
}

function findItem(menu: MenuJSON, query: string) {
  const q = normalize(query)
  for (const cat of menu.categories) {
    for (const it of cat.items) {
      if (normalize(it.sku) === q || normalize(it.name).includes(q)) {
        return { item: it, category: cat.id }
      }
    }
  }
  return null
}

const BEVERAGE_CATEGORIES = new Set(["BEBIDAS", "CERVEZA", "APERITIVO", "CAFFETERIA"])
const MAIN_CATEGORIES = new Set(["CARNI", "RISOTTI", "PESCE", "POLLI", "LA-NOSTRA-PASTA", "PASTA-RIPIENA"])

function hasBeverages(cart: ChatPayload["cart"]) {
  return cart.some((i) => BEVERAGE_CATEGORIES.has(i.category))
}

function principalesCount(cart: ChatPayload["cart"]) {
  return cart.filter((i) => MAIN_CATEGORIES.has(i.category)).reduce((acc, i) => acc + i.qty, 0)
}

function formatTotalARS(total: number, lang: "es" | "en") {
  try {
    const locale = lang === "es" ? "es-AR" : "en-US"
    return new Intl.NumberFormat(locale, { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(total)
  } catch {
    return `ARS ${Math.round(total)}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatPayload
    const lang = detectLang(body.locale, body.message)
    const msg = body.message.trim()
    const menu = body.menu
    const lower = normalize(msg)

    if (/\bconfirm(ar|)\b/.test(lower) || /\bconfirm\b/.test(lower)) {
      const total = body.cart.reduce((acc, i) => acc + i.qty * i.price, 0)
      const summary = body.cart.map((i) => `${i.qty} x ${i.name}`).join(", ")
      return Response.json({
        assistantMessage: t(lang, "confirmQ", { summary, total: formatTotalARS(total, lang) }),
        requireConfirmation: true,
      } as AssistantResponse)
    }

    // Reconocimiento de ítem (sin inventar)
    let matched = findItem(menu, msg)
    if (!matched) {
      const tokens = msg
        .split(/,|\.|\s+/)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
        .slice(0, 6)
      for (const tok of tokens) {
        matched = findItem(menu, tok)
        if (matched) break
      }
    }

    if (!matched) {
      return Response.json({ assistantMessage: t(lang, "notFound") } as AssistantResponse)
    }

    const qty = parseQty(msg)
    const ops: AssistantResponse["cartOps"] = []

    if (/\b(sacar|quitar|remove|sin\b.*\b)\b/.test(lower) && !/\bnota|note\b/.test(lower)) {
      ops.push({ type: "remove", sku: matched.item.sku })
      const text = t(lang, "removed", { name: matched.item.name, qty: String(qty) })
      return Response.json({ assistantMessage: text, cartOps: ops } as AssistantResponse)
    }

    const noteMatch = msg.match(/(?:nota|notas|note|notes)[:-]?\s*(.+)$/i) || msg.match(/\bsin\s+(.+)$/i)
    if (noteMatch) {
      ops.push({ type: "updateNotes", sku: matched.item.sku, notes: noteMatch[1].trim() })
    }

    ops.push({ type: "add", sku: matched.item.sku, qty })
    let response = t(lang, "added", { qty: String(qty), name: matched.item.name })

    if (body.primerPedido && !hasBeverages(body.cart)) {
      response = `${response} ${t(lang, "beverageQ")}`
    } else if (principalesCount(body.cart) < body.comensales) {
      response = `${response} ${t(lang, "shareQ")}`
    }

    return Response.json({ assistantMessage: response, cartOps: ops } as AssistantResponse)
  } catch {
    return new Response("Bad Request", { status: 400 })
  }
}
