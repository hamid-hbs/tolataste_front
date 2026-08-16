<script setup>
import { ref, computed } from 'vue'
import { Bell, X } from '@lucide/vue'
import { notificationsState as notif } from '@/state/notifications'

const open = ref(false)

const unreadCount = computed(() => notif.toasts.length)

const typeIcons = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '✕',
}
</script>

<template>
  <div class="relative">
    <button @click="open = !open" class="relative flex h-10 w-10 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream" aria-label="Notifications">
      <Bell :size="20" />
      <span v-if="unreadCount > 0" class="absolute right-0.5 top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-tola-red px-1 text-[9px] font-bold text-white ring-2 ring-white">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition name="fade">
      <div v-if="open" class="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-white shadow-2xl ring-1 ring-tola-cream-dark/60">
        <div class="flex items-center justify-between border-b border-tola-cream-dark px-4 py-3">
          <span class="text-sm font-bold text-tola-ink">Notifications</span>
          <button @click="notif.toasts.forEach(t => notif.remove(t.id))" class="text-xs font-bold text-tola-red/60 hover:text-tola-red">Effacer</button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <div v-if="notif.toasts.length === 0" class="px-4 py-8 text-center text-sm text-tola-gray">Aucune notification</div>
          <div v-for="n in notif.toasts" :key="n.id" class="flex items-start gap-3 border-b border-tola-cream-dark/50 px-4 py-3 transition hover:bg-tola-cream/50">
            <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              :class="n.type === 'info' ? 'bg-tola-orange' : n.type === 'success' ? 'bg-tola-teal' : n.type === 'warning' ? 'bg-tola-yellow' : 'bg-tola-red'">
              {{ typeIcons[n.type] }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-tola-ink">{{ n.title }}</p>
              <p class="text-[11px] text-tola-gray">{{ n.message }}</p>
            </div>
            <button @click="notif.remove(n.id)" class="shrink-0 text-tola-gray/40 hover:text-tola-gray"><X :size="14" /></button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
