import { createContext, useEffect, useState } from 'react'
import { login as loginApi, register as registerApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('finance_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('finance_user') || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem('finance_token', token)
    else localStorage.removeItem('finance_token')
  }, [token])

  useEffect(() => {
    const clearSession = () => {
      setToken(null)
      setUser(null)
      localStorage.removeItem('finance_user')
    }
    window.addEventListener('finance:unauthorized', clearSession)
    return () => window.removeEventListener('finance:unauthorized', clearSession)
  }, [])

  const acceptSession = (result) => {
    setToken(result.token)
    setUser(result.user)
    localStorage.setItem('finance_user', JSON.stringify(result.user))
    return result
  }
  const login = async (credentials) => acceptSession(await loginApi(credentials))
  const register = async (details) => acceptSession(await registerApi(details))
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('finance_token')
    localStorage.removeItem('finance_user')
  }
  const updateUser = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem('finance_user', JSON.stringify(nextUser))
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
