import { api } from './client'

export function mapTable(t) {
  return {
    id: t.id,
    number: t.number,
    zone: t.zone,
    capacity: t.capacity ?? 2,
    status: t.status,
    currentOrderId: null,
  }
}

export const tablesService = {
  async getAll() {
    const res = await api.get('/tables')
    const list = Array.isArray(res) ? res : (res.tables ?? api.unwrapList(res))
    return list.map(mapTable)
  },

  async getAvailable() {
    const res = await api.get('/tables/available', { auth: false })
    const list = Array.isArray(res) ? res : (res.tables ?? api.unwrapList(res))
    return list.map(mapTable)
  },

  async updateStatus(id, status) {
    await api.patch(`/tables/${id}/status`, { status })
  },

  async create(data) {
    const res = await api.post('/tables', {
      number: data.number,
      zone: data.zone,
    })
    return mapTable(res.table)
  },

  async update(id, data) {
    const res = await api.patch(`/tables/${id}`, data)
    return mapTable(res.table)
  },

  async delete(id) {
    await api.del(`/tables/${id}`)
  },
}
