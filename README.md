# BarberShop — Frontend

Frontend de sistema de reservas para barbería, construido con **React + Vite + Tailwind CSS + Shadcn UI**.

## 🚀 Stack

- **React 18** con Vite
- **Tailwind CSS** (tema dorado personalizado, dark/light mode)
- **React Router v6** (rutas protegidas por rol)
- **Axios** (cliente HTTP con interceptor JWT)
- **Lucide React** (íconos)
- **date-fns** (manejo de fechas en español)

## 📁 Estructura

```
src/
├── api/               # Servicios HTTP (Axios)
│   ├── axiosClient.js     # Instancia base + interceptor JWT
│   ├── authService.js     # Login / Register
│   ├── reservationService.js
│   └── index.js           # Users, Availability, Notifications
├── context/           # React Context
│   ├── AuthContext.jsx    # Sesión, usuario, rol
│   └── ToastContext.jsx   # Notificaciones globales
├── hooks/             # Custom hooks
│   └── useAsync.js
├── components/
│   ├── ui/            # Componentes base (Button, Card, Input, Badge…)
│   └── layout/        # AppLayout, ProtectedRoute
├── pages/
│   ├── auth/          # Login, Register
│   ├── admin/         # Dashboard, Reservas, Usuarios
│   └── client/        # Reservar cita, Mis reservas
└── utils/             # cn(), formatters
```

## ⚙️ Configuración

1. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con la URL de tu backend:
   ```
   VITE_API_URL=http://localhost:5000
   ```

## 🔐 Autenticación y Roles

El `AuthContext` persiste el token JWT en `localStorage`. El interceptor de Axios lo inyecta automáticamente en cada petición.

- Ruta `/admin/*` → requiere rol `Admin`
- Ruta `/client/*` → cualquier usuario autenticado
- El redirect post-login depende del rol del usuario en la respuesta del backend

**Adaptar según tu API:** En `AuthContext.jsx`, el objeto `user` se construye así:
```js
const { token: jwt, ...userData } = data   // data = respuesta de /api/Auth/login
```
Asegúrate de que tu backend devuelva `{ token, name, email, role, id, ... }` o ajusta el destructuring.

## 🎨 Personalización de la interfaz

La imagen de fondo de la pantalla de inicio de sesión (`LoginPage.jsx`) ha sido configurada localmente en la ruta `src/assets/piero.png`. Puedes cambiar esta imagen reemplazando el archivo en la misma ruta o modificando el import en el código.
