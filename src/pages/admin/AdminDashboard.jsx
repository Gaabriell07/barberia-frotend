import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getAllReservations } from '@/api/reservationService'
import { useToast } from '@/context/ToastContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Spinner } from '@/components/ui/index'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/utils/formatters'

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card className="animate-fade-in opacity-0-init">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-display font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const AdminDashboard = () => {
  const { toast } = useToast()
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllReservations()
        setReservations(res)
      } catch {
        toast.error('Error', 'No se pudo cargar el dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const todayRes       = reservations.filter(r => r.dateTime && r.dateTime.split('T')[0] === todayStr)

  const pendingCount   = reservations.filter(r => r.status === 'Pending').length

  const confirmedToday = todayRes.filter(r => r.status === 'Confirmed').length
  
  const totalRes       = reservations.length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Vista general del día y el negocio</p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Calendar}    label="Citas hoy"    value={todayRes.length}  sub="Programadas para hoy"    color="bg-primary/15 text-primary" />
        <StatCard icon={CheckCircle} label="Confirmadas"  value={confirmedToday}   sub="Listas para atender"     color="bg-green-500/15 text-green-500" />
        <StatCard icon={AlertCircle} label="Pendientes"   value={pendingCount}     sub="Requieren confirmación"  color="bg-yellow-500/15 text-yellow-500" />
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citas de hoy</CardTitle>
          <CardDescription>Reservas programadas para el día de hoy ({todayRes.length} de {totalRes} totales)</CardDescription>
        </CardHeader>
        <CardContent>
          {todayRes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Calendar className="h-8 w-8 opacity-40" />
              <p className="text-sm">No hay citas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayRes.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(r.userName || r.user?.name || '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.userName || r.user?.name || `Cliente #${r.userId}`}</p>
                    <p className="text-xs text-muted-foreground">{r.serviceName || r.service?.name || 'Servicio'} · {formatDateTime(r.dateTime)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard
