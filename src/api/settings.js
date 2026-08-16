import { api } from './client'

export const settingsService = {
  async get() {
    const res = await api.get('/settings')
    return res.settings ?? res
  },

  async update(data) {
    const res = await api.patch('/settings', data)
    return res.settings ?? res
  },
}
