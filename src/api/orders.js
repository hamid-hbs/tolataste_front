import { api } from './client'

export const ordersService = {
  async getAll(params) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.date) query.set('date', params.date)
    query.set('per_page', String(params?.per_page ?? 200))
    const res = await api.get(`/orders?${query.toString()}`)
    return api.unwrapList(res)
  },

  async getHistory(params = {}) {
    const query = new URLSearchParams()
    if (params.serverId) query.set('server_id', params.serverId)
    if (params.statuses?.length) params.statuses.forEach((s) => query.append('status[]', s))
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    query.set('per_page', String(params.perPage ?? 20))
    query.set('page', String(params.page ?? 1))
    const res = await api.get(`/orders?${query.toString()}`)
    return {
      data: Array.isArray(res) ? res : (res?.data ?? []),
      lastPage: Number(res?.last_page ?? res?.meta?.last_page ?? 1),
      total: Number(res?.total ?? res?.meta?.total ?? 0),
    }
  },

  async getMine() {
    const res = await api.get('/orders/mine')
    return Array.isArray(res) ? res : (res?.orders ?? [])
  },

  async getOne(id) {
    const res = await api.get(`/orders/${id}`)
    return res.order
  },

  async create(data) {
    const res = await api.post('/orders', data)
    return res.order
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/orders/${id}/status`, { status })
    return res.order
  },

  async pay(data) {
    return api.post('/payments', data)
  },

  async getUnpaid() {
    const res = await api.get('/payments/unpaid')
    return api.unwrapList(res)
  },
}
