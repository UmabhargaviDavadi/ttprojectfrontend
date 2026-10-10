import { apiRequest } from './axiosInstance'

export const getTransactions = (params = {}) => apiRequest('get', '/transactions', { params })
export const createTransaction = (data) => apiRequest('post', '/transactions', { data })
export const updateTransaction = (id, data) => apiRequest('put', `/transactions/${id}`, { data })
export const deleteTransaction = (id) => apiRequest('delete', `/transactions/${id}`)
