// ponytail: flat utilities, no class wrappers
export function formatTemp(c?: number): string {
  return c != null ? `${c.toFixed(1)}°C` : '--°C'
}
export function formatHumidity(h?: number): string {
  return h != null ? `${h.toFixed(0)}%` : '--%'
}
export function formatPressure(p?: number): string {
  return p != null ? `${p.toFixed(0)} hPa` : '-- hPa'
}
export function formatBattery(b?: number): string {
  if (b == null) return '--'
  return b > 20 ? `${b}%` : `${b}% ⚠`
}
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
}
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m}m lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}j lalu`
  const d = Math.floor(h / 24)
  return `${d}h lalu`
}
