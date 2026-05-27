import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, Scissors,
  Bell, LogOut, Menu, X, ChevronRight, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const adminNav = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/reservations', icon: Calendar,         label: 'Reservas'     },
  { to: '/admin/barbers',      icon: Scissors,         label: 'Barberos'     },
  { to: '/admin/users',        icon: Users,            label: 'Usuarios'     },
]

const clientNav = [
  { to: '/client/book',         icon: Scissors,  label: 'Reservar'         },
  { to: '/client/reservations', icon: Calendar,  label: 'Mis Reservas'     },
]

const AppLayout = ({ darkMode, toggleDark }) => {
  const { user, isAdmin, logout } = useAuth()
  const navigate    = useNavigate()
  const [open, setOpen] = useState(false)
  const nav = isAdmin ? adminNav : clientNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <Scissors className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display font-semibold text-sm leading-tight">BarberShop</p>
          <p className="text-xs text-muted-foreground">Sistema de Reservas</p>
        </div>
      </div>

      {}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          {isAdmin ? 'Administración' : 'Mi cuenta'}
        </p>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        <SidebarContent />
      </aside>

      {}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border z-50 animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        {}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggleDark}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
