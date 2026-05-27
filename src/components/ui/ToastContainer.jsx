import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/utils/cn'

const icons = {
  success:     <CheckCircle2 className="h-4 w-4 text-green-500" />,
  destructive: <AlertCircle  className="h-4 w-4 text-red-500"   />,
  default:     <Info         className="h-4 w-4 text-blue-500"  />,
}

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg animate-fade-in',
            t.variant === 'destructive' && 'border-red-500/30',
            t.variant === 'success'     && 'border-green-500/30',
          )}
        >
          <span className="mt-0.5 shrink-0">{icons[t.variant] || icons.default}</span>
          <div className="flex-1 min-w-0">
            {t.title       && <p className="text-sm font-medium">{t.title}</p>}
            {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
          <button onClick={() => removeToast(t.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
