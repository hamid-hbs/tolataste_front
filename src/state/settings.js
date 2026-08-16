import { reactive } from 'vue'
import { settingsService } from '@/api/settings'

const DEFAULT_SETTINGS = {
  restaurantName: 'Tola Taste',
  restaurantAddress: '',
  restaurantPhone: '',
  restaurantEmail: '',
  currency: 'FCFA',
  taxRate: 0,
}

const state = reactive({ settings: { ...DEFAULT_SETTINGS } })

export const settingsState = {
  get settings() {
    return state.settings
  },

  async fetchSettings() {
    try {
      const s = await settingsService.get()
      state.settings = { ...DEFAULT_SETTINGS, ...(s ?? {}) }
    } catch {
      // on garde les valeurs par défaut
    }
  },

  async update(data) {
    const s = await settingsService.update(data)
    state.settings = { ...state.settings, ...(s ?? {}) }
    return state.settings
  },
}