// Configuración de moneda para Bolivia
export const CURRENCY_CONFIG = {
  code: 'BOB',
  symbol: 'Bs',
  locale: 'es-BO'
}

export function formatCurrency(amount: number): string {
  // Formatear con el locale boliviano y luego reemplazar el símbolo
  const formatted = new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${CURRENCY_CONFIG.symbol} ${formatted}`
}
