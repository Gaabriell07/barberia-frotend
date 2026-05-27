import { useEffect, useState } from 'react'
import { Search, Trash2, RefreshCw, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllUsers, deleteUser } from '@/api/index'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, Badge, Spinner } from '@/components/ui/index'

const PAGE_SIZE = 7

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

const AdminUsers = () => {
  const { toast }  = useToast()
  const [users,    setUsers]   = useState([])
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState('')
  const [page,     setPage]    = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const all = await getAllUsers()
      // Solo clientes — los barberos/admins tienen su propia sección
      setUsers(all.filter(u => u.role === 'Client'))
    }
    catch { toast.error('Error', 'No se pudieron cargar los usuarios.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSearch = (val) => { setSearch(val); setPage(1) }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('Cliente eliminado')
    } catch { toast.error('Error', 'No se pudo eliminar el cliente.') }
  }

  const filtered  = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar cliente..."
          className="pl-9"
          value={search}
          onChange={e => handleSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((u, i) => (
              <Card key={u.id} className="animate-fade-in opacity-0-init hover:shadow-md transition-shadow" style={{ animationDelay: `${i * 50}ms` }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                      <span className="font-display text-xl font-bold text-blue-500">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">👤 Cliente</Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-1">{u.name}</h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" />{u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />{u.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDelete(u.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {paginated.length === 0 && (
              <div className="col-span-full flex justify-center py-16 text-muted-foreground text-sm">
                No se encontraron clientes
              </div>
            )}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  )
}

export default AdminUsers
