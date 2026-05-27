import { useEffect, useState } from 'react'
import { Calendar, Clock, Scissors, ChevronRight, Check } from 'lucide-react'
import { getAvailableSlots, getAllUsers } from '@/api/index'
import { createReservation } from '@/api/reservationService'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Spinner, Separator } from '@/components/ui/index'
import { cn } from '@/utils/cn'
import { format, addDays, startOfDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const MOCK_SERVICES = [
  { id: 1, name: 'Corte Clásico',      duration: 30, price: 25,  icon: '✂️' },
  { id: 2, name: 'Corte + Barba',      duration: 50, price: 45,  icon: '🧔' },
  { id: 3, name: 'Arreglo de Barba',   duration: 20, price: 20,  icon: '🪒' },
  { id: 4, name: 'Corte Premium',      duration: 60, price: 60,  icon: '👑' },
]

const DAYS_AHEAD = 7

const BookingPage = () => {
  const { user }  = useAuth()
  const { toast } = useToast()

  const [step,            setStep]           = useState(1) 
  const [selectedService, setSelectedService] = useState(null)
  const [barbers,         setBarbers]         = useState([])
  const [selectedBarber,  setSelectedBarber]  = useState(null)
  const [selectedDate,    setSelectedDate]    = useState(null)
  const [slots,           setSlots]           = useState([])
  const [selectedSlot,    setSelectedSlot]    = useState(null)
  const [loadingSlots,    setLoadingSlots]    = useState(false)
  const [booking,         setBooking]         = useState(false)
  const [done,            setDone]            = useState(false)

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const users = await getAllUsers();
        setBarbers(users.filter(u => u.role === 'Admin' || u.role === 'Barber'));
      } catch (err) {
        toast.error('Error', 'No se pudieron cargar los barberos.');
      }
    };
    fetchBarbers();
  }, []);

  const now = new Date()
  const isAfterWorkHours = now.getHours() >= 18
  const minDate = isAfterWorkHours ? addDays(startOfDay(now), 1) : startOfDay(now)
  const today = format(minDate, 'yyyy-MM-dd')

  const loadSlots = async (date, serviceId, barberId) => {
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)
    try {
      const data = await getAvailableSlots({ date: format(date, 'yyyy-MM-dd'), serviceId, barberId })
      const raw = Array.isArray(data) ? data : data?.availableSlots || data?.slots || []
      
      const nowTime = new Date()
      const filtered = raw.filter(slot => {
        const slotTime = slot.startTime ? new Date(slot.startTime) : null
        if (!slotTime) return true
        return slotTime > nowTime
      })
      setSlots(filtered)
    } catch {
      toast.error('Error', 'No se pudieron cargar los horarios disponibles.')
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (selectedDate && selectedService && selectedBarber) {
      loadSlots(selectedDate, selectedService.id, selectedBarber.id)
    }
  }, [selectedDate, selectedService, selectedBarber])

  useEffect(() => {
    if (step === 3 && !selectedDate) {
      setSelectedDate(new Date(`${today}T12:00:00`))
    }
  }, [step])

  const handleConfirm = async () => {
    if (!selectedService || !selectedBarber || !selectedSlot || !user) return
    setBooking(true)

    const payload = {
      userId:    user.id,
      serviceId: selectedService.id,
      barberId:  selectedBarber.id,
      dateTime:  selectedSlot.startTime || selectedSlot.dateTime || selectedSlot,
      notes:     '',
    }
    // 🔍 Debug — ver en consola exactamente qué se envía al backend
    console.log('📋 Payload enviado a /api/Reservations:', payload)

    try {
      await createReservation(payload)
      setDone(true)
      toast.success('¡Reserva confirmada!', `Cita el ${format(selectedDate, "d 'de' MMMM", { locale: es })}`)
    } catch (err) {
      // Mostrar el mensaje exacto que devuelve el backend
      const backendMsg = err.response?.data?.message || err.response?.data?.errors || JSON.stringify(err.response?.data)
      console.error('❌ Error del backend:', err.response?.data)
      toast.error('Error al reservar', backendMsg || 'No se pudo crear la reserva.')
    } finally {
      setBooking(false)
    }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-green-500/15 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-500" />
      </div>
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold">¡Reserva confirmada!</h2>
        <p className="text-muted-foreground mt-2">Tu cita ha sido agendada exitosamente.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setDone(false); setStep(1); setSelectedService(null); setSelectedBarber(null); setSelectedDate(null); setSelectedSlot(null) }}>
          Nueva reserva
        </Button>
        <Button variant="gold" onClick={() => window.location.href = '/client/reservations'}>
          Ver mis reservas
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Reservar cita</h1>
        <p className="text-muted-foreground mt-1">Elige un servicio y escoge el horario que más te convenga</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {[
          { n: 1, label: 'Servicio' },
          { n: 2, label: 'Barbero' },
          { n: 3, label: 'Horario' },
          { n: 4, label: 'Confirmar' },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => step > n && setStep(n)}
              className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                step >= n ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground',
                step > n && 'cursor-pointer hover:opacity-80',
              )}
            >
              {step > n ? <Check className="h-3 w-3" /> : n}
            </button>
            <span className={cn('text-xs font-medium', step >= n ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
            {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
          {MOCK_SERVICES.map((service) => (
            <button
              key={service.id}
              onClick={() => { setSelectedService(service); setStep(2) }}
              className={cn(
                'p-5 rounded-xl border-2 text-left transition-all hover:shadow-md active:scale-[0.99]',
                selectedService?.id === service.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-display font-semibold text-base">{service.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />{service.duration} min
                </span>
                <span className="text-xs font-semibold text-primary">S/ {service.price}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in">
          {barbers.length === 0 ? (
            <p className="col-span-full text-muted-foreground text-center py-6">Cargando barberos...</p>
          ) : barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => { setSelectedBarber(barber); setStep(3) }}
              className={cn(
                'p-5 rounded-xl border-2 text-center transition-all hover:shadow-md active:scale-[0.99]',
                selectedBarber?.id === barber.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center text-2xl mb-3">
                👨‍🦱
              </div>
              <h3 className="font-display font-semibold text-base">{barber.name}</h3>
            </button>
          ))}
          <div className="col-span-full flex justify-start mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />Elige una fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                min={today}
                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(`${e.target.value}T12:00:00`))
                  } else {
                    setSelectedDate(null)
                  }
                }}
                className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none transition-all text-foreground bg-background font-medium text-base"
                style={{ colorScheme: 'dark' }}
              />
            </CardContent>
          </Card>

          {}
          {selectedDate && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />Horarios disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
              {loadingSlots ? (
                  <div className="flex justify-center py-6"><Spinner /></div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">No hay horarios disponibles para este día.</p>
                    <p className="text-xs text-muted-foreground">Prueba seleccionando otro día en el calendario.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot, i) => {
                      
                      const slotDt = slot.startTime ? new Date(slot.startTime) : null
                      const time = slotDt
                        ? slotDt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : slot.time || (typeof slot === 'string' ? slot : '??:??')
                      const available = slot.isAvailable !== false
                      return (
                        <button
                          key={i}
                          onClick={() => available && setSelectedSlot(slot)}
                          disabled={!available}
                          className={cn(
                            'py-2 px-1 rounded-lg text-sm font-medium border-2 transition-all',
                            !available && 'opacity-40 cursor-not-allowed line-through border-border',
                            available && selectedSlot === slot && 'border-primary bg-primary text-primary-foreground',
                            available && selectedSlot !== slot && 'border-border hover:border-primary/50',
                          )}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>Volver</Button>
            <Button variant="gold" disabled={!selectedSlot} onClick={() => setStep(4)}>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {}
      {step === 4 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Confirmar reserva</CardTitle>
            <CardDescription>Revisa los detalles antes de confirmar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servicio</span>
                <span className="font-semibold">{selectedService?.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Barbero</span>
                <span className="font-semibold">{selectedBarber?.name}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-semibold">{selectedDate && format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hora</span>
                <span className="font-semibold">
                  {selectedSlot?.startTime
                    ? new Date(selectedSlot.startTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : selectedSlot?.time || selectedSlot
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duración</span>
                <span className="font-semibold">{selectedService?.duration} min</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-display font-bold text-primary">S/ {selectedService?.price}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>Volver</Button>
              <Button variant="gold" size="lg" onClick={handleConfirm} disabled={booking}>
                {booking ? <Spinner size="sm" /> : <>Confirmar reserva <Check className="h-4 w-4" /></>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BookingPage
