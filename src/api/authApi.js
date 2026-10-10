import { apiRequest } from './axiosInstance'

export const login = (credentials) => apiRequest('post', '/auth/login', { data: credentials })
export const register = ({ name, email, password }) =>
  apiRequest('post', '/auth/register', { data: { name, email, password } })
