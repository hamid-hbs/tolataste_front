import { reactive } from 'vue'
import { tablesService } from '@/api/tables'

export const TABLE_STATUS_LABELS = {
  free: 'Libre',
  occupied: 'Occupée',
  reserved: 'Réservée',
  cleaning: 'Nettoyage',
}

export const TABLE_STATUS_COLORS = {
  free: 'bg-tola-teal/10 text-tola-teal',
  occupied: 'bg-tola-red/10 text-tola-red',
  reserved: 'bg-tola-yellow/10 text-tola-yellow',
  cleaning: 'bg-tola-cream text-tola-gray',
}

const state = reactive({ tables: [] })

export const tablesState = {
  get tables() {
    return state.tables
  },

  get statusLabels() {
    return TABLE_STATUS_LABELS
  },

  get statusColors() {
    return TABLE_STATUS_COLORS
  },

  get tableCount() {
    return state.tables.length
  },

  getTable(id) {
    return state.tables.find((t) => t.id === Number(id)) ?? null
  },

  async fetchAll() {
    try {
      state.tables = await tablesService.getAll()
    } catch {
      // on garde l'état actuel si le backend est indisponible
    }
  },

  async updateStatus(id, status) {
    await tablesService.updateStatus(id, status)
    const t = state.tables.find((t) => t.id === Number(id))
    if (t) t.status = status
  },

  async freeTable(id) {
    await tablesState.updateStatus(id, 'free')
  },

  async addTable(data) {
    const table = await tablesService.create(data)
    state.tables.push(table)
    return table
  },

  async updateTable(id, data) {
    const table = await tablesService.update(id, data)
    const idx = state.tables.findIndex((t) => t.id === Number(id))
    if (idx !== -1) state.tables[idx] = table
    return table
  },

  async removeTable(id) {
    await tablesService.delete(id)
    state.tables = state.tables.filter((t) => t.id !== Number(id))
  },

  reset() {
    state.tables = []
  },
}