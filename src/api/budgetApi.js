import { apiRequest } from './axiosInstance'

export const getBudgets = (params = {}) => apiRequest('get', '/budgets', { params })
export const createBudget = (data) => apiRequest('post', '/budgets', { data })
export const updateBudget = (id, data) => apiRequest('put', `/budgets/${id}`, { data })
export const deleteBudget = (id) => apiRequest('delete', `/budgets/${id}`)
