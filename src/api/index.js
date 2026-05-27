import apiClient from './axiosClient'

export const getAllUsers = async () => {
  const { data } = await apiClient.get('/api/Users')
  return data
}

export const getUserById = async (id) => {
  const { data } = await apiClient.get(`/api/Users/${id}`)
  return data
}

export const createUser = async (payload) => {
  const { data } = await apiClient.post('/api/Users', payload)
  return data
}

export const updateUser = async (id, payload) => {
  const { data } = await apiClient.put(`/api/Users/${id}`, payload)
  return data
}

export const deleteUser = async (id) => {
  const { data } = await apiClient.delete(`/api/Users/${id}`)
  return data
}

export const getAvailableSlots = async (params = {}) => {
  const { data } = await apiClient.get('/api/Availability/slots', { params })
  return data
}

export const checkAvailability = async (params) => {
  const { data } = await apiClient.get('/api/Availability/check', { params })
  return data
}

export const sendNotification = async (payload) => {
  const { data } = await apiClient.post('/api/Notifications/send', payload)
  return data
}
