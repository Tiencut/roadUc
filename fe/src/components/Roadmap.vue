<template>
  <div class="mb-6">
    <h2 class="text-xl font-bold mb-3">Lộ trình tổng quát</h2>

    <div class="flex items-center justify-between mb-4">
      <div></div>
      <div class="flex items-center space-x-2">
        <div class="text-sm text-gray-700">Tiền tệ:</div>
        <button @click="toggleCurrency" class="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50">
          <span v-if="currency === 'VND'">Hiện AUD</span>
          <span v-else>Hiện VND</span>
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="phase in phases" :key="phase.id" class="bg-white p-4 border rounded">
        <div class="flex items-center justify-between mb-2">
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
                  <!-- Hạng mục: always show the step title -->
                  {{ s.title }}
                </td>
                <td class="py-2 text-gray-600 align-top">
                  <!-- Mô tả: render structured details when present, otherwise for during/after split into lines -->
                  <div v-if="Array.isArray(s.details) && s.details.length">
                    <table class="min-w-full text-sm border-collapse">
                      <thead>
                        <tr class="text-left text-xs text-gray-600">
                          <th class="py-1">Mục</th>
                          <th class="py-1">Chi tiết</th>
                          <th class="py-1 text-right">Chi phí (AUD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(d, idx) in s.details" :key="idx" class="border-t">
                          <td class="py-1">{{ d.label || '-' }}</td>
                          <td class="py-1">{{ d.desc || '-' }}</td>
                          <td class="py-1 text-right">
                            <span v-if="parseCostStr(d.cost)">
                              {{ currency === 'AUD' ? formatRange(parseCostStr(d.cost)) : formatRangeVnd(parseCostStr(d.cost)) }}
                            </span>
                            <span v-else class="text-gray-500">{{ d.cost || '-' }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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

      <div class="bg-white p-4 border rounded shadow-sm">
        <div class="text-sm text-gray-600">(Cost estimator removed — content displayed above)</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'Roadmap',
  props: {
    currentStep: { type: Number, required: false, default: 1 }
  },
  setup(props) {
    // read saved estimate from localStorage if available
    const preTotalAud = ref<number | null>(null)
    const duringTotalAud = ref<number | null>(null)
    const postOneTimeAud = ref<number | null>(null)
    const livingTotalAud = ref<number | null>(null)
    const audToVnd = ref<number>(16000)

    function formatDigits(n: number | null | undefined) {
      if (n === null || n === undefined || Number.isNaN(n)) return '-'
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

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

    // New structured parsing: cost strings like "800 - 1,500" or "50" -> { min, max }
    function parseCostStr(costStr: string | null | undefined) {
      if (!costStr) return null
      let s = String(costStr).replace(/\u00A0/g, ' ').trim()
      s = s.replace(/AUD|VND|AUD\:|VND\:/gi, '')
      // remove any non-digit, non-separators except - , .
      s = s.replace(/[^0-9\-,.\s]/g, '')
      // remove commas used as thousand separators
      s = s.replace(/,/g, '')
      // remove dots used as thousand separators (e.g. 1.500)
      s = s.replace(/(\d)\.(?=\d{3}(?:\D|$))/g, '$1')
      s = s.replace(/\s+/g, ' ')

      // handle ranges: look for first hyphen
      const rangeMatch = s.match(/(\d+)\s*-\s*(\d+)/)
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1], 10)
        const max = parseInt(rangeMatch[2], 10)
        if (!Number.isNaN(min) && !Number.isNaN(max)) return { min, max }
      }

      // otherwise try to get a single number
      const numMatch = s.match(/(\d+)/)
      if (numMatch) {
        const v = parseInt(numMatch[1], 10)
        if (!Number.isNaN(v)) return { min: v, max: v }
      }
      return null
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

    function formatRange(r: { min: number; max: number } | null) {
      if (!r) return '-'
      if (r.min === r.max) return `${formatDigits(r.min)} AUD`
      return `${formatDigits(r.min)} - ${formatDigits(r.max)} AUD`
    }

    function formatRangeVnd(r: { min: number; max: number } | null) {
      if (!r) return ''
      if (r.min === r.max) return `${formatDigits(Math.round(r.min * audToVnd.value))} VND`
      return `${formatDigits(Math.round(r.min * audToVnd.value))} - ${formatDigits(Math.round(r.max * audToVnd.value))} VND`
    }

    const preRange = ref<{ min: number; max: number } | null>(null)
    const duringRange = ref<{ min: number; max: number } | null>(null)
    const postRange = ref<{ min: number; max: number } | null>(null)
    const livingRange = ref<{ min: number; max: number } | null>(null)

    const currency = ref<'VND' | 'AUD'>('VND')
    function toggleCurrency() {
      currency.value = currency.value === 'VND' ? 'AUD' : 'VND'
    }

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
        const beforePhase = phases.find((p: any) => p.id === 'before')
        const duringPhase = phases.find((p: any) => p.id === 'during')
        const afterPhase = phases.find((p: any) => p.id === 'after')
        preRange.value = computePhaseRange(beforePhase)
        duringRange.value = computePhaseRange(duringPhase)
        postRange.value = computePhaseRange(afterPhase)
        livingRange.value = livingTotalAud.value ? { min: livingTotalAud.value, max: livingTotalAud.value } : null
      } catch (e) {
        // ignore parse errors
      }
    })
    // phases with detailed steps and important notes (user-provided content)
    const phases = [
      {
        id: 'before',
        title: 'Trước khi đi Úc',
        desc: 'Các bước chính trước khi xuất cảnh',
        note: 'Độ tuổi 18-30, phí visa 650 AUD. Chuẩn bị 10-12 tháng.',
        steps: [
          { id: 'ballot', index: 1, title: 'Nộp Ballot & hồ sơ', desc: 'Nộp Ballot (25 AUD), chờ lời mời rồi nộp hồ sơ đầy đủ (hộ chiếu, chứng minh tài chính ≥5,000 AUD, tiếng Anh B1+, sức khỏe, lý lịch tư pháp).', costAud: 25, details: [
            { label: '1', desc: 'Nộp Ballot đăng ký tham gia xổ số visa 462 qua hệ thống ImmiAccount. Phí không hoàn lại, thanh toán bằng thẻ Visa/MasterCard (có thể thêm phụ phí 0.25-0.35 AUD).', cost: '25' },
            { label: '2', desc: 'Chờ kết quả bốc thăm (thông báo qua email nếu trúng). Thời gian mở Ballot 2025-2026 thường từ tháng 6-7.', cost: '0' },
            { label: '3', desc: 'Nộp hồ sơ đầy đủ: Hộ chiếu, chứng minh tài chính ≥5,000 AUD, chứng chỉ tiếng Anh (PTE 24+ tương đương B1+), giấy khám sức khỏe, lý lịch tư pháp.', cost: '650-670' },
            { label: '4', desc: 'Khám sức khỏe và kiểm tra lý lịch (nếu yêu cầu bổ sung).', cost: '300-500' }
          ] },
          { id: 'travel', index: 2, title: 'Chuẩn bị đi lại & hồ sơ', desc: 'Mua vé máy bay khứ hồi, bảo hiểm du lịch, chuẩn bị CV tiếng Anh.', costAud: undefined, details: [
            { label: 'Vé máy bay khứ hồi', desc: 'Tùy mùa, hãng, điểm khởi hành', cost: '800-1500' },
            { label: 'Bảo hiểm du lịch', desc: 'Bảo hiểm cho thời gian đầu (6-12 tháng)', cost: '50-200' },
            { label: 'Chuẩn bị CV tiếng Anh', desc: 'Dịch/viết lại CV, chỉnh ngắn gọn theo tiêu chuẩn Úc', cost: '0-50' }
          ] },
          { id: 'study', index: 3, title: 'Học & tích lũy kinh nghiệm', desc: 'Học tiếng Anh/PTE nếu cần, tích lũy kinh nghiệm nghề (nông nghiệp, dịch vụ).', costAud: undefined, details: [] }
        ]
      },
      {
        id: 'during',
        title: 'Khi đang ở Úc',
        desc: 'Các bước chính khi đã có mặt ở Úc',
        note: 'Ở hostel đầu tiên, kết nối cộng đồng backpacker. Thu nhập hỗ trợ chi phí.',
        steps: [
          { id: 'setup', index: 4, title: 'Thiết lập đời sống', desc: 'Mua SIM, mở tài khoản ngân hàng, xin TFN (mã thuế), ABN nếu tự doanh.', costAud: undefined, details: [
            { label: 'SIM & dữ liệu', desc: 'Mua SIM, nạp data ban đầu', cost: '10-30' },
            { label: 'Mở tài khoản ngân hàng', desc: 'Phần lớn miễn phí, một số phí nhỏ', cost: '0-10' },
            { label: 'TFN', desc: 'Xin mã thuế (TFN) online', cost: '0' }
          ] },
          { id: 'work', index: 5, title: 'Tìm việc & làm việc', desc: 'Tìm việc qua Seek/Indeed/Gumtree (farm, khách sạn, ≤6 tháng/nhà tuyển dụng).', costAud: undefined, details: [
            { label: 'Tìm việc (ứng tuyển)', desc: 'Chuẩn bị, in ấn CV, di chuyển phỏng vấn', cost: '0-50' },
            { label: 'Chi phí trung chuyển', desc: 'Phương tiện đi lại ban đầu', cost: '0-50' }
          ] },
          { id: 'training', index: 6, title: 'Du lịch & học ngắn hạn', desc: 'Du lịch, học ≤4 tháng (RSA/FoodSafety), làm việc regional để gia hạn visa năm 2/3.', costAud: undefined, details: [
            { label: 'Khóa RSA/FoodSafety', desc: 'Giấy chứng nhận an toàn thực phẩm / phục vụ rượu', cost: '50-200' },
            { label: 'Du lịch nội địa', desc: 'Chi phí đi lại giữa các vùng để làm việc', cost: '100-400' }
          ] }
        ]
      },
      {
        id: 'after',
        title: 'Sau khi về',
        desc: 'Các bước thực hiện sau khi kết thúc hành trình',
        note: '',
        steps: [
          { id: 'super', index: 7, title: 'Rút Superannuation', desc: 'Rút Superannuation (quỹ hưu trí).', costAud: undefined, details: [
            { label: 'Phí xử lý', desc: 'Phí ngân hàng hoặc dịch vụ làm thủ tục', cost: '0-50' },
            { label: 'Thuế/khấu trừ', desc: 'Có thể có thay đổi tùy trường hợp', cost: '0-200' }
          ] },
          { id: 'cv', index: 8, title: 'Cập nhật CV & tận dụng kinh nghiệm', desc: 'Cập nhật CV với kinh nghiệm Úc, dùng để xin việc Việt Nam hoặc visa khác (482/491).', costAud: undefined, details: [
            { label: 'Dịch vụ CV/LinkedIn', desc: 'Tùy chọn có thể trả phí để chỉnh CV chuyên nghiệp', cost: '0-50' },
            { label: 'Chi phí hồ sơ', desc: 'In ấn, scan, dịch thuật khi cần', cost: '0-50' }
          ] },
          { id: 'evaluate', index: 9, title: 'Đánh giá hướng đi', desc: 'Đánh giá tài chính, kỹ năng để quyết định quay lại hoặc định cư.', costAud: undefined, details: [
            { label: 'Tư vấn', desc: 'Tư vấn nghề nghiệp hoặc visa', cost: '0-100' },
            { label: 'Chi phí khác', desc: 'Chi phí phát sinh', cost: '0-100' }
          ] }
        ]
      }
    ]

    return { phases, currentStep: props.currentStep, preTotalAud, duringTotalAud, postOneTimeAud, livingTotalAud, preRange, duringRange, postRange, livingRange, formatAud, formatVndFromAud, formatDigits, splitIntoLines, extractCostsFromHtml, parseCostStr, computeStepRange, computePhaseRange, formatRange, formatRangeVnd, currency, toggleCurrency }
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
