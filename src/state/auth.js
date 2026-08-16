import { reactive } from 'vue'
import { authService } from '@/api/auth'
import { usersService } from '@/api/users'
import { resetAllStates } from './reset'

export const ROLE_LABELS = {
  client: 'Client',
  serveur: 'Serveur',
  cuisine: 'Cuisine',
  manager: 'Manager',
  admin: 'Administrateur',
}

const DEMO_CREDENTIALS = {
  serveur: { email: 'sophie@tolataste.com', password: 'serveur123' },
  cuisine: { email: 'cuisine@tolataste.com', password: 'cuisine123' },
  manager: { email: 'manager@tolataste.com', password: 'manager123' },
  admin: { email: 'admin@tolataste.com', password: 'admin123' },
}

const state = reactive({
  user: authService.loadUser(),
  users: [],
})

export const authState = {
  get user() {
    return state.user
  },

  get userRole() {
    return state.user?.role ?? null
  },

  get isLoggedIn() {
    return !!state.user
  },

  get users() {
    return state.users
  },

  get roleLabels() {
    return ROLE_LABELS
  },

  hasRole(requiredRole) {
    return authService.hasRole(state.user?.role, requiredRole)
  },

  async login(email, password) {
    try {
      const res = await authService.login(email, password)
      const token = res?.token
      const user = res?.user
      if (!token || !user) return false
      authService.saveSession(token, user)
      state.user = user
      resetAllStates()
      return true
    } catch {
      return false
    }
  },

  async quickLogin(role) {
    const creds = DEMO_CREDENTIALS[role]
    if (!creds) return false
    return authState.login(creds.email, creds.password)
  },

  async register(data) {
    try {
      await authService.register(data)
      return authState.login(data.email, data.password)
    } catch {
      return false
    }
  },

  async logout() {
    try {
      await authService.logout()
    } catch {
      // la session est supprimée localement de toute façon
    }
    authService.clearSession()
    state.user = null
    state.users = []
    resetAllStates()
  },

  async fetchUsers() {
    try {
      state.users = await usersService.getAll()
    } catch {
      state.users = []
    }
  },

async addUser(data) {
      const user = await usersService.create(data)
      state.users.push(user)
      return user
    },

  async updateUser(id, data) {
      const user = await usersService.update(id, data)
      state.users = state.users.map((u) => (u.id === user.id ? user : u))
      return user
    },

  async removeUser(id) {
    await usersService.delete(id)
    state.users = state.users.filter((u) => u.id !== id)
  },
}