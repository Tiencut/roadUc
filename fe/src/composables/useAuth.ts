import { ref } from 'vue'
import { useRouter } from 'vue-router'

type User = { email: string; name?: string; token?: string; role?: string; premium?: boolean }

const STORAGE_KEY = 'rtu_user'

export function useAuth() {
  const router = useRouter()
  const stored = localStorage.getItem(STORAGE_KEY)
  const user = ref<User | null>(stored ? JSON.parse(stored) : null)

  function save(u: User | null) {
    user.value = u
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  async function login(email: string, password: string) {
    // Call backend auth endpoint. Fallback to a lightweight mock if backend unavailable.
    try {
      // If a reCAPTCHA site key is configured, attempt to execute and retrieve a token
      let recaptchaToken: string | undefined = undefined
      try {
        const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITEKEY
        if (siteKey && (window as any).grecaptcha && typeof (window as any).grecaptcha.execute === 'function') {
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: 'login' })
        }
      } catch (e) {
        // non-blocking
      }
      const bodyPayload: any = { email, password }
      if (recaptchaToken) bodyPayload.recaptchaToken = recaptchaToken
      const resp = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bodyPayload) })
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '')
        throw new Error('HTTP ' + resp.status + ' ' + txt)
      }
      const j = await resp.json()
      const u: User = { email: j.user.email, name: j.user.email.split('@')[0], token: j.token, role: j.user?.role, premium: !!j.user?.premium }
      save(u)
      // After login, attempt to migrate any session-based planned-visa to the user account
      try {
        const sessionId = localStorage.getItem('session_id') || undefined
        const userId = u.email
        await fetch('/api/planned-visa/migrate', { method: 'POST', headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + u.token }, body: JSON.stringify({ userId, sessionId }) })
      } catch (e) {
        // non-blocking
      }
      return u
    } catch (err) {
      // Fallback to previous local mock behaviors for development/offline use
      if (email === 'admin' && password === 'admin') {
        const u: User = { email: 'admin', name: 'admin', token: 'admin-token' }
        ;(u as any).role = 'admin'
        save(u)
        return u
      }
      if (!email || !email.includes('@')) throw new Error('Email không hợp lệ')
      if (!password || password.length < 6) throw new Error('Password phải >= 6 ký tự')
      const u: User = { email, name: email.split('@')[0], token: 'mock-token-' + Date.now() }
      save(u)
      try {
        const sessionId = localStorage.getItem('session_id') || undefined
        const userId = u.email
        await fetch('/api/planned-visa/migrate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, sessionId }) })
      } catch (e) {}
      return u
    }
  }

  function logout() {
    // Capture stored user id before removing
    let storedUserRaw: string | null = null
    try { storedUserRaw = localStorage.getItem(STORAGE_KEY) } catch (e) {}
    // Try to revoke token server-side if present
    try {
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw)
        const token = parsed?.token
        if (token) {
          fetch('/api/auth/revoke', { method: 'POST', headers: { 'authorization': 'Bearer ' + token } }).catch(() => {})
          // also delete planned-visa for user
          fetch('/api/planned-visa', { method: 'DELETE', headers: { 'authorization': 'Bearer ' + token } }).catch(() => {})
        }
      }
    } catch (e) {}
    save(null)
    // navigate to home after logout
    router.push('/')
  }

  function isAuthenticated() {
    return !!user.value
  }

  async function refresh() {
    try {
      const token = user.value?.token
      if (!token) return null
      const resp = await fetch('/api/auth/me', { headers: { authorization: 'Bearer ' + token } })
      if (!resp.ok) return null
      const j = await resp.json()
      const u: User = { email: j.user.email, name: j.user.email.split('@')[0], token, role: j.user?.role, premium: !!j.user?.premium }
      save(u)
      return u
    } catch (e) {
      return null
    }
  }

  return { user, login, logout, isAuthenticated, refresh }
}

export type { User }
