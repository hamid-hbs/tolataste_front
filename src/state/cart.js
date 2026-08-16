import { reactive } from 'vue'
import { menuState } from './menu'

const STORAGE_KEY = 'tt_cart'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines))
}

const state = reactive({ lines: load() })

export const cartState = {
  get lines() {
    return state.lines
  },

  get count() {
    return state.lines.reduce((s, l) => s + l.qty, 0)
  },

  get total() {
    return state.lines.reduce((s, l) => s + Number(l.price ?? 0) * l.qty, 0)
  },

  qtyOf(productId) {
    return state.lines.find((l) => l.productId === productId)?.qty ?? 0
  },

  add({ id, name, price }) {
    const line = state.lines.find((l) => l.productId === id)
    if (line) line.qty += 1
    else state.lines.push({ productId: id, name: name ?? '', price: Number(price) || 0, qty: 1 })
    persist()
  },

  increment(productId) {
    const line = state.lines.find((l) => l.productId === productId)
    if (line) line.qty += 1
    else {
      const product = menuState.getProduct(productId)
      state.lines.push({
        productId,
        name: product?.name ?? '',
        price: Number(product?.price) || 0,
        qty: 1,
      })
    }
    persist()
  },

  setQty(productId, qty) {
    const line = state.lines.find((l) => l.productId === productId)
    if (!line) return
    if (qty <= 0) cartState.remove(productId)
    else {
      line.qty = qty
      persist()
    }
  },

  remove(productId) {
    state.lines = state.lines.filter((l) => l.productId !== productId)
    persist()
  },

  clear() {
    state.lines = []
    persist()
  },

  reset() {
    state.lines = []
    localStorage.removeItem(STORAGE_KEY)
  },
}