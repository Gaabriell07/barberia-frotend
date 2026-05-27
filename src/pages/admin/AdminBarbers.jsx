import { useEffect, useState } from 'react'
import { Scissors, Plus, Trash2, RefreshCw, Mail, Phone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllUsers, createUser, deleteUser } from '@/api/index'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Spinner, Label } from '@/components/ui/index'

const PAGE_SIZE = 7

const CreateBarberModal = ({ onClose, onCreated }) => {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Campos requeridos', 'Nombre, email y contraseña son obligatorios.')
      return
    }
    setLoading(true)
    try {
      await createUser({ ...form, role: 'Admin' })
      toast.success('Barbero creado', `${form.name} ya puede atender citas.`)
      onCreated()
      onClose()
    } catch (err) {
      toast.error('Error', err.response?.data || 'No se pudo crear el barbero.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Nuevo Barbero</CardTitle>
              <CardDescription>Podrá recibir citas en el sistema</CardDescription>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-1">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bname">Nombre completo</Label>
              <Input id="bname" name="name" placeholder="Ej: Carlos García" value={form.name} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bemail">Correo electrónico</Label>
              <Input id="bemail" name="email" type="email" placeholder="barbero@correo.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bpassword">Contraseña</Label>
              <Input id="bpassword" name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bphone">Teléfono <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input id="bphone" name="phone" placeholder="999888777" value={form.phone} onChange={handleChange} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="gold" className="flex-1" disabled={loading}>
                {loading ? 'Creando...' : 'Crear barbero'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const Pagination = ({ page, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`h-8 w-8 rounded-lg border text-sm font-medium transition-all ${
            p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === Math.ceil(total / pageSize)}
        className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

const AdminBarbers = () => {
  const { toast }    = useToast()
  const [barbers,    setBarbers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(1)
  const [showModal,  setShowModal]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const all = await getAllUsers()
      
      setBarbers(all.filter(u => u.role === 'Admin'))
    } catch {
      toast.error('Error', 'No se pudieron cargar los barberos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este barbero?')) return
    try {
      await deleteUser(id)
      setBarbers(prev => prev.filter(b => b.id !== id))
      toast.success('Barbero eliminado')
    } catch {
      toast.error('Error', 'No se pudo eliminar el barbero.')
    }
  }

  const paginated = barbers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      {showModal && <CreateBarberModal onClose={() => setShowModal(false)} onCreated={load} />}

      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Barberos</h1>
            <p className="text-muted-foreground mt-1">
              {barbers.length} barbero{barbers.length !== 1 ? 's' : ''} registrado{barbers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="gold" size="sm" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Nuevo barbero
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {barbers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Scissors className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-sm">No hay barberos registrados todavía</p>
                <Button variant="gold" size="sm" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-1.5" /> Agregar primer barbero
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((b, i) => (
                    <Card key={b.id} className="animate-fade-in opacity-0-init hover:shadow-md transition-shadow" style={{ animationDelay: `${i * 50}ms` }}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <span className="font-display text-2xl font-bold text-primary">
                              {b.name?.[0]?.toUpperCase() || 'B'}
                            </span>
                          </div>
                          <Badge className="text-xs bg-primary/15 text-primary border-primary/30">
                            ✂️ Barbero
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-1">{b.name}</h3>
                        <div className="space-y-1 mb-4">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail className="h-3 w-3 shrink-0" />{b.email}
                          </p>
                          {b.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0" />{b.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleDelete(b.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Pagination page={page} total={barbers.length} pageSize={PAGE_SIZE} onChange={setPage} />
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default AdminBarbers
