<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Tạo Kế hoạch di trú</h1>

    <form @submit.prevent="submit">
      <div class="grid gap-4">
        <div>
          <label class="block text-sm font-medium">Mục tiêu visa</label>
          <input v-model="form.goal" class="mt-1 block w-full rounded border px-3 py-2" placeholder="e.g. Student, Skilled, Visitor" />
        </div>

        <div>
          <label class="block text-sm font-medium">Trình độ / học vấn</label>
          <input v-model="form.education" class="mt-1 block w-full rounded border px-3 py-2" placeholder="e.g. Bachelor's in IT" />
        </div>

        <div>
          <label class="block text-sm font-medium">Tài liệu (phân tách bằng dấu phẩy)</label>
          <input v-model="form.documents" class="mt-1 block w-full rounded border px-3 py-2" placeholder="e.g. passport, degree, transcripts" />
        </div>

        <div>
          <label class="block text-sm font-medium">Họ tên (tùy chọn)</label>
          <input v-model="form.name" class="mt-1 block w-full rounded border px-3 py-2" />
        </div>

        <div class="flex items-center gap-3">
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Tạo kế hoạch</button>
          <button type="button" @click="clear" class="px-4 py-2 bg-gray-100 rounded">Xóa</button>
          <router-link to="/billing" class="ml-auto text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded">Nâng cấp Premium</router-link>
        </div>

        <div v-if="error" class="text-red-600">{{ error }}</div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'PlanCreate',
  setup () {
    const router = useRouter()
    const form = reactive({ goal: '', education: '', documents: '', name: '' })
    const error = ref('')

    async function submit() {
      error.value = ''
      try {
        const documents = String(form.documents || '').split(',').map(s => s.trim()).filter(Boolean)
        const body = { answers: { goal: form.goal, education: form.education, documents, name: form.name } }
        const resp = await fetch('/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Lỗi server'; return }
        const key = j.plan && j.plan.key
        if (key) {
          // analytics
          try { fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'plan_created', planKey: key }) }) } catch (e) {}
          router.push({ path: `/plan/${encodeURIComponent(key)}` })
        }
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    function clear() { form.goal = ''; form.education = ''; form.documents = ''; form.name = '' }

    return { form, submit, clear, error }
  }
})
</script>

<style scoped>
</style>