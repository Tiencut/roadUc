<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <div class="text-sm font-medium">Tìm trường</div>
      <button class="text-sm text-gray-600" @click="$emit('close')">Đóng</button>
    </div>

    <form @submit.prevent="search" class="space-y-3">
      <div class="flex space-x-2">
        <div>
          <label class="block text-sm">IELTS/PTE</label>
          <input class="mt-1 block w-32 border rounded px-2 py-1" type="number" step="0.5" v-model.number="ieltsLocal" />
        </div>
        <div>
          <label class="block text-sm">Ngân sách (AUD/năm)</label>
          <input class="mt-1 block w-40 border rounded px-2 py-1" type="number" v-model.number="budgetLocal" />
        </div>
        <div class="flex items-end">
          <button class="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Tìm</button>
        </div>
      </div>
    </form>

    <div class="mt-3">
      <div v-if="loading" class="text-sm text-gray-600">Đang tải danh sách trường…</div>
      <div v-else-if="error" class="text-sm text-red-600">Lỗi: {{ error }}</div>

      <div v-else>
        <ul class="space-y-2">
          <li v-for="r in results" :key="r.id" class="p-2 border rounded flex items-start justify-between">
            <div>
              <div class="font-semibold">{{ r.name }}</div>
              <div class="text-xs text-gray-600" v-if="r.notes">{{ r.notes }}</div>
              <div class="text-xs text-gray-500">{{ r.link || 'Không có nguồn' }}</div>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <div v-if="r.tuitionFormatted" class="text-sm">{{ r.tuitionFormatted }}</div>
              <button class="bg-green-600 text-white px-3 py-1 rounded text-sm" @click="select(r)">Chọn</button>
            </div>
          </li>
        </ul>
        <div v-if="!results.length" class="text-sm text-gray-500">Không tìm thấy trường phù hợp.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'SchoolPicker',
  props: {
    initialBudget: { type: Number, required: false, default: null },
    initialIelts: { type: Number, required: false, default: null }
  },
  setup(props, { emit }) {
    const ieltsLocal = ref<number | null>(props.initialIelts ?? null)
    const budgetLocal = ref<number | null>(props.initialBudget ?? null)
    const results = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function loadSchools() {
      loading.value = true
      error.value = null
      try {
        const res = await fetch('/api/schools')
        if (!res.ok) throw new Error('Không thể tải danh sách trường')
        const j = await res.json()
        const items = j.data?.results || j.data || j.results || []
        results.value = items.map((p: any) => ({
          id: p.id,
          name: p.title || p.name,
          notes: p.notes,
          link: (p.resources && p.resources[0] && p.resources[0].url) || '',
          raw: p
        }))
        // attach best-effort tuition parse
        for (const r of results.value) {
          const m = String(r.notes || '').match(/(\d{1,3}(?:,?\d{3})*)(?:\s*-\s*(\d{1,3}(?:,?\d{3})*))?/) // find number or range
          if (m) {
            const min = m[1].replace(/,/g, '')
            const max = (m[2] || m[1]).replace(/,/g, '')
            r.tuition = min === max ? Number(min) : `${min}-${max}`
            r.tuitionFormatted = Number.isFinite(Number(min)) && Number.isFinite(Number(max)) ? `${min}-${max} AUD` : r.tuition
          }
        }
      } catch (e: any) {
        error.value = e?.message || String(e)
      } finally {
        loading.value = false
      }
    }

    function search() {
      // simple filter
      const budget = budgetLocal.value || 0
      const ielts = ieltsLocal.value || 0
      results.value = results.value.filter((s: any) => {
        if (budget && s.tuition) {
          // if numeric tuition and greater than budget*1 year, filter
          const m = String(s.tuition).match(/(\d+)(?:-(\d+))?/) || []
          const v = Number(m[1] || 0)
          if (v && v > budget + 5000) return false
        }
        // TODO: use ielts in matching if data available
        return true
      })
    }

    function select(r: any) {
      // emit a compact payload
      emit('select', { id: r.id, name: r.name, link: r.link, notes: r.notes, tuition: r.tuition || null, tuitionFormatted: r.tuitionFormatted || null })
    }

    onMounted(() => loadSchools())

    return { ieltsLocal, budgetLocal, results, loading, error, search, select }
  }
})
</script>

<style scoped>
</style>