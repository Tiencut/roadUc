<template>
  <div class="mb-6">
    <h2 class="text-xl font-bold mb-3">Lộ trình tổng quát</h2>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <button @click="filterPhase = 'all'" :class="filterPhase === 'all' ? 'bg-blue-600 text-white' : 'bg-white'" class="px-3 py-1 border rounded text-sm">Tất cả</button>
        <button @click="filterPhase = 'before'" :class="filterPhase === 'before' ? 'bg-blue-600 text-white' : 'bg-white'" class="px-3 py-1 border rounded text-sm">Trước khi đi</button>
        <button @click="filterPhase = 'during'" :class="filterPhase === 'during' ? 'bg-blue-600 text-white' : 'bg-white'" class="px-3 py-1 border rounded text-sm">Khi đang ở Úc</button>
        <button @click="filterPhase = 'after'" :class="filterPhase === 'after' ? 'bg-blue-600 text-white' : 'bg-white'" class="px-3 py-1 border rounded text-sm">Sau khi về</button>
      </div>
      <div class="flex items-center space-x-2">
        <div class="text-sm text-gray-700">Tiền tệ:</div>
        <button @click="toggleCurrency" class="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50">
          <span v-if="currency === 'VND'">Hiện AUD</span>
          <span v-else>Hiện VND</span>
        </button>
      </div>
    </div>

    <div v-if="adjustedForVisa" class="mb-4 p-3 rounded bg-yellow-50 border border-yellow-200 flex items-center justify-between">
      <div class="text-sm">Lộ trình đã điều chỉnh cho visa: <strong>{{ adjustedForVisa.title || adjustedForVisa.code }}</strong></div>
      <div>
        <button @click="clearAdjustment" class="px-3 py-1 border rounded text-sm text-red-600">Bỏ điều chỉnh</button>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="phase in filteredPhases" :key="phase.id" class="bg-white p-4 border rounded">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center justify-between w-full">
          <div class="font-semibold">{{ phase.title }}</div>
          <div class="text-xs text-right text-gray-700">
            <div v-if="phase.id === 'before'">
              {{ preRange ? (currency === 'AUD' ? formatRange(preRange) : formatRangeVnd(preRange)) : '-' }}
            </div>
            <div v-else-if="phase.id === 'during'">
              {{ duringRange ? (currency === 'AUD' ? formatRange(duringRange) : formatRangeVnd(duringRange)) : '-' }}
            </div>
            <div v-else>
              {{ postRange ? (currency === 'AUD' ? formatRange(postRange) : formatRangeVnd(postRange)) : '-' }}
              <div class="text-xs text-gray-500">{{ livingRange ? (currency === 'AUD' ? formatRange(livingRange) + ' (sinh hoạt)' : formatRangeVnd(livingRange) + ' (sinh hoạt)') : '' }}</div>
            </div>
          </div>
        </div>
        </div>

        <div class="text-xs text-gray-600 mb-3">{{ phase.desc }}</div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-600">
                <th class="py-2">Hạng mục</th>
                <th class="py-2">Mô tả</th>
                <th class="py-2 text-right">Chi phí (AUD)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in phase.steps" :key="s.id" class="border-t">
                <td class="py-2 font-medium align-top">
                  <div class="flex items-center space-x-2">
                    <div>{{ s.title }}</div>
                    <button v-if="s.id === 'study'" @click="openSchoolPicker(s.id)" class="text-sm px-2 py-1 border rounded">Chọn trường (tùy chọn)</button>
                  </div>

                  <div v-if="selectedSchools[s.id]" class="mt-1 text-sm text-gray-600">
                    <div>Đã chọn: <strong>{{ selectedSchools[s.id].name }}</strong></div>
                    <div v-if="selectedSchools[s.id].tuitionFormatted">Học phí: {{ selectedSchools[s.id].tuitionFormatted }}</div>
                    <div v-if="selectedSchools[s.id].link"><a :href="selectedSchools[s.id].link" target="_blank" class="text-blue-600">Nguồn</a></div>
                  </div>

                  <div v-if="s.id === 'study'" class="mt-1 text-xs text-gray-500">Lưu ý: Chọn trường là tùy chọn — Visa 462 không bắt buộc phải học.</div>
                </td>
                <td class="py-2 text-gray-600 align-top">
                  <!-- Mô tả: render structured details when present, otherwise for during/after split into lines -->
                  <template v-if="Array.isArray(s.details) && s.details.length">
                    <StepDetails :details="s.details" :currency="currency" />
                  </template>
                  <div v-else-if="phase.id === 'during' || phase.id === 'after'">
                    <ul class="custom-list ml-4">
                      <li v-for="(line, i) in splitIntoLines(s.desc)" :key="i">{{ line }}</li>
                    </ul>
                  </div>
                  <div v-else>{{ s.desc }}</div>
                </td>
                <td class="py-2 text-right align-top whitespace-nowrap">
                  <div v-if="computeStepRange(s)">
                    <div>{{ currency === 'AUD' ? formatRange(computeStepRange(s)) : formatRangeVnd(computeStepRange(s)) }}</div>
                  </div>
                  <div v-else class="text-gray-500">-</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- School picker modal -->
    <div v-if="showSchoolPicker" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded p-4 w-full max-w-3xl">
        <SchoolPicker :initialBudget="(latestAssessment && latestAssessment.funds) ? latestAssessment.funds : null" :initialIelts="(latestAssessment && latestAssessment.englishScore) ? latestAssessment.englishScore : null" @select="onSchoolSelected" @close="closeSchoolPicker" />
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import StepDetails from './StepDetails.vue'
import SchoolPicker from './SchoolPicker.vue'
import phases from '../data/roadmap.json'
import { useMoney } from '../composables/useMoney'
import { usePlannedVisa } from '../composables/usePlannedVisa'
import { visaOverrides } from '../data/visa-overrides'

