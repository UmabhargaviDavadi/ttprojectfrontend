import { apiRequest } from './axiosInstance'

export const getSavingsSuggestions = () => apiRequest('get', '/suggestions/savings')
export const getInvestmentSuggestions = () => apiRequest('get', '/suggestions/investments')
