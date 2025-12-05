export const AUTH_KEY = 'rtu_auth_user'

export function isLoggedIn(): boolean {
  try {
    const v = localStorage.getItem(AUTH_KEY)
    return !!v
  } catch (e) {
    return false
  }
}

export function login(username: string, password: string): { ok: boolean; message?: string } {
  // temporary hard-coded credentials: admin/admin
  if (username === 'admin' && password === 'admin') {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ username: 'admin', loggedAt: Date.now() }))
    } catch (e) {}
    return { ok: true }
  }
  return { ok: false, message: 'Sai tên tài khoản hoặc mật khẩu' }
}

export function logout() {
  try { localStorage.removeItem(AUTH_KEY) } catch (e) {}
}
