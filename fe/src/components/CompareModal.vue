<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-60 flex items-start justify-center p-6">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>
      <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-auto p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">So sánh công việc</h3>
          <button @click="$emit('close')" class="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div v-if="jobs.length === 0" class="text-sm text-gray-600">Chưa có công việc nào trong danh sách so sánh.</div>

        <div v-else>
          <ul class="space-y-2 mb-4">
            <li v-for="(j, i) in jobs" :key="i" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div class="font-medium">{{ j.jobType }}</div>
              <div class="flex items-center gap-2">
                <button @click="removeJobAt(i)" class="px-3 py-1 rounded-xl bg-red-50 text-red-700 border">Xóa</button>
              </div>
            </li>
          </ul>

          <!-- Comparison table -->
          <div v-if="jobs.length > 1" class="overflow-auto border rounded-lg">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="p-3 text-left font-medium">Trường</th>
                  <th v-for="(j, idx) in jobs" :key="idx" class="p-3 text-left font-medium">{{ j.jobType }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in fields" :key="f.key" class="border-t">
                  <td class="p-3 font-medium w-48">{{ f.label }}</td>
                  <td v-for="(j, idx) in jobs" :key="idx" class="p-3 align-top" :class="(!differences[f.key].same && String(j[f.key] || '') !== String(differences[f.key].mode)) ? 'bg-yellow-50' : ''">
                    <div class="whitespace-pre-line">{{ j[f.key] || '-' }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Single job detail fallback -->
          <div v-else class="text-sm text-gray-700">
            <div class="font-medium">Chi tiết</div>
            <div class="mt-2">{{ jobs[0] }}</div>
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button @click="clearAll" class="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100">Xóa tất cả</button>
          <button @click="$emit('close')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white">Đóng</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, watchEffect, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'changed'])

const jobs = ref<any[]>([])

function loadJobs() {
  try {
    jobs.value = JSON.parse(localStorage.getItem('rtu_compare_jobs') || '[]') || []
  } catch (e) { jobs.value = [] }
}

watchEffect(() => {
  if (props.visible) loadJobs()
})

function clearAll() {
  localStorage.removeItem('rtu_compare_jobs')
  loadJobs()
  emit('changed')
}

function removeJobAt(i: number) {
  const arr = JSON.parse(localStorage.getItem('rtu_compare_jobs') || '[]') || []
  arr.splice(i, 1)
  localStorage.setItem('rtu_compare_jobs', JSON.stringify(arr))
  loadJobs()
  if (!jobs.value.length) emit('close')
  emit('changed')
}

function getMode(arr: any[]) {
  const map = new Map<any, number>()
  for (const v of arr) map.set(v, (map.get(v) || 0) + 1)
  let mode = null as any
  let max = 0
  for (const [k, c] of map) {
    if (c > max) { max = c; mode = k }
  }
  return mode
}

const fields = computed(() => [
  { key: 'canExtend', label: 'Gia hạn visa' },
  { key: 'region', label: 'Khu vực phổ biến' },
  { key: 'pay', label: 'Lương/giờ' },
  { key: 'requirement', label: 'Yêu cầu cơ bản' },
  { key: 'howTo', label: 'Cách tìm việc' }
])

const differences = computed(() => {
  // returns map of key -> { mode, same }
  const out: Record<string, { mode: any; same: boolean }> = {}
  const j = jobs.value || []
  for (const f of fields.value) {
    const vals = j.map(x => (x && x[f.key] !== undefined) ? String(x[f.key]) : '')
    const mode = getMode(vals)
    const same = vals.every(v => v === vals[0])
    out[f.key] = { mode, same }
  }
  return out
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
