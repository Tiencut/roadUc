import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'planned_visa'

export function usePlannedVisa() {
  const plannedVisa = ref<any | null>(null)
  const auth = useAuth()

  function loadFromLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) plannedVisa.value = JSON.parse(raw)
      else plannedVisa.value = null
    } catch (e) {
      plannedVisa.value = null
    }
  }

  async function setPlannedVisa(obj: any) {
    plannedVisa.value = obj
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)) } catch (e) {}
    try {
      const hdrs: any = { 'content-type': 'application/json' }
      const s = localStorage.getItem('session_id')
      if (s) hdrs['x-session-id'] = s
      try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
      await fetch('/api/planned-visa', { method: 'POST', headers: hdrs, body: JSON.stringify(obj) })
    } catch (e) {
      // ignore network errors, local persistence is primary
    }
    return plannedVisa.value
  }

  async function clearPlannedVisa() {
    plannedVisa.value = null
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
    try {
      const hdrs: any = {}
      const s = localStorage.getItem('session_id')
      if (s) hdrs['x-session-id'] = s
      try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
      await fetch('/api/planned-visa', { method: 'DELETE', headers: hdrs })
    } catch (e) {}
  }

  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) loadFromLocal()
  }

  onMounted(() => {
    loadFromLocal()
    window.addEventListener('storage', onStorage)
  })
  onBeforeUnmount(() => window.removeEventListener('storage', onStorage))

  return { plannedVisa, setPlannedVisa, clearPlannedVisa, loadFromLocal }
}
