<template>
  <div>
    <transition enter-active-class="transition transform ease-out duration-200" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition transform ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="toastVisible" class="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow z-50">{{ toastMessage }}</div>
    </transition>
    <section class="mt-8 bg-white p-4 rounded-lg border">
    <h2 class="text-lg font-semibold mb-3">Bảng tóm tắt các loại visa phổ biến</h2>

    <div class="overflow-x-auto">
      <div class="flex flex-col md:flex-row gap-2 mb-3 items-center">
        <input v-model="searchQuery" placeholder="Tìm theo tên, mã, mục đích, đối tượng..." class="flex-1 border rounded px-2 py-1" />
        <select v-model="filterPurpose" class="border rounded px-2 py-1">
          <option value="">-- Lọc theo mục đích (Tất cả) --</option>
          <option v-for="(p, idx) in purposes" :key="idx" :value="p">{{ p }}</option>
        </select>
      </div>

      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 border">Loại visa</th>
            <th class="p-2 border">Mã subclass</th>
            <th class="p-2 border">Mục đích chính</th>
            <th class="p-2 border">Thời hạn lưu trú</th>
            <th class="p-2 border">Đối tượng phổ biến</th>
            <th class="p-2 border">Lợi nhuận ước tính / lần đi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredVisas.length === 0">
            <td colspan="6" class="p-3 text-center text-sm text-gray-600">Không có kết quả khớp.</td>
          </tr>
          <tr v-for="(v, i) in filteredVisas" :key="i" class="border-b hover:bg-gray-50 cursor-pointer" @click="openDetails(v)" tabindex="0" @keydown.enter.prevent="openDetails(v)">
            <td class="p-2">
              <div class="flex items-center gap-2">
                <span>{{ v.type }}</span>
                <span v-if="plannedVisa && plannedVisa.code === v.code" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Đang chọn</span>
                <button v-if="plannedVisa && plannedVisa.code === v.code" @click.stop="clearPlannedRow(v)" class="text-xs ml-1 text-red-600 hover:underline">Bỏ chọn</button>
              </div>
            </td>
            <td class="p-2">{{ v.code }}</td>
            <td class="p-2">{{ v.purpose }}</td>
            <td class="p-2">{{ v.duration }}</td>
            <td class="p-2">
              <div class="flex items-center">
                <span>{{ v.audience }}</span>
              </div>
            </td>
            <td class="p-2">
              <div class="text-sm">
                <div>{{ formatProfit(v).aud }}</div>
                <div class="text-xs text-gray-500">{{ formatProfit(v).vnd }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </section>

    <!-- Khi user chọn 1 visa: chuyển sang layout 2 cột -->
    <div v-if="selected" class="mt-6 flex gap-4">
      <aside class="w-72 bg-white p-4 rounded border">
        <h3 class="font-semibold mb-2">Danh sách visa</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="(v, idx) in visaRows" :key="idx" @click="openDetails(v)" class="p-2 rounded cursor-pointer" :class="v.code === selected.code ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'">
            <div class="flex items-center justify-between">
              <div class="font-medium">{{ v.type }}</div>
              <div v-if="plannedVisa && plannedVisa.code === v.code" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Đang chọn</div>
            </div>
            <div class="text-xs text-gray-500">{{ v.code }}</div>
          </li>
        </ul>
        <div class="mt-4 flex gap-2">
          <button @click="closeDetails" class="px-3 py-1 border rounded text-sm">Đóng</button>
          <button v-if="plannedVisa && plannedVisa.code === selected.code" @click="clearPlannedRow(selected)" class="px-3 py-1 text-sm text-red-600">Bỏ chọn</button>
        </div>
      </aside>

      <main class="flex-1 bg-white p-4 rounded border">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="font-semibold text-lg">{{ selected.def.title }}</h2>
            <div class="text-xs text-gray-600">{{ selected.def.desc }}</div>
            <div v-if="plannedVisa && plannedVisa.code === selected.code" class="text-xs text-gray-500 mt-1">Đã chọn: {{ plannedVisa.savedAt ? (new Date(plannedVisa.savedAt)).toLocaleString() : '—' }}</div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="selectAsPlan" class="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Chọn làm dự định</button>
            <button @click="closeDetails" class="px-3 py-1 border rounded text-sm">Đóng</button>
          </div>
        </div>

        <div class="mt-4">
          <Assessment :initialVisaType="selected.def.key" />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import Assessment from '../pages/Assessment.vue'
import { visaRows, visaDefinitions, visaEarningsMonthly, visaTripCost, audToVndDefault } from '../data/visas'
import { usePlannedVisa } from '../composables/usePlannedVisa'

export default defineComponent({
  name: 'VisaTable',
  components: { Assessment },
  setup() {
    // --- Profit estimation heuristics ---
    const audToVnd = ref<number>(audToVndDefault)
    try {
      const raw = localStorage.getItem('aud_to_vnd')
      if (raw) {
        const n = parseInt(raw, 10)
        if (!Number.isNaN(n)) audToVnd.value = n
      }
    } catch (e) {}

    function parseDurationMonths(duration: string) {
      if (!duration) return 1
      // try to find a number range like '3-12' or '1 year' -> convert heuristically
      const m = String(duration).match(/(\d+)\s*-\s*(\d+)/)
      if (m) return parseInt(m[2], 10)
      const single = String(duration).match(/(\d+)\s*(tháng|month|years|year|năm)/i)
      if (single) {
        const n = parseInt(single[1], 10)
        // if 'year' or 'năm' treat as 12*n
        if (/year|năm/i.test(single[2])) return n * 12
        return n
      }
      // common heuristics
      if (/1 year|1 năm|1 năm/i.test(duration)) return 12
      if (/1 năm/i.test(duration)) return 12
      if (/1 year/i.test(duration)) return 12
      if (/1 month|3 month|6 month|12 month|18 month/i.test(duration)) {
        const num = (duration.match(/(\d+)/) || [null, 1])[1]
        return parseInt(String(num), 10) || 1
      }
      // fallback: 1 month
      return 1
    }

    function formatDigits(n: number) {
      return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    function formatProfitFor(v: any) {
      const months = parseDurationMonths(v.duration || '')
      const monthly = visaEarningsMonthly[v.code] ?? 0
      const tripCost = visaTripCost[v.code] ?? 0
      const totalIncome = monthly * months
      const profit = totalIncome - tripCost
      return { aud: profit, vnd: Math.round(profit * audToVnd.value) }
    }

    function formatProfit(v: any) {
      const r = formatProfitFor(v)
      if (isNaN(r.aud)) return { aud: '-', vnd: '' }
      const sign = r.aud >= 0 ? '' : '-'
      const absAud = Math.abs(r.aud)
      return { aud: `${sign}${formatDigits(absAud)} AUD`, vnd: `${sign}${formatDigits(Math.abs(r.vnd))} VND` }
    }
    // visa definitions moved to ../data/visas.ts (imported above)

    const selected = ref<any | null>(null)
    const auth = useAuth()
    const latestAssessment = ref<any | null>(null)
    const { plannedVisa: sharedPlannedVisa, setPlannedVisa, clearPlannedVisa } = usePlannedVisa()
    const plannedVisa = sharedPlannedVisa
    const toastMessage = ref<string | null>(null)
    const toastVisible = ref(false)
    let toastTimer: number | null = null
    const sessionId = ref<string | null>(null)

    function ensureSession() {
      try {
        let s = localStorage.getItem('session_id')
        if (!s) {
          s = 's_' + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36)
          localStorage.setItem('session_id', s)
        }
        sessionId.value = s
      } catch (e) {
        sessionId.value = 'global'
      }
    }

    function showToast(msg: string, ms = 4000) {
      toastMessage.value = msg
      toastVisible.value = true
      if (toastTimer) { clearTimeout(toastTimer); toastTimer = null }
      toastTimer = window.setTimeout(() => {
        toastVisible.value = false
        toastMessage.value = null
        toastTimer = null
      }, ms) as unknown as number
    }

    function loadLatest() {
      try {
        const raw = localStorage.getItem('latest_assessment')
        if (raw) latestAssessment.value = JSON.parse(raw)
        else latestAssessment.value = null
      } catch (e) { latestAssessment.value = null }
    }

    async function loadPlanned() {
      // try server first (session-aware), fall back to localStorage
      try {
        if (!sessionId.value) ensureSession()
        const hdrs: any = {}
        if (sessionId.value) hdrs['x-session-id'] = sessionId.value
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/planned-visa', { headers: hdrs })
        if (resp.ok) {
          const j = await resp.json().catch(() => null)
          if (j && j.ok && j.data) {
            plannedVisa.value = j.data
            try { localStorage.setItem('planned_visa', JSON.stringify(j.data)) } catch (e) {}
            return
          }
        }
      } catch (e) {
        // ignore and fallback
      }

      try {
        const raw = localStorage.getItem('planned_visa')
        if (raw) plannedVisa.value = JSON.parse(raw)
        else plannedVisa.value = null
      } catch (e) { plannedVisa.value = null }
    }

    loadLatest()
    ensureSession()
    loadPlanned()

    function openDetails(row: any) {
      // attach definition if available
      const def = visaDefinitions[row.code] || { title: row.type, desc: '', requirements: [] }
      selected.value = { ...row, def }
      // ensure latest is fresh
      loadLatest()
      // load planned selection
      loadPlanned()
    }

    function closeDetails() { selected.value = null }

    function eduRankLocal(e: string) {
      if (e === 'master') return 3
      if (e === 'bachelor') return 2
      return 1
    }

    function evalReq(req: any) {
      const a = latestAssessment.value
      if (!a) return null
      switch (req.type) {
        case 'funds': return (a.funds ?? 0) >= req.value
        case 'ielts': return (a.ielts ?? 0) >= req.value
        case 'experience': return (a.experience ?? 0) >= req.value
        case 'education': return eduRankLocal(a.education) >= req.value
        case 'age_le': return (a.age ?? 999) <= req.value
        default: return null
      }
    }
    
    async function selectAsPlan() {
      if (!selected.value) return
      const code = selected.value.code
      // toggle: if already planned, clear
      if (plannedVisa.value && plannedVisa.value.code === code) {
        try {
          // clear both local and shared planned visa
          await clearPlannedVisa()
          plannedVisa.value = null
          showToast('Đã bỏ chọn dự định')
        } catch (e: any) {
          showToast('Bỏ chọn thất bại: ' + String(e))
        }
        return
      }

      const toSave = { code, type: selected.value.type, title: selected.value.def?.title }
      try {
        // send to server with session header or user id when logged in
        const hdrs: any = { 'content-type': 'application/json' }
        if (!sessionId.value) ensureSession()
        if (sessionId.value) hdrs['x-session-id'] = sessionId.value
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/planned-visa', { method: 'POST', headers: hdrs, body: JSON.stringify(toSave) })
        if (resp.ok) {
          const j = await resp.json().catch(() => null)
          if (j && j.ok && j.data) {
            plannedVisa.value = j.data
            try { localStorage.setItem('planned_visa', JSON.stringify(j.data)) } catch (e) {}
            try { await setPlannedVisa(j.data) } catch (e) {}
          } else {
            plannedVisa.value = toSave
            try { localStorage.setItem('planned_visa', JSON.stringify(toSave)) } catch (e) {}
            try { await setPlannedVisa(toSave) } catch (e) {}
          }
        } else {
          // fallback to local save
          plannedVisa.value = toSave
          try { localStorage.setItem('planned_visa', JSON.stringify(toSave)) } catch (e) {}
          try { await setPlannedVisa(toSave) } catch (e) {}
        }
        showToast('Đã chọn ' + (toSave.title || toSave.code) + ' làm dự định')
      } catch (e: any) {
        showToast('Không thể lưu lựa chọn: ' + String(e))
      }
    }

    async function clearPlannedRow(row: any) {
      try {
        if (!sessionId.value) ensureSession()
        const hdrs: any = {}
        if (sessionId.value) hdrs['x-session-id'] = sessionId.value
        try { if (auth.user.value) hdrs['authorization'] = 'Bearer ' + auth.user.value.token } catch (e) {}
        const resp = await fetch('/api/planned-visa', { method: 'DELETE', headers: hdrs })
        if (resp.ok) {
          plannedVisa.value = null
          try { localStorage.removeItem('planned_visa') } catch (e) {}
          showToast('Đã bỏ chọn dự định')
        } else {
          showToast('Bỏ chọn thất bại')
        }
      } catch (e) {
        showToast('Bỏ chọn thất bại')
      }
    }
    // visaRows moved to ../data/visas.ts (imported above)

    const searchQuery = ref('')
    const filterPurpose = ref('')

    const purposes = computed(() => Array.from(new Set(visaRows.map(v => v.purpose))))

    const filteredVisas = computed(() => {
      const q = (searchQuery.value || '').toLowerCase().trim()
      return visaRows.filter(v => {
        if (filterPurpose.value && v.purpose !== filterPurpose.value) return false
        if (!q) return true
        return [v.type, v.code, v.purpose, v.duration, v.audience].some(field => (field || '').toLowerCase().includes(q))
      })
    })

    return { searchQuery, filterPurpose, purposes, filteredVisas, selected, openDetails, closeDetails, latestAssessment, evalReq, plannedVisa, selectAsPlan, toastMessage, toastVisible, clearPlannedRow, sessionId, visaRows, formatProfit, formatProfitFor, audToVnd, parseDurationMonths }
  }
})
</script>

<style scoped>
/* tiny local styles if needed */
</style>

<!-- modal moved into main template -->
