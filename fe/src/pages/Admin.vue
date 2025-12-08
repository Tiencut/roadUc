<template>
  <div class="max-w-5xl mx-auto mt-8">
    <section class="bg-white p-6 rounded shadow">
      <h2 class="text-lg font-semibold mb-4">Admin - Quản lý nội dung</h2>
      <div class="text-sm text-gray-600 mb-3">Chú ý: trang này dành cho admin/developer. Đăng nhập bằng tài khoản `admin` để sử dụng.</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Visas panel -->
        <div class="col-span-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">Visas</h3>
            <button @click="reloadVisas" class="px-2 py-1 border rounded text-sm">Tải lại</button>
          </div>
          <div class="mb-3">
            <form @submit.prevent="createVisa" class="flex gap-2">
              <input v-model="newVisa.title" placeholder="Tiêu đề" class="flex-1 border px-2 py-1 rounded" />
              <input v-model="newVisa.code" placeholder="Mã" class="w-28 border px-2 py-1 rounded" />
              <button class="px-3 py-1 bg-green-600 text-white rounded">Thêm</button>
            </form>
          </div>

          <div class="space-y-2">
            <div v-for="v in visas" :key="v.id" class="p-2 border rounded">
              <div class="flex items-center gap-2">
                <input v-model="v.title" class="flex-1 border px-2 py-1 rounded text-sm" />
                <input v-model="v.code" class="w-24 border px-2 py-1 rounded text-sm" />
                <button @click="updateVisa(v)" class="px-2 py-1 bg-blue-600 text-white rounded text-sm">Lưu</button>
                <button @click="deleteVisa(v)" class="px-2 py-1 bg-red-600 text-white rounded text-sm">Xóa</button>
              </div>
              <div class="text-xs text-gray-600 mt-1">{{ v.desc || '' }}</div>
            </div>
          </div>
        </div>

        <!-- Phases panel -->
        <div class="col-span-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">Phases / Details</h3>
            <button @click="reloadPhases" class="px-2 py-1 border rounded text-sm">Tải lại</button>
          </div>

          <div v-if="phases && phases.length">
            <div v-for="(p, i) in phases" :key="p.id" class="mb-3 border p-2 rounded">
              <div class="flex items-center gap-2 mb-2">
                <input v-model="p.title" class="flex-1 border px-2 py-1 rounded text-sm" />
                <button @click="removePhase(i)" class="px-2 py-1 bg-red-600 text-white rounded text-sm">Xóa</button>
              </div>
              <div class="text-xs text-gray-600 mb-2">Details:</div>
              <div class="space-y-2">
                <div v-for="(d, j) in p.details" :key="j" class="flex gap-2 items-start">
                  <input v-model="d.title" class="flex-1 border px-2 py-1 rounded text-sm" />
                  <input v-model="d.note" placeholder="Ghi chú" class="w-40 border px-2 py-1 rounded text-sm" />
                  <button @click="removeDetail(p, j)" class="px-2 py-1 bg-red-600 text-white rounded text-sm">Xóa</button>
                </div>
                <div class="mt-2">
                  <button @click="addDetail(p)" class="px-2 py-1 border rounded text-sm">Thêm detail</button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <button @click="addPhase" class="px-3 py-1 bg-green-600 text-white rounded">Thêm Phase</button>
            <button @click="savePhases" class="px-3 py-1 bg-blue-600 text-white rounded ml-2">Lưu Phases</button>
          </div>
        </div>

        <!-- Users panel -->
        <div class="col-span-1">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">Users</h3>
            <button @click="loadUsers" class="px-2 py-1 border rounded text-sm">Tải lại</button>
          </div>

          <div class="mb-3">
            <form @submit.prevent="createUser" class="space-y-2">
              <div>
                <input v-model="newUser.email" placeholder="Email" class="w-full border px-2 py-1 rounded" />
                <div v-if="newUserErrors.email" class="text-xs text-red-600 mt-1">{{ newUserErrors.email }}</div>
              </div>
              <div>
                <input v-model="newUser.password" placeholder="Mật khẩu" type="password" class="w-full border px-2 py-1 rounded" />
                <div v-if="newUserErrors.password" class="text-xs text-red-600 mt-1">{{ newUserErrors.password }}</div>
              </div>
              <div class="flex gap-2">
                <select v-model="newUser.role" class="border px-2 py-1 rounded">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button class="px-3 py-1 bg-green-600 text-white rounded">Tạo user</button>
              </div>
            </form>
          </div>

          <div class="space-y-2">
            <div class="mb-2">
              <input v-model="userQuery" placeholder="Tìm user..." class="w-full border px-2 py-1 rounded mb-2 text-sm" />
              <div v-for="u in usersForPage()" :key="u.id" class="p-2 border rounded mb-2">
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <div class="font-medium">{{ u.email }}</div>
                  <div class="text-xs text-gray-500">Role: {{ u.role }}</div>
                </div>
                <div class="flex gap-2">
                  <select v-model="u.role" @change="changeRole(u, u.role)" class="border px-2 py-1 text-sm rounded">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <button @click="promptReset(u)" class="px-2 py-1 bg-yellow-500 text-white rounded text-sm">Đổi mật khẩu</button>
                  <button @click="deleteUser(u)" class="px-2 py-1 bg-red-600 text-white rounded text-sm">Xóa</button>
                </div>
              </div>
              </div>
              <div class="flex items-center justify-between mt-2">
                <div class="text-sm text-gray-600">Trang {{ page }} / {{ totalPages }}</div>
                <div class="flex gap-2">
                  <button @click="page = Math.max(1, page - 1)" class="px-2 py-1 border rounded text-sm">Prev</button>
                  <button @click="page = Math.min(Number(totalPages), page + 1)" class="px-2 py-1 border rounded text-sm">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="message" class="text-sm text-green-700 mt-4">{{ message }}</div>
      <div v-if="error" class="text-sm text-red-600 mt-4">{{ error }}</div>

      <!-- Password reset modal -->
      <div v-if="resetModalVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div class="bg-white rounded p-4 w-full max-w-md">
          <h4 class="font-medium mb-2">Đổi mật khẩu cho {{ resetModalUser?.email || '' }}</h4>
          <div class="mb-2">
            <input v-model="resetModalNewPass" type="password" placeholder="Mật khẩu mới" class="w-full border px-2 py-1 rounded" />
            <div v-if="resetModalError" class="text-xs text-red-600 mt-1">{{ resetModalError }}</div>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="resetModalVisible = false" class="px-3 py-1 border rounded">Hủy</button>
            <button @click="submitResetModal" :disabled="resetModalLoading" class="px-3 py-1 bg-blue-600 text-white rounded">{{ resetModalLoading ? 'Đang...' : 'Xác nhận' }}</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  setup() {
    const auth = useAuth()
    const text = ref('')
    const message = ref('')
    const error = ref('')
    const visas = ref<any[]>([])
    const newVisa = ref<any>({ title: '', code: '', desc: '' })
    const phases = ref<any[]>([])

    function clientValidateVisaObject(v: any) {
      if (!v || typeof v !== 'object') return 'Visa không hợp lệ'
      if (!v.title || String(v.title).trim().length < 3) return 'Tiêu đề phải ít nhất 3 ký tự'
      if (!v.code || String(v.code).trim().length === 0) return 'Mã visa bắt buộc'
      return null
    }

    function clientValidatePhases(): string | null {
      if (!Array.isArray(phases.value)) return 'Phases phải là mảng'
      for (const p of phases.value) {
        if (!p.title || String(p.title).trim().length === 0) return 'Mỗi phase phải có tiêu đề'
        if (p.details && Array.isArray(p.details)) {
          for (const d of p.details) {
            if (!d.title || String(d.title).trim().length === 0) return 'Mỗi detail phải có tiêu đề'
          }
        }
      }
      return null
    }

    async function loadContent() {
      message.value = ''
      error.value = ''
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/content', { headers: hdrs })
        if (!resp.ok) throw new Error('HTTP ' + resp.status)
        const j = await resp.json()
        const data = j.data || {}
        visas.value = Array.isArray(data.visas) ? JSON.parse(JSON.stringify(data.visas)) : []
        phases.value = Array.isArray(data.phases) ? JSON.parse(JSON.stringify(data.phases)) : []
        text.value = JSON.stringify(data, null, 2)
      } catch (e: any) {
        error.value = String(e)
      }
    }

    async function saveContent(obj?: any) {
      message.value = ''
      error.value = ''
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const payload = obj || { visas: visas.value, phases: phases.value }
        const resp = await fetch('/api/admin/content', { method: 'PUT', headers: hdrs, body: JSON.stringify(payload) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const j = await resp.json()
        message.value = 'Đã lưu ' + (j.data && j.data.updatedAt ? j.data.updatedAt : '')
      } catch (e: any) {
        error.value = String(e)
      }
    }

    onMounted(() => { loadContent(); loadUsers() })

    // Visas CRUD
    async function reloadVisas() { await loadContent() }

    async function createVisa() {
      error.value = ''
      message.value = ''
      const err = clientValidateVisaObject(newVisa.value)
      if (err) { error.value = err; return }
      if (visas.value.find(x => String(x.code).toLowerCase() === String(newVisa.value.code).toLowerCase())) {
        error.value = 'Mã visa đã tồn tại'
        return
      }
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/visas', { method: 'POST', headers: hdrs, body: JSON.stringify(newVisa.value) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const j = await resp.json()
        visas.value.push(j.data)
        newVisa.value = { title: '', code: '', desc: '' }
        message.value = 'Đã thêm visa'
      } catch (e: any) { error.value = String(e) }
    }

    async function updateVisa(v: any) {
      error.value = ''
      message.value = ''
      const err = clientValidateVisaObject(v)
      if (err) { error.value = err; return }
      // uniqueness check locally
      const dup = visas.value.find(x => String(x.code).toLowerCase() === String(v.code).toLowerCase() && String(x.id) !== String(v.id))
      if (dup) { error.value = 'Mã visa trùng với visa khác'; return }
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/visas/' + encodeURIComponent(v.id), { method: 'PUT', headers: hdrs, body: JSON.stringify(v) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        message.value = 'Đã cập nhật'
      } catch (e: any) { error.value = String(e) }
    }

    async function deleteVisa(v: any) {
      try {
        if (!confirm('Xác nhận xóa visa này?')) return
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/visas/' + encodeURIComponent(v.id), { method: 'DELETE', headers: hdrs })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const idx = visas.value.findIndex(x => String(x.id) === String(v.id))
        if (idx !== -1) visas.value.splice(idx, 1)
        message.value = 'Đã xóa'
      } catch (e: any) { error.value = String(e) }
    }

    // Phases editing
    function addPhase() {
      phases.value.push({ id: String(Date.now()), title: 'New phase', details: [] })
    }

    function removePhase(i: number) { phases.value.splice(i, 1) }

    function addDetail(p: any) { p.details = p.details || []; p.details.push({ title: 'New detail', note: '' }) }

    function removeDetail(p: any, j: number) { p.details.splice(j, 1) }

    function reloadPhases() { loadContent() }

    async function savePhases() {
      const err = clientValidatePhases()
      if (err) { error.value = err; return }
      await saveContent({ visas: visas.value, phases: phases.value })
    }

    // --- Users management ---
    const users = ref<any[]>([])
    const newUser = ref<any>({ email: '', password: '', role: 'user' })
    const newUserErrors = ref<any>({})

    async function loadUsers() {
      error.value = ''
      message.value = ''
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/users', { headers: hdrs })
        if (!resp.ok) throw new Error('HTTP ' + resp.status)
        const j = await resp.json()
        users.value = j.data || []
      } catch (e: any) {
        error.value = String(e)
      }
    }

    async function createUser() {
      error.value = ''
      message.value = ''
      newUserErrors.value = {}
      // client validation
      const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (!newUser.value.email || !emailRe.test(newUser.value.email)) { newUserErrors.value.email = 'Email không hợp lệ'; return }
      if (!newUser.value.password || String(newUser.value.password).length < 8) { newUserErrors.value.password = 'Mật khẩu phải >= 8 ký tự'; return }
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/users', { method: 'POST', headers: hdrs, body: JSON.stringify(newUser.value) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const j = await resp.json()
        users.value.push(j.data)
        newUser.value = { email: '', password: '', role: 'user' }
        newUserErrors.value = {}
        message.value = 'Đã tạo user'
      } catch (e: any) { error.value = String(e) }
    }

    function promptReset(u: any) {
      // open modal to set password
      resetModalUser.value = u
      resetModalNewPass.value = ''
      resetModalError.value = ''
      resetModalVisible.value = true
    }

    async function resetPassword(u: any, newPass: string) {
      error.value = ''
      message.value = ''
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/users/' + encodeURIComponent(u.id) + '/password', { method: 'PUT', headers: hdrs, body: JSON.stringify({ password: newPass }) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        message.value = 'Đã đổi mật khẩu'
      } catch (e: any) { error.value = String(e) }
    }

    // Modal-based reset flow
    const resetModalVisible = ref(false)
    const resetModalUser = ref<any>(null)
    const resetModalNewPass = ref('')
    const resetModalError = ref('')
    const resetModalLoading = ref(false)

    async function submitResetModal() {
      resetModalError.value = ''
      if (!resetModalUser.value) return
      const p = String(resetModalNewPass.value || '')
      if (p.length < 8) { resetModalError.value = 'Mật khẩu phải >= 8 ký tự'; return }
      resetModalLoading.value = true
      try {
        await resetPassword(resetModalUser.value, p)
        resetModalVisible.value = false
      } catch (e: any) {
        resetModalError.value = String(e)
      } finally {
        resetModalLoading.value = false
      }
    }

    async function deleteUser(u: any) {
      try {
        if (!confirm('Xác nhận xóa user ' + u.email + ' ?')) return
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/users/' + encodeURIComponent(u.id), { method: 'DELETE', headers: hdrs })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const idx = users.value.findIndex(x => String(x.id) === String(u.id))
        if (idx !== -1) users.value.splice(idx, 1)
        message.value = 'Đã xóa user'
      } catch (e: any) { error.value = String(e) }
    }

    async function changeRole(u: any, newRole: string) {
      try {
        const hdrs: any = { 'content-type': 'application/json' }
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/admin/users/' + encodeURIComponent(u.id), { method: 'PUT', headers: hdrs, body: JSON.stringify({ role: newRole }) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const j = await resp.json()
        const idx = users.value.findIndex(x => x.id === u.id)
        if (idx !== -1) users.value[idx].role = j.data.role
        message.value = 'Đã cập nhật role'
      } catch (e: any) { error.value = String(e) }
    }

    // --- search & paging for users ---
    const userQuery = ref('')
    const page = ref(1)
    const pageSize = ref(10)
    const filteredUsers = computed(() => {
      const q = (userQuery.value || '').toLowerCase().trim()
      return users.value.filter((u: any) => !q || (u.email || '').toLowerCase().includes(q))
    })
    const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize.value)))
    function usersForPage() {
      const p = Math.max(1, Math.min(page.value, totalPages.value))
      const start = (p - 1) * pageSize.value
      return filteredUsers.value.slice(start, start + pageSize.value)
    }

    return { text, visas, newVisa, createVisa, updateVisa, deleteVisa, phases, addPhase, removePhase, addDetail, removeDetail, reloadVisas, reloadPhases, savePhases, message, error,
      users, newUser, newUserErrors, loadUsers, createUser, promptReset, resetPassword, deleteUser, changeRole, userQuery, page, pageSize, totalPages, usersForPage,
      // modal helpers
      resetModalVisible, resetModalUser, resetModalNewPass, resetModalError, resetModalLoading, submitResetModal }
  }
})
</script>

<style scoped>
</style>
