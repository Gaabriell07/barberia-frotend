import { useState, useCallback } from 'react'

export const useAsync = () => {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const execute = useCallback(async (asyncFn) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Ocurrió un error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, execute }
}

export const useDataFetch = (fetchFn, deps = []) => {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  
  }, deps)

  return { data, loading, error, fetch, setData }
}
