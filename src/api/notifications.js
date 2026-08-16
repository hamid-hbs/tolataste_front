import { api } from './client'

export const notificationsService = {
  async getAll() {
    const res = await api.get('/notifications')
    if (Array.isArray(res)) return res
    return (res).notifications ?? api.unwrapList(res)
  },

  async markRead(id) {
    await api.patch(`/notifications/${id}/read`, {})
  },
}
