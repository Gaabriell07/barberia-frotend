import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date) =>
  format(parseISO(date), "d 'de' MMMM, yyyy", { locale: es })

export const formatTime = (date) =>
  format(parseISO(date), 'HH:mm', { locale: es })

export const formatDateTime = (date) =>
  format(parseISO(date), "d MMM yyyy - HH:mm", { locale: es })

export const formatDateLabel = (date) => {
  const d = parseISO(date)
  if (isToday(d)) return 'Hoy'
  if (isTomorrow(d)) return 'Mañana'
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export const isExpired = (date) => isPast(parseISO(date))

export const STATUS_CONFIG = {
  Pending:    { label: 'Pendiente',  color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30' },
  Confirmed:  { label: 'Confirmada', color: 'bg-green-500/15 text-green-600 border-green-500/30'  },
  Cancelled:  { label: 'Cancelada',  color: 'bg-red-500/15 text-red-500 border-red-500/30'        },
  Completed:  { label: 'Completada', color: 'bg-blue-500/15 text-blue-500 border-blue-500/30'     },
  NoShow:     { label: 'No Show',    color: 'bg-gray-500/15 text-gray-500 border-gray-500/30'     },
}
