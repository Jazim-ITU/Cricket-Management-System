import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    const { token, role, username: uname, team_id, player_id } = res.data.data
    const userData = { username: uname, role, token, team_id, player_id }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)