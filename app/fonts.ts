import { Playfair_Display, Source_Sans_3 } from "next/font/google"

export const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
})

export const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
})
