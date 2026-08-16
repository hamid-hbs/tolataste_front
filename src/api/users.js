import { api } from './client'

export const usersService = {
  async getAll() {
    const res = await api.get('/users')
    if (Array.isArray(res)) return res
    return res.users ?? api.unwrapList(res)
  },

  async getStaff() {
    const res = await api.get('/users/staff')
    if (Array.isArray(res)) return res
    return res.users ?? api.unwrapList(res)
  },

  async create(data) {
    const res = await api.post('/users', data)
    return res.user
  },

  async update(id, data) {
    const res = await api.patch(`/users/${id}`, data)
    return res.user
  },

  async delete(id) {
    await api.del(`/users/${id}`)
  },
}
