import { ref } from 'vue'
import { useRouter } from 'vue-router'

type User = { email: string; name?: string; token?: string }

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
    // Mock login: accept any email/password with basic validation.
    if (!email || !email.includes('@')) throw new Error('Email không hợp lệ')
    if (!password || password.length < 6) throw new Error('Password phải >= 6 ký tự')

    // In a real app call the backend: await api.post('/auth/login', { email, password })
    // Here we mock a token and user object
    const u: User = { email, name: email.split('@')[0], token: 'mock-token-' + Date.now() }
    save(u)
    return u
  }

  function logout() {
    save(null)
    // navigate to home after logout
    router.push('/')
  }

  function isAuthenticated() {
    return !!user.value
  }

  return { user, login, logout, isAuthenticated }
}
