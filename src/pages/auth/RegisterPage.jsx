import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Scissors, ArrowRight, User, Mail, Phone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Spinner } from '@/components/ui/index'

const RegisterPage = () => {
  const { register } = useAuth()
  const { toast }    = useToast()
  const navigate     = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Campos requeridos', 'Nombre, correo y contraseña son obligatorios.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.')
      return
    }
    if (form.password.length < 6) {
      toast.error('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword: _, ...payload } = form
      await register(payload)
      toast.success('¡Cuenta creada!', 'Bienvenido a BarberShop.')
      navigate('/client/book')
    } catch (err) {
      toast.error('Error al registrarse', err.response?.data?.message || 'Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="h-4 w-4 text-black" />
          </div>
          <span className="font-display font-semibold">BarberShop</span>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription>Regístrate para comenzar a reservar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" name="name" placeholder="Juan Pérez" value={form.name}
                      onChange={handleChange} className="h-11 pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="tu@correo.com"
                      value={form.email} onChange={handleChange} className="h-11 pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" placeholder="+51 999 999 999"
                      value={form.phone} onChange={handleChange} className="h-11 pl-9" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres" value={form.password}
                      onChange={handleChange} className="h-11 pr-10" />
                    <button type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPass(p => !p)}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input id="confirmPassword" name="confirmPassword"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword} onChange={handleChange} className="h-11" />
                </div>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? <Spinner size="sm" /> : <>Crear cuenta <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
