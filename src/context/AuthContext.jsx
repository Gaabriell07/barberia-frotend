import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { login as loginApi, register as registerApi } from '../api/authService'

const AuthContext = createContext(null)

const getUserIdFromToken = (jwt) => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    
    const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    return id ? parseInt(id, 10) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser  = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      const parsed = JSON.parse(storedUser)
      
      const idFromToken = getUserIdFromToken(storedToken)
      setUser({ ...parsed, id: idFromToken ?? parsed.id })
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials)
    const jwt = data.token || data.Token
    if (!jwt) throw new Error('No se recibió token del servidor')
    
    const userData = {
      id:    getUserIdFromToken(jwt) ?? data.id ?? data.Id,
      name:  data.name  || data.Name,
      email: data.email || data.Email,
      role:  data.role  || data.Role,
    }
    localStorage.setItem('token', jwt)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerApi(payload)
    const jwt = data.token || data.Token
    if (!jwt) throw new Error('No se recibió token del servidor')
    const userData = {
      id:    getUserIdFromToken(jwt) ?? data.id ?? data.Id,
      name:  data.name  || data.Name,
      email: data.email || data.Email,
      role:  data.role  || data.Role,
    }
    localStorage.setItem('token', jwt)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin')

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
