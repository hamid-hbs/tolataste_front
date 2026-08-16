<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { notificationsState as notifications } from '@/state/notifications'
import PublicHeader from '@/components/PublicHeader.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()

const hideGlobalNav = computed(() =>
  ['/serveur', '/cuisine', '/manager', '/admin'].some(p => route.path.startsWith(p))
)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <PublicHeader v-if="!hideGlobalNav" />

    <main class="flex-1">
      <router-view />
    </main>

    <Footer v-if="!hideGlobalNav" />
  </div>

  <div class="toast-container">
    <div v-for="t in notifications.toasts" :key="t.id" class="toast" :class="'toast-' + t.type" @click="notifications.remove(t.id)">
      <span class="toast-icon">{{ t.icon }}</span>
      <div class="toast-content">
        <div class="toast-title">{{ t.title }}</div>
        <div class="toast-message">{{ t.message }}</div>
        <div v-if="t.onConfirm" class="toast-actions" @click.stop>
          <button type="button" class="toast-btn" @click="notifications.remove(t.id)">Annuler</button>
          <button type="button" class="toast-btn" :class="t.danger ? 'toast-btn-danger' : 'toast-btn-primary'"
            @click="notifications.remove(t.id); t.onConfirm()">{{ t.confirmLabel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.toast-container {
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
  display: flex; flex-direction: column; gap: 0.5rem; max-width: 360px;
}
.toast {
  display: flex; align-items: flex-start; gap: 0.75rem;
  padding: 0.875rem 1rem; border-radius: 0.75rem;
  background: #1a1a1a; color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  cursor: pointer;
  animation: toast-in 0.3s ease;
}
@keyframes toast-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.toast-icon { font-size: 1.1rem; line-height: 1.4; }
.toast-content { flex: 1; min-width: 0; }
.toast-title { font-weight: 700; font-size: 0.8125rem; }
.toast-message { font-size: 0.75rem; opacity: 0.8; margin-top: 0.125rem; }
.toast.toast-success { border-left: 3px solid #10b981; }
.toast.toast-warning { border-left: 3px solid #f59e0b; }
.toast.toast-danger { border-left: 3px solid #ef4444; }
.toast.toast-info { border-left: 3px solid #3b82f6; }
.toast-actions { display: flex; gap: 0.5rem; margin-top: 0.625rem; }
.toast-btn {
  flex: 1; padding: 0.5rem 0.75rem; border: none; border-radius: 0.5rem;
  font-size: 0.75rem; font-weight: 700; cursor: pointer;
  background: rgba(255,255,255,0.15); color: #fff;
}
.toast-btn:hover { background: rgba(255,255,255,0.25); }
.toast-btn-primary { background: #f59e0b; color: #fff; }
.toast-btn-primary:hover { background: #d97706; }
.toast-btn-danger { background: #ef4444; color: #fff; }
.toast-btn-danger:hover { background: #dc2626; }
</style>
