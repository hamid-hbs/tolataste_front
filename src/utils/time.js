export function elapsed(ts) {
  if (!ts) return ''
  const t = new Date(ts).getTime()
  if (Number.isNaN(t)) return ''
  const min = Math.floor((Date.now() - t) / 60000)
  if (min < 1) return "À l'instant"
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${m}` : `${h}h`
}