"use client"

import { cn } from "@/lib/utils"

export type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export function MessageBubble({ role = "assistant", content = "" }: Partial<Message>) {
  const isUser = role === "user"
  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      role="article"
      aria-label={isUser ? "Mensaje del usuario" : "Mensaje del asistente"}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow",
          isUser
            ? "bg-gradient-to-r from-[#7a1c1c] via-[#a6342f] to-[#d4af37] text-white"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800/80 dark:text-neutral-100",
        )}
      >
        <p>{content}</p>
      </div>
    </div>
  )
}
