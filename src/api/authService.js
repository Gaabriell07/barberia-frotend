import apiClient from './axiosClient'

export const login = async (credentials) => {
  const { data } = await apiClient.post('/api/Auth/login', credentials)
  return data
}

export const register = async (payload) => {
  const { data } = await apiClient.post('/api/Auth/register', payload)
  return data
}
