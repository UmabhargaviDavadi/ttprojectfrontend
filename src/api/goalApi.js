import { apiRequest } from './axiosInstance'

export const getGoals = () => apiRequest('get', '/goals')
export const createGoal = (data) => apiRequest('post', '/goals', { data })
export const updateGoal = (id, data) => apiRequest('put', `/goals/${id}`, { data })
export const deleteGoal = (id) => apiRequest('delete', `/goals/${id}`)
