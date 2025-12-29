<template>
  <div class="max-w-2xl mx-auto mt-8">
    <section class="bg-white p-6 rounded shadow">
      <h2 class="text-lg font-semibold mb-4">Thanh toán hoàn tất</h2>
      <p v-if="status">Trạng thái: <strong>{{ statusText }}</strong></p>
      <p v-else>Đang cập nhật trạng thái thanh toán...</p>
      <div class="mt-4">
        <router-link to="/profile" class="px-3 py-1 bg-blue-600 text-white rounded">Quay lại trang cá nhân</router-link>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  setup() {
    const auth = useAuth()
    const status = ref<string | null>(null)

    const statusText = computed(() => {
      if (!status.value) return '---'
      if (status.value === 'active') return 'Active — Bạn đã là Premium'
      return status.value
    })

    onMounted(async () => {
      try {
        const token = auth.user.value?.token
        const resp = await fetch('/api/billing/status', { headers: { ...(token ? { authorization: 'Bearer ' + token } : {}) } })
        if (!resp.ok) {
          status.value = 'unknown'
          return
        }
        const j = await resp.json()
        status.value = j.subscriptionStatus || (j.premium ? 'active' : 'inactive')

        // refresh auth state from server (get updated premium flag)
        try {
          await (auth as any).refresh()
        } catch (e) {}
      } catch (e) {
        status.value = 'error'
      }
    })

    return { status, statusText }
  }
})
</script>

<style scoped>
</style>
