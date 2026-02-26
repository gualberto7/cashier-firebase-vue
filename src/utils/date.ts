import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export const APP_TIMEZONE = 'America/La_Paz'

export function formatDate(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "d 'de' MMM, yyyy · HH:mm", { locale: es })
}

export function formatDateOnly(date: Date): string {
  return formatInTimeZone(date, APP_TIMEZONE, "d 'de' MMM, yyyy", { locale: es })
}
