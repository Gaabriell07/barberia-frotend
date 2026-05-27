import { cn } from '@/utils/cn'
import { STATUS_CONFIG } from '@/utils/formatters'

const StatusBadge = ({ status, className }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-500/15 text-gray-500 border-gray-500/30' }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.color, className)}>
      {config.label}
    </span>
  )
}

export default StatusBadge
