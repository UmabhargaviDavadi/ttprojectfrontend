import { apiRequest } from './axiosInstance'

export const getNotifications = () => apiRequest('get', '/notifications')
export const markNotificationRead = (id) => apiRequest('put', `/notifications/${id}/read`)
