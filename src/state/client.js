import { reactive } from 'vue'
import { cartState } from './cart'

const state = reactive({
  tableId: null,
  note: '',
  lastOrderId: null,
})

export const clientState = {
  get cart() {
    return cartState.lines.map((l) => ({
      id: l.productId,
      name: l.name,
      price: l.price,
      qty: l.qty,
    }))
  },

  get cartCount() {
    return cartState.count
  },

  get cartTotal() {
    return cartState.total
  },

  get tableId() {
    return state.tableId
  },

  get note() {
    return state.note
  },

  set note(v) {
    state.note = v
  },

  addToCart(item) {
    cartState.add(item)
  },

  updateQty(id, qty) {
    cartState.setQty(id, qty)
  },

  removeFromCart(id) {
    cartState.remove(id)
  },

  clearCart() {
    cartState.clear()
  },

  setTable(id) {
    state.tableId = id
  },

  setLastOrderId(id) {
    state.lastOrderId = id
  },

  reset() {
    state.tableId = null
    state.note = ''
    state.lastOrderId = null
    localStorage.removeItem('tt_my_orders')
  },
}