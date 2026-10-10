import { apiRequest } from './axiosInstance'

export const getMonthlyReport = (params) => apiRequest('get', '/reports/monthly', { params })
export const getCategorySummary = (params = {}) =>
  apiRequest('get', '/reports/category-summary', { params })
export const getTrend = (params = {}) => apiRequest('get', '/reports/trend', { params })
