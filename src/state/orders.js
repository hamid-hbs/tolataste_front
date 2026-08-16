import { reactive } from 'vue'
import { ordersService } from '@/api/orders'
import { settingsState } from './settings'

export const STATUS_LABELS = {
  pending: 'Nouvelle',
  waiting: 'En attente',
  preparing: 'En préparation',
  ready: 'Prête',
  served: 'Servie',
  cancelled: 'Annulée',
}

export const PAYMENT_LABELS = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte',
  orange_money: 'Orange Money',
  wave: 'Wave',
}

const ACTIVE_STATUSES = ['pending', 'waiting', 'preparing', 'ready']

const state = reactive({ orders: [] })
const historyState = reactive({ orders: [], page: 1, lastPage: 1, total: 0, loading: false })
let historyParams = {}

function isToday(ts) {
  return new Date(ts).toDateString() === new Date().toDateString()
}

function enrich(order) {
  const subtotal = Number(order.total ?? 0)
  const taxRate = Number(order.taxRate ?? settingsState.settings.taxRate ?? 0)
  const discount = Number(order.discount ?? 0)
  const tax = Math.round(subtotal * (taxRate / 100))
  return {
    ...order,
    id: Number(order.id),
    createdAt: order.created_at ?? order.createdAt,
    tableId: order.table_id ?? order.tableId,
    items: (order.items ?? []).map((i) => ({
      ...i,
      menuItemId: i.menuItemId ?? i.product_id,
    })),
    subtotal,
    taxRate,
    discount,
    tax,
    total: Math.max(0, subtotal - discount + tax),
  }
}

export const ordersState = {
  get orders() {
    return state.orders
  },

  get STATUS_LABELS() {
    return STATUS_LABELS
  },

  get PAYMENT_LABELS() {
    return PAYMENT_LABELS
  },

  get clientNewOrders() {
    return state.orders.filter((o) => o.status === 'pending')
  },

  get waitingOrders() {
    return state.orders.filter((o) => o.status === 'waiting')
  },

  get preparingOrders() {
    return state.orders.filter((o) => o.status === 'preparing')
  },

  get readyOrders() {
    return state.orders.filter((o) => o.status === 'ready')
  },

  get kitchenOrders() {
    return state.orders.filter((o) => ['waiting', 'preparing', 'ready'].includes(o.status))
  },

  get unpaidServed() {
    return state.orders.filter((o) => o.status === 'served' && !o.paid)
  },

  get todayOrders() {
    return state.orders.filter((o) => isToday(o.createdAt))
  },

  get todaySales() {
    return ordersState.todayOrders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0)
  },

  get activeCount() {
    return state.orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
  },

  get averageOrderValue() {
    const paid = state.orders.filter((o) => o.paid)
    return paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0
  },

  getOrder(id) {
    return state.orders.find((o) => o.id === Number(id)) ?? null
  },

  get historyOrders() {
    return historyState.orders
  },

  get historyLoading() {
    return historyState.loading
  },

  get historyHasMore() {
    return historyState.page < historyState.lastPage
  },

  get historyTotal() {
    return historyState.total
  },

  async fetchHistory(params = {}) {
    historyParams = params
    historyState.loading = true
    try {
      const res = await ordersService.getHistory(params)
      historyState.orders = res.data.map(enrich)
      historyState.page = 1
      historyState.lastPage = res.lastPage
      historyState.total = res.total
    } catch {
      // on garde l'état actuel si le backend est indisponible
    } finally {
      historyState.loading = false
    }
  },

  async loadMoreHistory() {
    if (historyState.loading || !ordersState.historyHasMore) return
    historyState.loading = true
    try {
      const res = await ordersService.getHistory({ ...historyParams, page: historyState.page + 1 })
      historyState.orders = [...historyState.orders, ...res.data.map(enrich)]
      historyState.page += 1
      historyState.lastPage = res.lastPage
      historyState.total = res.total
    } catch {
      // silencieux
    } finally {
      historyState.loading = false
    }
  },

  async fetchAll() {
    try {
      const list = await ordersService.getAll()
      state.orders = list.map(enrich)
    } catch {
      // on garde l'état actuel si le backend est indisponible
    }
  },

  async fetchMine() {
    try {
      const list = await ordersService.getMine()
      state.orders = list.map(enrich)
    } catch {
      // on garde l'état actuel si le backend est indisponible
    }
  },

  async createOrder(data) {
    const payload = {
      type: data.type === 'dine-in' ? 'dine_in' : (data.type ?? 'takeaway'),
      note: data.note ?? null,
      table_id: data.tableId ?? null,
      items: (data.items ?? []).map((item) => ({
        product_id: item.productId ?? item.menuItemId,
        qty: item.qty,
      })),
    }
    const order = await ordersService.create(payload)
    const full = enrich(order)
    full.source = 'client'
    state.orders.unshift(full)
    return full
  },

  async updateStatus(id, status) {
    const order = await ordersService.updateStatus(id, status)
    const idx = state.orders.findIndex((o) => o.id === Number(id))
    if (idx !== -1) {
      state.orders[idx] = enrich({ ...state.orders[idx], ...order, status: order.status ?? status })
    }
    return state.orders[idx] ?? null
  },

  async processPayment(orderId, { method, amountPaid }) {
    const res = await ordersService.pay({
      order_id: orderId,
      method,
      amount: amountPaid,
    })
    const order = state.orders.find((o) => o.id === Number(orderId))
    if (order) {
      order.paid = true
      order.paymentMethod = method
      order.totalPaid = amountPaid
      order.change = Math.max(0, Number(res?.change ?? amountPaid - order.total))
    }
  },

  applyDiscount(orderId, amount) {
    const order = state.orders.find((o) => o.id === Number(orderId))
    if (!order) return
    order.discount = Math.max(0, Number(amount) || 0)
    order.total = Math.max(0, order.subtotal - order.discount + order.tax)
  },

  reset() {
    state.orders = []
    historyState.orders = []
    historyState.page = 1
    historyState.lastPage = 1
    historyState.total = 0
    historyState.loading = false
    historyParams = {}
  },
}