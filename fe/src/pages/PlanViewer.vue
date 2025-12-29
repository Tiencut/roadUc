<template>
  <div class="max-w-3xl mx-auto p-6">
    <div class="flex items-start justify-between">
      <h1 class="text-2xl font-semibold mb-2">Kế hoạch</h1>
      <div>
        <button v-if="isPremium" @click="exportPlan" class="px-3 py-2 bg-blue-600 text-white rounded">Xuất PDF</button>
        <button v-else @click="goBilling" class="px-3 py-2 bg-yellow-100 text-yellow-800 rounded">Nâng cấp để xuất</button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Đang tải...</div>

    <div v-if="plan" class="mt-4">
      <div class="mb-4">Key: <strong>{{ plan.key }}</strong></div>
      <div class="mb-4">
        <h3 class="font-semibold">Answers</h3>
        <pre class="bg-gray-50 p-3 rounded">{{ plan.answers }}</pre>
      </div>

      <div>
        <h3 class="font-semibold mb-2">Steps</h3>
        <ol class="list-decimal pl-5 space-y-3">
          <li v-for="s in plan.generatedSteps" :key="s.id" class="p-3 bg-white border rounded">
            <div class="font-semibold">{{ s.title }}</div>
            <div class="text-sm text-gray-600">{{ s.content }}</div>
          </li>
        </ol>
      </div>

      <div v-if="exportUrl" class="mt-4">
        <a :href="exportUrl" target="_blank" class="text-blue-600 underline mr-4">Tải về bản xuất</a>
        <a v-if="plan && plan.key && exportUrl.endsWith('.html')" :href="exportUrl.replace('.html', '.pdf')" target="_blank" class="text-blue-600 underline">Tải PDF (nếu có)</a>
      </div>
    </div>

    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'PlanViewer',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const key = String(route.params.key || '')
    const plan = ref<any>(null)
    const loading = ref(false)
    const error = ref('')
    const exportUrl = ref('')

    const isPremium = (() => {
      try {
        const raw = localStorage.getItem('rtu_user')
        if (!raw) return false
        const u = JSON.parse(raw)
        return !!u && !!u.premium
      } catch (e) { return false }
    })()

    async function load() {
      if (!key) { error.value = 'Missing key'; return }
      loading.value = true
      try {
        const resp = await fetch(`/api/plans/${encodeURIComponent(key)}`)
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Không tìm thấy kế hoạch'; loading.value = false; return }
        plan.value = j.plan
      } catch (e: any) { error.value = String(e?.message || e) }
      loading.value = false
    }

    async function exportPlan() {
      if (!plan.value) return
      try {
        // require auth token for premium export
        const raw = localStorage.getItem('rtu_user')
        const token = raw ? JSON.parse(raw).token : null
        const headers: any = {}
        if (token) headers.authorization = 'Bearer ' + token
        const resp = await fetch(`/api/plans/${encodeURIComponent(key)}/export`, { method: 'POST', headers })
        if (resp.status === 401) { error.value = 'Vui lòng đăng nhập để xuất bản.'; return }
        if (resp.status === 402) { goBilling(); return }
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi xuất'; return }
        exportUrl.value = j.pdf || j.url || ''
        // analytics
        try { fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'plan_exported', planKey: key }) }) } catch (e) {}
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    function goBilling() { router.push({ path: '/billing' }) }

    onMounted(() => { load() })

    return { plan, loading, error, exportUrl, exportPlan, goBilling, isPremium }
  }
})
</script>

<style scoped>
</style>