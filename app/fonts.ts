import { Playfair_Display, Source_Sans_3 } from "next/font/google"

export const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
})

export const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body", 
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
})
