export function formatARS(value: number, locale = "es-AR") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value)
  } catch {
    return `ARS ${Math.round(value)}`
  }
}
