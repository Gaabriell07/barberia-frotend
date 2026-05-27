import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Scissors, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Spinner } from '@/components/ui/index'

const LoginPage = () => {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate   = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Campos requeridos', 'Por favor, completa todos los campos.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form)
      toast.success('¡Bienvenido!', `Hola ${user?.name || ''}`)
      navigate(user?.role === 'Admin' || user?.roles?.includes('Admin') ? '/admin/dashboard' : '/client/book')
    } catch (err) {
      toast.error('Error al iniciar sesión', err.response?.data?.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d0a06]">
        <div className="absolute inset-0 bg-[url('/barbershop-bg.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-primary/20" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Scissors className="h-5 w-5 text-black" />
            </div>
            <span className="font-display text-white text-xl font-semibold">BarberShop</span>
          </div>
          <h1 className="font-display text-4xl text-white leading-tight mb-3">
            El arte del<br /><span className="gold-shimmer">corte perfecto.</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xs">
            Reserva tu cita en segundos. Tu tiempo y estilo, siempre en tus manos.
          </p>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-black" />
            </div>
            <span className="font-display font-semibold">BarberShop</span>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email" name="email" type="email"
                    placeholder="tu@correo.com"
                    value={form.email} onChange={handleChange}
                    autoComplete="email"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password" name="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password} onChange={handleChange}
                      autoComplete="current-password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPass(p => !p)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : <>Ingresar <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-5">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
