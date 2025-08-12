import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { display, body } from "@/app/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-body: ${body.style.fontFamily};
  --font-display: ${display.style.fontFamily};
}
        `}</style>
      </head>
      <body className={`min-h-screen ${body.variable} ${display.variable} font-[family-name:var(--font-body)]`}>
        {children}
      </body>
    </html>
  )
}
