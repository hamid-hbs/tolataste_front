import { reactive } from 'vue'
import { menuService } from '@/api/menu'

const state = reactive({
  items: [],
  categories: [],
  loading: false,
})

export const menuState = {
  get items() {
    return state.items
  },

  get categories() {
    return state.categories
  },

  get loading() {
    return state.loading
  },

  get availableItems() {
    return state.items.filter((i) => i.available)
  },

  getProduct(id) {
    return state.items.find((i) => i.id === Number(id)) ?? null
  },

  getCategory(idOrLabel) {
    return state.categories.find((c) => c.id === Number(idOrLabel) || c.label === idOrLabel) ?? null
  },

  async fetchAll() {
    state.loading = true
    try {
      const { items } = await menuService.getProducts()
      state.items = items
      state.categories = await menuService.getCategories()
    } catch {
      state.items = []
      state.categories = []
    } finally {
      state.loading = false
    }
  },

  _payload(data) {
    const fields = {
      name: data.name,
      description: data.description ?? '',
      price: data.price,
      category_id: data.categoryId,
      active: data.available ?? true,
    }
    if (data.imageFile) {
      const fd = new FormData()
      fd.append('image', data.imageFile)
      for (const [key, value] of Object.entries({ ...fields, active: fields.active ? '1' : '0' })) {
        fd.append(key, String(value))
      }
      if (data.removeImage) fd.append('remove_image', '1')
      return fd
    }
    return { ...fields, image: data.image ?? '', remove_image: data.removeImage ? '1' : undefined }
  },

  async addItem(data) {
    const product = await menuService.createProduct(menuState._payload(data))
    state.items.push(product)
    return product
  },

  async updateItem(id, data) {
    const product = await menuService.updateProduct(id, menuState._payload(data))
    const idx = state.items.findIndex((i) => i.id === Number(id))
    if (idx !== -1) state.items[idx] = product
    return product
  },

  async removeItem(id) {
    await menuService.deleteProduct(id)
    state.items = state.items.filter((i) => i.id !== Number(id))
  },

  async toggleAvailable(id) {
    const item = state.items.find((i) => i.id === Number(id))
    if (!item) return
    const next = !item.available
    const product = await menuService.toggleProduct(id, next)
    item.available = Boolean(product.available)
  },

  async addCategory(label) {
    try {
      const cat = await menuService.createCategory(label)
      state.categories.push(cat)
      return true
    } catch {
      return false
    }
  },

  async removeCategory(idOrLabel) {
    try {
      const cat = menuState.getCategory(idOrLabel)
      const id = cat?.id ?? idOrLabel
      await menuService.deleteCategory(id)
      state.categories = state.categories.filter((c) => c.id !== id)
      return true
    } catch {
      return false
    }
  },

  async updateCategory(idOrLabel, label) {
    try {
      const cat = menuState.getCategory(idOrLabel)
      const id = cat?.id ?? idOrLabel
      const updated = await menuService.updateCategory(id, label)
      const idx = state.categories.findIndex((c) => c.id === Number(id))
      if (idx !== -1) state.categories[idx] = updated
      return true
    } catch {
      return false
    }
  },

  reset() {
    state.items = []
    state.categories = []
    state.loading = false
  },
}