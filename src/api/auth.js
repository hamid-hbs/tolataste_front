import { api, setToken } from './client'

export const TOKEN_KEY = 'tt_token'
export const USER_KEY = 'tt_user'

export const authService = {
  async login(email, password) {
    return api.post('/auth/login', { email, password }, { auth: false })
  },

  async register(data) {
    return api.post('/auth/register', data, { auth: false })
  },

  async me() {
    return api.get('/auth/me')
  },

  async logout() {
    await api.post('/auth/logout')
  },

  saveSession(token, user) {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearSession() {
    setToken(null)
    localStorage.removeItem(USER_KEY)
  },

  loadUser() {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  hasRole(currentRole, requiredRole) {
    if (requiredRole === 'admin') return currentRole === 'admin'
    if (requiredRole === 'manager') return ['admin', 'manager'].includes(currentRole)
    if (requiredRole === 'serveur') return ['admin', 'manager', 'serveur'].includes(currentRole)
    if (requiredRole === 'cuisine') return ['admin', 'manager', 'cuisine'].includes(currentRole)
    return currentRole === requiredRole
  },
}
