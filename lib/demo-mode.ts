const DEMO_MODE_KEY = 'ftc_demo_mode'

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(DEMO_MODE_KEY)
  return stored === 'true'
}

export function setDemoMode(value: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_MODE_KEY, value ? 'true' : 'false')
}

export function toggleDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const next = !isDemoMode()
  setDemoMode(next)
  return next
}
