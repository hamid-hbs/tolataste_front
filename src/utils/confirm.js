import { notificationsState as notif } from '@/state/notifications'

export function confirmLogout(onConfirm) {
  notif.confirm({
    title: 'Déconnexion',
    message: 'Voulez-vous vraiment vous déconnecter ?',
    confirmLabel: 'Se déconnecter',
    onConfirm,
  })
}