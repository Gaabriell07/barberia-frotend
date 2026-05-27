import { useEffect, useState } from 'react'
import { Calendar, Clock, RefreshCw, Plus, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getReservationsByUser, deleteReservation } from '@/api/reservationService'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, Spinner, Separator } from '@/components/ui/index'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const MyReservationsPage = () => {
  const { user }  = useAuth()
  const { toast } = useToast()

  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState('upcoming') 

  const load = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await getReservationsByUser(user.id)
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Error', 'No se pudieron cargar tus reservas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id])

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    try {
      await deleteReservation(id)
      setReservations(prev => prev.filter(r => r.id !== id))
      toast.success('Reserva cancelada')
    } catch {
      toast.error('Error', 'No se pudo cancelar la reserva.')
    }
  }

  const now     = new Date()
  const upcoming = reservations.filter(r => new Date(r.dateTime) >= now && r.status !== 'Cancelled')
  const past     = reservations.filter(r => new Date(r.dateTime) < now || r.status === 'Cancelled')
  const list     = tab === 'upcoming' ? upcoming : past

  const canCancel = (r) => r.status === 'Pending' || r.status === 'Confirmed'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Mis reservas</h1>
          <p className="text-muted-foreground mt-1">Historial y próximas citas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link to="/client/book"><Plus className="h-4 w-4" />Nueva cita</Link>
          </Button>
        </div>
      </div>

      {}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {[
          { id: 'upcoming', label: `Próximas (${upcoming.length})` },
          { id: 'past',     label: `Historial (${past.length})`    },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              tab === t.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium">No tienes {tab === 'upcoming' ? 'citas próximas' : 'historial'}</p>
            {tab === 'upcoming' && (
              <p className="text-sm text-muted-foreground mt-1">¡Agenda tu primera cita ahora!</p>
            )}
          </div>
          {tab === 'upcoming' && (
            <Button variant="gold" size="sm" asChild>
              <Link to="/client/book">Reservar cita</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r, i) => (
            <Card key={r.id} className="animate-fade-in opacity-0-init hover:shadow-md transition-shadow" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-display font-semibold">{r.service?.name || 'Servicio'}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(r.dateTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(r.dateTime)}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{r.notes}"</p>
                    )}
                  </div>
                  {canCancel(r) && (
                    <Button
                      variant="ghost" size="sm"
                      className="shrink-0 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(r.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReservationsPage
