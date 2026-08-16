import { api } from './client'

function resolveImage(image) {
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image
  if (image.startsWith('/')) return image
  return `/storage/${image.replace(/^\/+/, '')}`
}

function mapProduct(p, rawCats) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    category: p.category?.label ?? rawCats.find((c) => c.id === p.category_id)?.label ?? 'Autres',
    categoryId: p.category_id,
    image: resolveImage(p.image),
    available: Boolean(p.active),
  }
}

export const menuService = {
  async getCategories() {
    const res = await api.get('/categories', { auth: false })
    return Array.isArray(res) ? res : (res?.categories ?? api.unwrapList(res))
  },

  async createCategory(label) {
    const res = await api.post('/categories', { label })
    return res.category
  },

  async updateCategory(id, label) {
      const res = await api.patch(`/categories/${id}`, { label })
      return res.category
    },

  async deleteCategory(id) {
      await api.del(`/categories/${id}`)
    },

  async getProducts() {
    const [catsRes, prodsRes] = await Promise.all([
      api.get('/categories', { auth: false }),
      api.get('/products', { auth: false }),
    ])
    const rawCats = Array.isArray(catsRes) ? catsRes : (catsRes?.categories ?? api.unwrapList(catsRes))
    const rawProds = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.products ?? api.unwrapList(prodsRes))

    return {
      items: rawProds.map((p) => mapProduct(p, rawCats)),
      raw: rawProds,
    }
  },

  async createProduct(data) {
    const res = await api.post('/products', data)
    return mapProduct(res.product, [])
  },

  async updateProduct(id, data) {
    const isForm = data instanceof FormData
    const res = isForm ? await api.post(`/products/${id}`, data) : await api.patch(`/products/${id}`, data)
    return mapProduct(res.product, [])
  },

  async deleteProduct(id) {
    await api.del(`/products/${id}`)
  },

  async toggleProduct(id, active) {
    const res = await api.patch(`/products/${id}`, { active })
    return mapProduct(res.product, [])
  },
}
