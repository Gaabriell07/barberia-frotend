import apiClient from './axiosClient'

export const getAllReservations = async () => {
  const { data } = await apiClient.get('/api/Reservations')
  return data
}

export const getReservationById = async (id) => {
  const { data } = await apiClient.get(`/api/Reservations/${id}`)
  return data
}

export const getReservationsByUser = async (userId) => {
  const { data } = await apiClient.get(`/api/Reservations/user/${userId}`)
  return data
}

export const createReservation = async (payload) => {
  const { data } = await apiClient.post('/api/Reservations', payload)
  return data
}

export const updateReservation = async (id, payload) => {
  const { data } = await apiClient.put(`/api/Reservations/${id}`, payload)
  return data
}

export const deleteReservation = async (id) => {
  const { data } = await apiClient.delete(`/api/Reservations/${id}`)
  return data
}