export default defineComponent({
  name: 'Roadmap',
  components: { StepDetails, SchoolPicker },
  props: {
    currentStep: { type: Number, required: false, default: 1 }
  },
  setup(props) {
    // read saved estimate from localStorage if available
    const preTotalAud = ref<number | null>(null)
    const duringTotalAud = ref<number | null>(null)
    const postOneTimeAud = ref<number | null>(null)
    const livingTotalAud = ref<number | null>(null)

    // shared money helpers
    const { audToVnd, parseCostStr, formatRange, formatRangeVnd, formatDigits } = useMoney()

    function formatAud(n: number | null | undefined) {
      if (n === null || n === undefined) return '-'
      return `${formatDigits(n)} AUD`
    }

    function formatVndFromAud(n: number | null | undefined) {
      if (n === null || n === undefined) return '-'
      return `${formatDigits(Math.round((n || 0) * audToVnd.value))} VND`
    }

    function splitIntoLines(desc: string | null | undefined) {
      if (!desc) return []
      // Split on commas, semicolons or newlines and trim
      return String(desc).split(/,|;|\n/).map(s => s.trim()).filter(Boolean)
    }

    // Compute the numeric range for a step: sum min/max across details or use costAud
    function computeStepRange(step: any) {
      if (!step) return null
      if (typeof step.costAud === 'number') return { min: step.costAud, max: step.costAud }

      if (Array.isArray(step.details) && step.details.length > 0) {
        let totalMin = 0
        let totalMax = 0
        let sawNumber = false
        for (const d of step.details) {
          const r = parseCostStr(d.cost)
          if (r) {
            sawNumber = true
            totalMin += r.min
            totalMax += r.max
          }
        }
        return sawNumber ? { min: totalMin, max: totalMax } : null
      }

      // fallback: if detailTableHtml exists, try previous extractor behavior
      if (step.detailTableHtml) {
        const parsed = extractCostsFromHtml(step.detailTableHtml)
        if (!parsed) return null
        // parsed may be like "800-1500 / 50-200" or "25"; take first token
        const token = String(parsed).split('/')[0].trim()
        return parseCostStr(token)
      }

      return null
    }

    // Extract costs from old HTML when needed (kept for compatibility)
    function extractCostsFromHtml(html: string | null | undefined) {
      if (!html) return null
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(String(html), 'text/html')
        const rows = Array.from(doc.querySelectorAll('tbody tr'))
        const values: string[] = []
        for (const row of rows) {
          const lastTd = row.querySelector('td:last-child') || row.querySelector('td')
          if (lastTd && lastTd.textContent) values.push(lastTd.textContent.trim())
        }
        if (values.length === 0) {
          const text = doc.body.textContent || ''
          const re = /(\d{1,3}(?:[.,]\d{3})*(?:\s*-\s*\d{1,3}(?:[.,]\d{3})*)?)/g
          const m = (String(text).match(re) || []).map(x => x)
          if (m.length === 0) return null
          values.push(...m)
        }
        // join and normalize
        return values.map(v => v.replace(/\s+/g, ' ').trim()).join(' / ')
      } catch (e) {
        return null
      }
    }

    // Compute phase totals by summing step ranges
    function computePhaseRange(phase: any) {
      if (!phase || !Array.isArray(phase.steps)) return null
      let totalMin = 0
      let totalMax = 0
      let saw = false
      for (const s of phase.steps) {
        const r = computeStepRange(s)
        if (r) {
          saw = true
          totalMin += r.min
          totalMax += r.max
        }
      }
      return saw ? { min: totalMin, max: totalMax } : null
    }

    // Selected schools state (stepId -> school)
    const selectedSchools = ref<Record<string, any>>({})

    const latestAssessment = ref<any>(null)

    // modal & selection state
    const showSchoolPicker = ref(false)
    const selectedStep = ref<string | null>(null)

    // planned visa composable and overrides
    const { plannedVisa, setPlannedVisa, clearPlannedVisa } = usePlannedVisa()
    const adjustedForVisa = ref<any | null>(null)
    // keep a base copy of phases for re-applying overrides cleanly
    const basePhases = JSON.parse(JSON.stringify(phases))

    function openSchoolPicker(stepId: string) {
      selectedStep.value = stepId
      showSchoolPicker.value = true
    }

    function closeSchoolPicker() {
      showSchoolPicker.value = false
      selectedStep.value = null
    }

    function applyOverrides(planned: any) {
      // reset to base
      phasesState.value = JSON.parse(JSON.stringify(basePhases))
      adjustedForVisa.value = null
      if (!planned || !planned.code) {
        // recompute ranges
        const beforePhase = phasesState.value.find((p: any) => p.id === 'before')
        const duringPhase = phasesState.value.find((p: any) => p.id === 'during')
        const afterPhase = phasesState.value.find((p: any) => p.id === 'after')
        preRange.value = computePhaseRange(beforePhase)
        duringRange.value = computePhaseRange(duringPhase)
        postRange.value = computePhaseRange(afterPhase)
        return
      }

      const ov = (visaOverrides as any)[planned.code]
      if (!ov || !ov.phases) {
        // unknown visa = no overrides
        adjustedForVisa.value = planned
        const beforePhase = phasesState.value.find((p: any) => p.id === 'before')
        const duringPhase = phasesState.value.find((p: any) => p.id === 'during')
        const afterPhase = phasesState.value.find((p: any) => p.id === 'after')
        preRange.value = computePhaseRange(beforePhase)
        duringRange.value = computePhaseRange(duringPhase)
        postRange.value = computePhaseRange(afterPhase)
        return
      }

      // apply overrides per-phase
      for (const [phaseId, change] of Object.entries(ov.phases)) {
        const phase = phasesState.value.find((p: any) => p.id === phaseId)
        if (!phase) continue
        // modifySteps: { stepId: { costAud, detailsPatch, remove } }
        if (change.modifySteps) {
          for (const [stepId, patch] of Object.entries(change.modifySteps)) {
            const step = phase.steps.find((s: any) => s.id === stepId)
            if (!step) continue
            if ((patch as any).remove) {
              phase.steps = phase.steps.filter((s: any) => s.id !== stepId)
              continue
            }
            if ((patch as any).costAud !== undefined) step.costAud = (patch as any).costAud
            if ((patch as any).title !== undefined) step.title = (patch as any).title
            if ((patch as any).detailsPatch) {
              // append or merge details by label
              for (const dp of (patch as any).detailsPatch) {
                const idx = step.details ? step.details.findIndex((d: any) => d.label === dp.label) : -1
                if (!step.details) step.details = []
                if (idx >= 0) step.details.splice(idx, 1, dp)
                else step.details.push(dp)
              }
            }
          }
        }
        // TODO: support addSteps/removeSteps if needed in future
      }

      adjustedForVisa.value = planned

      // recompute ranges
      const beforePhase = phasesState.value.find((p: any) => p.id === 'before')
      const duringPhase = phasesState.value.find((p: any) => p.id === 'during')
      const afterPhase = phasesState.value.find((p: any) => p.id === 'after')
      preRange.value = computePhaseRange(beforePhase)
      duringRange.value = computePhaseRange(duringPhase)
      postRange.value = computePhaseRange(afterPhase)
    }

    // watch plannedVisa changes to apply overrides
    ;(function initPlannedWatcher() {
      // load once (usePlannedVisa already loads local)
      applyOverrides(plannedVisa.value)
      // attach a simple polling watcher (reactive watch in composition style)
      // since we are inside setup, use a Mutation-style watch via setInterval or a micro-watch
    })()

    // listen for changes from composable (StorageEvent already handled) - simple interval poll to detect changes
    let pvPrev: string | null = JSON.stringify(plannedVisa.value)
    let pvInterval: number | null = window.setInterval(() => {
      const cur = JSON.stringify(plannedVisa.value)
      if (cur !== pvPrev) {
        pvPrev = cur
        applyOverrides(plannedVisa.value)
      }
    }, 300) as unknown as number

    // cleanup on unmount
    onBeforeUnmount(() => {
      try { if (pvInterval) clearInterval(pvInterval) } catch (e) {}
    })


    function saveSelectedSchoolsToLocal() {
      try { localStorage.setItem('roadmap.selectedSchools', JSON.stringify(selectedSchools.value)) } catch (e) {}
    }

    function onSchoolSelected(payload: any) {
      // attach to the step details
      const stepId = selectedStep.value
      if (!stepId) return
      const phase = phasesState.value.find((p: any) => p.id === 'before')
      // find study step
      const st = phasesState.value.flatMap((p: any) => p.steps).find((x: any) => x.id === stepId)
      if (!st) return

      // add or replace a detail with label 'selectedSchool'
      const existingIdx = st.details.findIndex((d: any) => d.label === 'selectedSchool')
      const schoolDesc = payload.name + (payload.notes ? ' — ' + payload.notes : '')
      const detailObj: any = { label: 'selectedSchool', desc: schoolDesc, cost: (payload.tuition ? String(payload.tuition) : '-') , link: payload.link || '' }
      if (existingIdx >= 0) st.details.splice(existingIdx, 1, detailObj)
      else st.details.push(detailObj)

      // persist selection separately
      selectedSchools.value[stepId] = { name: payload.name, tuition: payload.tuition, tuitionFormatted: payload.tuitionFormatted, link: payload.link }
      saveSelectedSchoolsToLocal()

      // recompute phase totals
      const beforePhase = phasesState.value.find((p: any) => p.id === 'before')
      const duringPhase = phasesState.value.find((p: any) => p.id === 'during')
      const afterPhase = phasesState.value.find((p: any) => p.id === 'after')
      preRange.value = computePhaseRange(beforePhase)
      duringRange.value = computePhaseRange(duringPhase)
      postRange.value = computePhaseRange(afterPhase)

      closeSchoolPicker()
    }

    // sử dụng `formatRange` và `formatRangeVnd` từ `useMoney()` để tránh trùng tên hàm

    const preRange = ref<{ min: number; max: number } | null>(null)
    const duringRange = ref<{ min: number; max: number } | null>(null)
    const postRange = ref<{ min: number; max: number } | null>(null)
    const livingRange = ref<{ min: number; max: number } | null>(null)

    const currency = ref<'VND' | 'AUD'>('VND')
    function toggleCurrency() {
      currency.value = currency.value === 'VND' ? 'AUD' : 'VND'
    }

    // filter phases: 'all' | 'before' | 'during' | 'after'
    // Default to 'before' so the roadmap initially shows 'Trước khi đi' only
    const phasesState = ref<any[]>(JSON.parse(JSON.stringify(phases)))
    const filterPhase = ref<'all' | 'before' | 'during' | 'after'>('before')
    const filteredPhases = computed(() => {
      if (filterPhase.value === 'all') return phasesState.value
      return phasesState.value.filter((p: any) => p.id === filterPhase.value)
    })

    onMounted(() => {
      try {
        const raw = localStorage.getItem('latest_estimate')
        if (!raw) return
        const s = JSON.parse(raw)
        // load rate if present
        if (s.audToVnd && typeof s.audToVnd === 'number') audToVnd.value = s.audToVnd

        // compute phase totals from saved fields if present
        const pre = (s.applicationSubmission || 0) + (s.englishTest || 0) + (s.translationCert || 0) + (s.policeCheck || 0) + (s.healthCheck || 0) + (s.documentCert || 0) + (s.agentFee || 0)
        const during = (s.flight || 0) + (s.insurance || 0) + (s.initialAccommodationDeposit || 0) + (s.firstMonthRent || 0) + (s.simAndSetup || 0) + (s.groceriesFirstWeeks || 0)
        const postOne = (s.settlingFurniture || 0) + (s.registrationFees || 0)
        const livingPer = (s.livingPerMonth || 0)
        const months = (s.months || 0)

        preTotalAud.value = pre || null
        duringTotalAud.value = during || null
        postOneTimeAud.value = postOne || null
        livingTotalAud.value = (livingPer && months) ? Math.round(livingPer * months) : null

        // compute ranges from structured details
        const beforePhase = phasesState.value.find((p: any) => p.id === 'before')
        const duringPhase = phasesState.value.find((p: any) => p.id === 'during')
        const afterPhase = phasesState.value.find((p: any) => p.id === 'after')
        preRange.value = computePhaseRange(beforePhase)
        duringRange.value = computePhaseRange(duringPhase)
        postRange.value = computePhaseRange(afterPhase)
        livingRange.value = livingTotalAud.value ? { min: livingTotalAud.value, max: livingTotalAud.value } : null

        // load selected schools from localStorage
        try {
          const selRaw = localStorage.getItem('roadmap.selectedSchools')
          if (selRaw) selectedSchools.value = JSON.parse(selRaw)
        } catch (e) {}

        // load latest assessment to prefill school picker
        try {
          const assRaw = localStorage.getItem('latest_assessment')
          if (assRaw) {
            const a = JSON.parse(assRaw)
            latestAssessment.value = a
          }
        } catch (e) {}

        // apply overrides for any already selected planned visa
        applyOverrides(plannedVisa.value)
      } catch (e) {
        // ignore parse errors
      }
    })

    // cleanup for pvInterval
    ;(function teardownOnUnmount() {
      try {
        // attempt to clear interval when component unmounts
        const oldClear = (globalThis as any).__roadmap_pv_interval_clear
        if (!oldClear) {
          ;(globalThis as any).__roadmap_pv_interval_clear = true
          // clear stored interval list if exists
        }
      } catch (e) {}
    })()
    // `phases` đã được tách ra thành file JSON: fe/src/data/roadmap.json
    // import phases from that file above (so we keep component logic clean)

    function clearAdjustment() { clearPlannedVisa(); applyOverrides(null) }

    return { phases: phasesState, currentStep: props.currentStep, preTotalAud, duringTotalAud, postOneTimeAud, livingTotalAud, preRange, duringRange, postRange, livingRange, formatAud, formatVndFromAud, formatDigits, splitIntoLines, extractCostsFromHtml, parseCostStr, computeStepRange, computePhaseRange, formatRange, formatRangeVnd, currency, toggleCurrency, filterPhase, filteredPhases, showSchoolPicker, openSchoolPicker, closeSchoolPicker, onSchoolSelected, selectedSchools, latestAssessment, selectedStep, adjustedForVisa, clearAdjustment }
  }
})
</script>

<style scoped>
/* keep the roadmap simple; layout uses Tailwind utilities */

/* Custom list: use '*' as marker and show divider lines */
.custom-list {
  list-style: none;
  padding-left: 0;
}
.custom-list li {
  padding: 0.25rem 0 0.25rem 0.75rem;
  border-bottom: 1px solid #e5e7eb; /* Tailwind gray-200 */
}
.custom-list li:last-child {
  border-bottom: none;
}
</style>
