import { reactive } from 'vue'

const state = reactive({ toasts: [] })
let nextId = 1

export const notificationsState = {
  get toasts() {
    return state.toasts
  },

  get count() {
    return state.toasts.length
  },

  add({ type = 'info', title = '', message = '', onConfirm = null, confirmLabel = 'Confirmer', danger = false }) {
    const id = nextId++
    state.toasts.push({ id, type, title, message, onConfirm, confirmLabel, danger })
    if (!onConfirm) window.setTimeout(() => notificationsState.remove(id), 5000)
    return id
  },

  confirm({ title, message, confirmLabel = 'Oui, continuer', danger = true, onConfirm }) {
    return notificationsState.add({ type: 'warning', title, message, onConfirm, confirmLabel, danger })
  },

  remove(id) {
    state.toasts = state.toasts.filter((t) => t.id !== id)
  },

  clear() {
    state.toasts = []
  },
}