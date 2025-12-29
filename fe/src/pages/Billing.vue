<template>
  <div class="max-w-2xl mx-auto mt-8">
    <section class="bg-white p-6 rounded shadow">
      <h2 class="text-lg font-semibold mb-4">Nâng cấp lên Premium</h2>
      <p>Truy cập các tính năng nâng cao: báo cáo cá nhân hoá, lịch sử thay đổi, xuất PDF...</p>
      <div class="mt-4">
        <button @click="startCheckout" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded">
          {{ loading ? 'Đang xử lý...' : 'Mua gói Premium' }}
        </button>
        <button v-if="isAdmin" @click="createProduct" class="ml-3 px-3 py-2 bg-gray-100 rounded">(Admin) Tạo product test</button>
      </div>
      <div v-if="priceId" class="mt-2 text-sm text-gray-600">Price ID: <code class="text-xs">{{ priceId }}</code></div>
      <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  setup() {
    const auth = useAuth()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const priceId = ref<string | null>(null)
    const isAdmin = (auth.user.value && auth.user.value.role === 'admin')

    async function loadConfig() {
      try {
        const resp = await fetch('/api/billing/config')
        if (!resp.ok) return
        const j = await resp.json()
        priceId.value = j.price || null
      } catch (e) {}
    }

    async function startCheckout() {
      error.value = null
      loading.value = true
      try {
        const token = auth.user.value?.token
        const resp = await fetch('/api/billing/create-checkout-session', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify({}) })
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '')
          throw new Error('HTTP ' + resp.status + ' ' + txt)
        }
        const j = await resp.json()
        if (j.url) {
          window.location.href = j.url
          return
        }
        if (j.id) {
          // fallback: redirect to session id path if needed
          window.location.href = '/billing/success?session_id=' + encodeURIComponent(j.id)
          return
        }
        throw new Error('Không thể tạo session thanh toán')
      } catch (e: any) {
        error.value = e?.message || String(e)
      } finally {
        loading.value = false
      }
    }

    async function createProduct() {
      error.value = null
      try {
        const token = auth.user.value?.token
        const resp = await fetch('/api/billing/create-product', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify({ amount: 2000 }) })
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi tạo product'; return }
        priceId.value = j.price && j.price.id
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    loadConfig()

    return { startCheckout, loading, error, priceId, isAdmin, createProduct }
  }
})
</script>

<style scoped>
</style>
