<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Chọn trường / ngành</h1>
    <form @submit.prevent="search" class="space-y-4 bg-white p-4 border rounded">
      <div>
        <label class="block text-sm">Điểm học bạ (10)</label>
        <input class="mt-1 block w-40 border rounded px-2 py-1" type="number" step="0.1" v-model.number="score" />
      </div>
      <div>
        <label class="block text-sm">IELTS</label>
        <input class="mt-1 block w-40 border rounded px-2 py-1" type="number" step="0.5" v-model.number="ielts" />
      </div>
      <div>
        <label class="block text-sm">Ngân sách per year (AUD)</label>
        <input class="mt-1 block w-48 border rounded px-2 py-1" type="number" v-model.number="budget" />
      </div>
      <div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Gợi ý</button>
      </div>
    </form>

    <div class="mt-4">
      <div v-if="loading" class="bg-white p-4 border rounded">Đang tải danh sách trường…</div>
      <div v-else-if="error" class="bg-red-50 p-4 border rounded text-red-700">Lỗi: {{ error }}</div>

      <div v-else-if="results.length" class="bg-white p-4 border rounded">
        <h2 class="text-lg font-semibold">Kết quả gợi ý</h2>
        <ul class="mt-2 space-y-2">
          <li v-for="r in results" :key="r.id" class="p-2 border rounded">
            <div class="font-semibold">{{ r.name }}</div>
            <div class="text-sm text-gray-600" v-if="r.notes">{{ r.notes }}</div>
            <div class="mt-1">
              <a v-if="r.link" :href="r.link" target="_blank" class="text-blue-600">Xem dataset / nguồn</a>
              <span v-else class="text-sm text-gray-500">Không có link nguồn</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="bg-white p-4 border rounded">Không có gợi ý. Nhấn Gợi ý để tìm.</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SchoolPicker',
  setup() {
    const score = ref<number | null>(null)
    const ielts = ref<number | null>(null)
    const budget = ref<number | null>(null)
    const results = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const schools = ref<any[]>([])

    async function loadSchools() {
      loading.value = true
      error.value = null
      try {
        const res = await fetch('/api/schools')
        if (!res.ok) {
          const text = await res.text().catch(() => null)
          throw new Error('Failed to fetch schools: ' + (text || res.status))
        }
        const ct = (res.headers.get('content-type') || '')
        let j: any = null
        if (ct.includes('application/json')) {
          j = await res.json()
        } else {
          const text = await res.text().catch(() => null)
          throw new Error('Expected JSON response from /api/schools but got non-JSON: ' + (String(text).slice(0, 300)))
        }

        // normalized list under data.results
        const items = (j.data?.results || j.data || j.results || [])
        // map to simpler objects
        schools.value = items.map((p: any) => ({ id: p.id, name: p.title || p.name, notes: p.notes, resources: p.resources || [] }))
      } catch (e: any) {
        error.value = e?.message || String(e)
      } finally {
        loading.value = false
      }
    }

    // load on mount
    loadSchools()

    function search() {
      // Simple filter over loaded schools: match budget or ielts in notes
      const qBudget = budget.value ?? 0
      results.value = schools.value
        .map((s: any) => ({ id: s.id, name: s.name, notes: s.notes, link: (s.resources && s.resources[0] && s.resources[0].url) || '' }))
        .filter((s: any) => {
          if (qBudget && s.notes) {
            // try to extract numeric fee from notes (best-effort)
            const m = String(s.notes).match(/\b(\d{4,6})\b/)
            if (m) {
              const fee = Number(m[1])
              if (!Number.isNaN(fee) && fee > qBudget + 5000) return false
            }
          }
          return true
        })
    }

    return { score, ielts, budget, search, results, loading, error }
  }
})
</script>

<style scoped>
.page { padding:1rem }
form label { display:block; margin:0.5rem 0 }
</style>
