import { apiRequest } from './axiosInstance'

export const getProfile = () => apiRequest('get', '/users/profile')
export const updateProfile = (data) => apiRequest('put', '/users/profile', { data })
