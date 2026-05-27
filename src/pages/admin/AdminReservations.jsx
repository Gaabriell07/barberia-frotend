import { useEffect, useState } from 'react'
import { Search, RefreshCw, ChevronDown } from 'lucide-react'
import { getAllReservations, updateReservation, deleteReservation } from '@/api/reservationService'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui/index'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime, STATUS_CONFIG } from '@/utils/formatters'

const STATUSES = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }))

const AdminReservations = () => {
  const { toast } = useToast()
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating,     setUpdating]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllReservations()
      setReservations(data)
    } catch {
      toast.error('Error', 'No se pudieron cargar las reservas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (reservation, newStatus) => {
    setUpdating(reservation.id)
    try {
      
      await updateReservation(reservation.id, {
        id:        reservation.id,
        userId:    reservation.userId,
        serviceId: reservation.serviceId,
        dateTime:  reservation.dateTime,
        notes:     reservation.notes,
        status:    newStatus,
      })
      setReservations(prev => prev.map(r => r.id === reservation.id ? { ...r, status: newStatus } : r))
      toast.success('Estado actualizado', `Reserva marcada como ${STATUS_CONFIG[newStatus]?.label}.`)
    } catch (err) {
      console.error('Error actualizando estado:', err.response?.data)
      toast.error('Error', 'No se pudo actualizar el estado.')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return
    try {
      await deleteReservation(id)
      setReservations(prev => prev.filter(r => r.id !== id))
      toast.success('Reserva cancelada', 'La reserva fue eliminada.')
    } catch {
      toast.error('Error', 'No se pudo cancelar la reserva.')
    }
  }

  const filtered = reservations.filter(r => {
    const matchSearch = search === '' ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.service?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Gestiona todas las citas del negocio</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cliente o servicio..." className="pl-9"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <p className="text-sm">No se encontraron reservas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Cliente</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Servicio</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Fecha y hora</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{(r.userName || r.user?.name || '?')[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium">{r.userName || r.user?.name || `#${r.userId}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{r.serviceName || r.service?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm">{formatDateTime(r.dateTime)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            className="h-7 text-xs rounded border border-input bg-background px-2 cursor-pointer"
                            value={r.status}
                            onChange={e => handleStatusChange(r, e.target.value)}
                            disabled={updating === r.id}
                          >
                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          <Button variant="destructive" size="sm" className="h-7 px-2 text-xs"
                            onClick={() => handleDelete(r.id)}>
                            Cancelar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminReservations
