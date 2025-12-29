<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Khảo sát khả năng đi Úc</h1>

    <div class="bg-white p-4 border rounded">
      <p class="text-sm text-gray-600 mb-4">Nhập thông tin ở cột trái; bảng hiển thị điều kiện cần đạt theo loại visa và trạng thái ĐỦ/CHƯA ĐỦ. Lưu ý: nhập điểm tiếng Anh (PTE/IELTS/TOEFL) và các số tiền bằng số (AUD hoặc VND).</p>

      <div class="overflow-x-auto">
        <table class="w-full table-auto text-sm border-collapse">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">Tiêu chí</th>
              <th class="p-2">Bạn nhập</th>
              <th class="p-2">Điều kiện cần đạt</th>
              <th class="p-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, idx) in matches" :key="idx" class="border-b">
              <td class="p-2">{{ m.criteria }}</td>
              <td class="p-2">
                <div>
                  <template v-if="m.criteria === 'Tuổi'">
                    <input type="number" min="0" max="120" step="1" v-model.number="age" class="w-24 border rounded px-2 py-1" />
                  </template>
                  <template v-else-if="m.criteria === 'Học vấn'">
                    <select v-model="education" class="border rounded px-2 py-1">
                      <option value="highschool">Trung học</option>
                      <option value="bachelor">Cử nhân</option>
                      <option value="master">Thạc sĩ+</option>
                    </select>
                  </template>
                  <template v-else-if="m.criteria === 'Tiếng Anh (PTE/IELTS)'">
                    <div class="flex items-center gap-2">
                      <select v-model="englishTest" class="border rounded px-2 py-1 text-sm">
                        <option value="pte">PTE</option>
                        <option value="ielts">IELTS</option>
                        <option value="toefl">TOEFL</option>
                        <option value="other">Khác</option>
                      </select>
                      <input type="number" step="0.1" min="0" v-model.number="englishScore" class="w-28 border rounded px-2 py-1" placeholder="Điểm" />
                    </div>
                    <div class="text-xs text-gray-500 mt-1">Lưu ý: Điểm PTE được chuyển sang IELTS-equivalent để so sánh (ví dụ PTE 65 ~ IELTS 6.5).</div>
                  </template>
                  <template v-else-if="m.criteria === 'Quỹ (AUD)'">
                    <div class="flex flex-col gap-2">
                      <input type="number" min="0" v-model.number="funds" class="w-full border rounded px-2 py-1" placeholder="AUD" />
                      <input type="text" v-model="fundsVndDisplay" @input="onFundsVndInput" class="w-full border rounded px-2 py-1" placeholder="VND (nhập số, tự format)" />
                    </div>
                  </template>
                  <template v-else-if="m.criteria === 'Kinh nghiệm làm việc (năm - nghề liên quan)'">
                    <input type="number" min="0" v-model.number="experience" class="w-24 border rounded px-2 py-1" />
                    <div class="text-xs text-gray-500 mt-1">Ghi chú: nhập số năm kinh nghiệm liên quan trực tiếp tới nghề tuyển (ví dụ: 2 năm làm developer nếu nộp hồ sơ ngành IT).</div>
                  </template>
                  <template v-else>
                    {{ m.valueDisplay }}
                  </template>
                </div>
              </td>
              <td class="p-2">
                <div>{{ m.requiredText }}</div>
                <div v-if="m.criteria === 'Quỹ (AUD)' || m.criteria === 'Funds (AUD)'" class="text-xs text-gray-600 mt-1">
                  Visa ước tính: <strong>{{ requiredAud }} AUD</strong>
                  <span v-if="formattedRequiredVnd">(~ {{ formattedRequiredVnd }})</span>
                </div>
              </td>
              <td class="p-2"><span :class="m.meets ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">{{ m.meets ? 'ĐỦ' : 'CHƯA ĐỦ' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4">
        <div v-if="validationErrors.length" class="mb-3 text-sm text-red-600">
          <div class="font-semibold">Lỗi nhập liệu</div>
          <ul class="list-disc pl-5">
            <li v-for="(e, i) in validationErrors" :key="i">{{ e }}</li>
          </ul>
        </div>
        <div class="flex items-center gap-3">
          <button @click="evaluate" :disabled="validationErrors.length" class="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Đánh giá</button>
          <button @click="reset" class="px-3 py-2 border rounded text-sm">Reset</button>
          <div class="ml-auto text-sm">
            Kết quả: <strong class="ml-2">{{ result.level }}</strong>
          </div>
        </div>
      </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label class="block text-sm">Chọn loại visa để ước tính số dư bắt buộc</label>
            <select v-model="visaType" class="mt-1 block w-full border rounded px-2 py-1">
              <option value="student">Student (subclass 500)</option>
              <option value="skilled">Skilled / PR</option>
              <option value="workingHoliday">Work & Holiday</option>
              <option value="visitor">Visitor / Tourist</option>
            </select>
          </div>

          <div>
            <label class="block text-sm">Chuyển sang (Mã tiền tệ - ví dụ: VND, USD)</label>
            <input v-model="targetCurrency" class="mt-1 block w-full border rounded px-2 py-1" />
          </div>

          <div>
            <button @click="convertRequired" class="bg-green-600 text-white px-4 py-2 rounded">Lấy số dư ước tính & chuyển đổi</button>
          </div>
        </div>

        <div class="mt-3 text-sm bg-gray-50 p-3 rounded">
          <div>Yêu cầu ước tính: <strong class="ml-2">{{ requiredAud }} AUD</strong> <span v-if="formattedRequiredVnd">(~ {{ formattedRequiredVnd }})</span></div>
          <div v-if="converted !== null">Tương đương: <strong>{{ converted }} {{ targetCurrency }}</strong></div>
          <div class="mt-2 text-xs text-gray-600">Ghi chú: các con số là ước tính tham khảo. Vui lòng kiểm tra trang chính thức của Department of Home Affairs để biết yêu cầu chi tiết theo từng visa.</div>
          <div class="mt-1 text-xs">
            Tham khảo: <a class="text-blue-600" href="https://immi.homeaffairs.gov.au/" target="_blank" rel="noreferrer">Department of Home Affairs</a>
          </div>
        </div>

      

      <div class="mt-4">
        <h3 class="text-lg font-semibold">Gợi ý loại visa</h3>
        <div class="mt-2 text-sm">
          <p class="text-sm text-gray-600">Dựa trên đánh giá hiện tại, hệ thống đưa ra một vài gợi ý phù hợp kèm nguyên nhân ngắn gọn.</p>
          <ul class="mt-2 space-y-2">
            <li v-for="(v, idx) in recommendedVisas" :key="idx" class="p-3 bg-white border rounded">
              <div class="font-semibold">{{ v.label }}</div>
              <div class="text-xs text-gray-700 mt-1">Lý do: {{ v.reason }}</div>
              <div class="text-xs text-gray-500 mt-1">Tham khảo: <a :href="getVisaDef(v.key)?.link" target="_blank" rel="noreferrer" class="text-blue-600">{{ getVisaDef(v.key)?.linkLabel }}</a></div>
            </li>
          </ul>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'

function eduRank(e: string) {
  if (e === 'master') return 3
  if (e === 'bachelor') return 2
  return 1
}

export default defineComponent({
  name: 'Assessment',
  props: {
    initialVisaType: { type: String, required: false }
  },
  setup(props) {
    const runtimeError = ref<string | null>(null)
    try {
      const age = ref<number | null>(null)
      const education = ref('bachelor')
      const englishTest = ref<'pte'|'ielts'|'toefl'|'other'>('pte')
      const englishScore = ref<number | null>(null)
      const funds = ref<number | null>(null)
      const fundsVndDisplay = ref<string>('')
      const fundsVndNumeric = ref<number | null>(null)
      const audToVnd = ref<number | null>(null)
      const experience = ref<number | null>(0)

      const thresholds = {
        high: { age: 35, edu: 3, english: 6.5, funds: 20000, exp: 3 },
        medium: { age: 45, edu: 2, english: 6.0, funds: 10000, exp: 1 },
        low: { age: 200, edu: 1, english: 5.0, funds: 0, exp: 0 }
      }

      // helper to convert PTE/TOEFL to an approximate IELTS-equivalent (tái sử dụng)
      function convertToIelts(score: number | null, test: string | undefined) {
        if (!score || score <= 0) return 0
        const s = Number(score)
        if (test === 'pte') {
          if (s >= 79) return 8
          if (s >= 65) return 6.5
          if (s >= 50) return 5
          return 4
        }
        if (test === 'toefl') {
          if (s >= 110) return 8
          if (s >= 95) return 7
          if (s >= 80) return 6
          return 4
        }
        // assume IELTS if not matched
        return s
      }

      function meetsThresholds() {
        const vAge = (age.value ?? 999)
        const vEdu = eduRank(education.value)
        const vEnglish = convertToIelts(englishScore.value ?? null, englishTest.value)

        // derive funds in AUD: prefer `funds` (AUD); if only VND provided, convert using fetched rate
        let vFunds = 0
        if (typeof funds.value === 'number' && !Number.isNaN(funds.value)) vFunds = funds.value
        else if (typeof fundsVndNumeric.value === 'number' && audToVnd.value && audToVnd.value > 0) {
          vFunds = Math.round(fundsVndNumeric.value / audToVnd.value)
        } else {
          vFunds = 0
        }
        const vExp = (experience.value ?? 0)

        return [
          {
            criteria: 'Tuổi', valueDisplay: age.value ?? '-',
            requiredText: `≤ ${thresholds.medium.age}`,
            meets: vAge <= thresholds.medium.age
          },
          {
            criteria: 'Học vấn', valueDisplay: education.value,
            requiredText: `≥ ${thresholds.medium.edu === 3 ? 'Thạc sĩ+' : thresholds.medium.edu === 2 ? 'Cử nhân' : 'Trung học'}`,
            meets: vEdu >= thresholds.medium.edu
          },
          {
            criteria: 'Tiếng Anh (PTE/IELTS)', valueDisplay: englishScore.value ? `${englishScore.value} (${englishTest.value.toUpperCase()})` : '-',
            requiredText: `≥ ${thresholds.medium.english} (IELTS-equivalent)` ,
            meets: vEnglish >= thresholds.medium.english
          },
          {
            criteria: 'Quỹ (AUD)', valueDisplay: (funds.value ?? (fundsVndDisplay.value ? `${fundsVndDisplay.value} VND` : '-')),
            requiredText: `≥ ${thresholds.medium.funds} AUD${audToVnd.value ? ` (~ ${formatDigitsWithCommas(String(Math.round(thresholds.medium.funds * audToVnd.value)))} VND)` : ''}`,
            meets: vFunds >= thresholds.medium.funds
          },
          {
            criteria: 'Kinh nghiệm làm việc (năm - nghề liên quan)', valueDisplay: experience.value ?? '-',
            requiredText: `≥ ${thresholds.medium.exp}`,
            meets: vExp >= thresholds.medium.exp
          }
        ]
      }

      const matches = computed(() => meetsThresholds())

      const result = ref({ level: 'Chưa đánh giá', score: { highCount: 0, medCount: 0 } as any })

      const validationErrors = computed(() => {
        const errs: string[] = []
        if (age.value !== null && (!Number.isInteger(age.value) || age.value < 0 || age.value > 120)) errs.push('Tuổi phải là số nguyên hợp lệ (0–120).')
        if (englishScore.value !== null && englishScore.value < 0) errs.push('Điểm tiếng Anh không được âm.')
        if (funds.value !== null && funds.value < 0) errs.push('Quỹ không được âm.')
        if (experience.value !== null && (experience.value < 0 || !Number.isFinite(experience.value))) errs.push('Kinh nghiệm phải là số không âm (năm).')
        return errs
      })

      function evaluate() {
        if (validationErrors.value.length) {
          // show small toast-like error (keep simple: browser alert)
          alert('Có lỗi nhập liệu:\n' + validationErrors.value.join('\n'))
          return
        }

        // Binary-style scoring: count how many criteria meet the medium threshold
        const m = matches.value
        let meetCount = 0
        m.forEach(r => { if (r.meets) meetCount++ })

        if (meetCount >= 3) result.value.level = 'ĐỦ'
        else result.value.level = 'CHƯA ĐỦ'
        result.value.score = { meetCount }
        // Persist the latest assessment so other components can reference it
        try {
          const snapshot = {
            age: age.value,
            education: education.value,
            englishTest: englishTest.value,
            englishScore: englishScore.value,
            // store an IELTS-equivalent for compatibility with existing code
            ielts: convertToIelts(englishScore.value ?? null, englishTest.value),
            funds: funds.value,
            experience: experience.value,
            result: result.value
          }
          localStorage.setItem('latest_assessment', JSON.stringify(snapshot))
        } catch (e) {
          // ignore storage errors
        }
      }

      function reset() {
        age.value = null; education.value = 'bachelor'; englishTest.value = 'pte'; englishScore.value = null; funds.value = null; experience.value = 0
        result.value = { level: 'Chưa đánh giá', score: 0 }
        try { localStorage.removeItem('latest_assessment') } catch (e) {}
      }

      // --- New: currency conversion + visa required amounts ---
      const visaType = ref<'student'|'skilled'|'workingHoliday'|'visitor'>(props.initialVisaType as any || 'student')
      const targetCurrency = ref('VND')
      const converted = ref<number | null>(null)

      const visaMinimums: Record<string, number> = {
        // NOTE: these are estimates for demo — always verify with official sources
        student: 21041, // approximate living cost per year (AUD) reference Home Affairs guidance
        skilled: 30000, // settlement estimate (AUD) - conservative demo value
        workingHoliday: 5000, // rough recommended buffer (AUD)
        visitor: 1500 // per-month approximate (AUD)
      }

      const requiredAud = computed(() => {
        return visaMinimums[visaType.value] ?? visaMinimums.student
      })

      // required amount in VND (approx) using fetched AUD->VND rate
      const requiredVnd = computed(() => {
        const rate = audToVnd.value
        if (!rate || typeof rate !== 'number' || Number.isNaN(rate)) return null
        const v = Math.round((requiredAud.value || 0) * rate)
        return v
      })

      const formattedRequiredVnd = computed(() => {
        if (!requiredVnd.value) return null
        return formatDigitsWithCommas(String(requiredVnd.value)) + ' VND'
      })

      async function convertRequired() {
        try {
          const to = (targetCurrency.value || 'VND').toUpperCase()
          const amt = requiredAud.value
          const res = await fetch(`https://api.exchangerate.host/convert?from=AUD&to=${to}&amount=${amt}`)
          const data = await res.json()
          if (data && typeof data.result === 'number') {
            converted.value = Math.round(data.result)
          } else {
            converted.value = NaN
          }
        } catch (e) {
          converted.value = NaN
        }
      }

      // fetch AUD -> VND rate once on mount to support VND input conversion
      onMounted(async () => {
        try {
          const r = await fetch('https://api.exchangerate.host/latest?base=AUD&symbols=VND')
          const d = await r.json()
          if (d && d.rates && typeof d.rates.VND === 'number') audToVnd.value = d.rates.VND
        } catch (e) {
          // ignore — we'll fallback to a conservative estimate if needed
          audToVnd.value = 16000
        }
      })

      // format helper: format a digit-only string with commas, e.g. '1000000' -> '1,000,000'
      function formatDigitsWithCommas(digits: string) {
        if (!digits) return ''
        const n = digits.replace(/^0+/, '') || '0'
        return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }

      function onFundsVndInput(e?: Event) {
        // single-line numeric input: strip non-digits, format with commas, and store numeric value
        const raw = fundsVndDisplay.value || ''
        const digits = raw.replace(/[^0-9]/g, '')
        fundsVndDisplay.value = digits ? formatDigitsWithCommas(digits) : ''
        fundsVndNumeric.value = digits ? parseInt(digits, 10) : null
      }

      // react to prop changes so parent can switch the survey type
      // (useful when VisaTable selects different visa types)
      watch(() => props.initialVisaType, (nv) => {
        if (nv) {
          // normalize common keys
          if (nv === 'student' || nv === '500') visaType.value = 'student'
          else if (nv === 'skilled' || nv === '189' || nv === '190') visaType.value = 'skilled'
          else if (nv === 'workingHoliday' || nv.toString().includes('462')) visaType.value = 'workingHoliday'
          else if (nv === 'visitor' || nv.toString().toLowerCase().includes('visitor') || nv === '600') visaType.value = 'visitor'
          else visaType.value = nv as any
        }
      })

      // Simple visa definitions for UI reference
      const visaDefinitions: Record<string, { title: string; desc: string; link: string; linkLabel: string }> = {
        student: {
          title: 'Student (subclass 500)',
          desc: 'Visa cho du học sinh; cần COE, bằng cấp, và bằng chứng tài chính. Thường là lộ trình nếu cần nâng điểm/tiếng Anh.',
          link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
          linkLabel: 'immi - Student 500'
        },
        skilled: {
          title: 'Skilled / Permanent pathways',
          desc: 'Các visa định cư lao động (skilled) yêu cầu điểm, tay nghề, tiếng Anh. Phù hợp với người có kinh nghiệm và trình độ cao.',
          link: 'https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list',
          linkLabel: 'immi - Skilled visas'
        },
        workingHoliday: {
          title: 'Work & Holiday (subclass 462 / 417)',
          desc: 'Visa tạm trú kết hợp làm việc dành cho người trẻ (tuổi giới hạn theo quốc gia). Thích hợp để trải nghiệm + kiếm tiền ngắn hạn.',
          link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417',
          linkLabel: 'immi - Work & Holiday'
        },
        visitor: {
          title: 'Visitor / Tourist',
          desc: 'Visa ngắn hạn để du lịch hoặc thăm thân; không cho phép làm việc (trừ một số tình huống hạn chế).',
          link: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600',
          linkLabel: 'immi - Visitor 600'
        }
      }

      // Recommendation engine: simple rule-based suggestions with short reasons
      const recommendedVisas = computed(() => {
        const out: Array<{ key: string; label: string; reason: string }> = []
        const vEdu = eduRank(education.value)
        const vExp = (experience.value ?? 0)
        const vAge = (age.value ?? 100)
        // compute funds and english score equivalents locally
        const vFunds = (typeof funds.value === 'number' && !Number.isNaN(funds.value)) ? funds.value : ((typeof fundsVndNumeric.value === 'number' && audToVnd.value && audToVnd.value > 0) ? Math.round(fundsVndNumeric.value / audToVnd.value) : 0)
        // inline conversion to avoid external dependency at render time
        function toIeltsLocal(score: number | null, test: string | undefined) {
          if (!score || score <= 0) return 0
          const s = Number(score)
          if (test === 'pte') {
            if (s >= 79) return 8
            if (s >= 65) return 6.5
            if (s >= 50) return 5
            return 4
          }
          if (test === 'toefl') {
            if (s >= 110) return 8
            if (s >= 95) return 7
            if (s >= 80) return 6
            return 4
          }
          return s
        }
        const vEnglish = toIeltsLocal(englishScore.value ?? null, englishTest.value)
        const lvl = (result.value && typeof result.value.level === 'string') ? result.value.level : 'Chưa đánh giá'

        if (lvl === 'Cao') {
          if (vEnglish >= 6.5 && vEdu >= 2 && vExp >= 1) {
            out.push({ key: 'skilled', label: 'Skilled / PR', reason: 'Tiếng Anh cao (PTE/IELTS tương đương), trình độ và kinh nghiệm phù hợp — đường lao động/định cư' })
          } else {
            out.push({ key: 'student', label: 'Student (Học tập)', reason: 'Điểm tổng cao nhưng cần cải thiện một vài tiêu chí; học tập có thể là lộ trình' })
          }
        } else if (lvl === 'Trung bình') {
          // Medium: either student route or skilled with improvement
          if (vFunds >= 10000 && vEnglish >= 6.0) {
            out.push({ key: 'student', label: 'Student (Học tập)', reason: 'Quỹ và tiếng Anh đủ cho học tập; có thể dùng học để cải thiện điểm' })
          }
          if (vEnglish >= 6.0 && vEdu >= 2) {
            out.push({ key: 'skilled', label: 'Skilled (cần cải thiện)', reason: 'Cơ bản phù hợp cho lộ trình lao động nếu nâng nhẹ trình độ/kinh nghiệm' })
          }
          if (out.length === 0) {
            out.push({ key: 'visitor', label: 'Visitor / Explore', reason: 'Hiện chưa đủ điều kiện; có thể tới thăm để tìm hướng (không làm việc)' })
          }
        } else {
          // Low
          if (vAge >= 18 && vAge <= 30) {
            out.push({ key: 'workingHoliday', label: 'Work & Holiday', reason: 'Tuổi phù hợp, khoản tiền nhỏ là đủ để khởi đầu' })
          }
          out.push({ key: 'visitor', label: 'Visitor / Tourist', reason: 'Điểm thấp — lộ trình ngắn hạn hoặc chuẩn bị thêm hồ sơ' })
        }

        // Always include student as an option if funds and age are okay
        if (vFunds >= 5000 && !out.find(x => x.key === 'student')) {
          out.push({ key: 'student', label: 'Student (Học tập)', reason: 'Học tập là lộ trình phổ dụng để nâng trình độ và điểm' })
        }

        return out
      })
        const getVisaDef = (k: string) => (visaDefinitions as any)[k]

        return { age, education, englishTest, englishScore, funds, fundsVndDisplay, onFundsVndInput, experience, thresholds, matches, validationErrors, evaluate, reset, result, visaType, targetCurrency, converted, requiredAud, requiredVnd, formattedRequiredVnd, convertRequired, visaDefinitions, recommendedVisas, getVisaDef }
    } catch (e: any) {
      console.error('Assessment setup error', e)
      runtimeError.value = e && e.message ? e.message : String(e)
      // return safe defaults so template bindings don't blow up
      const safeRef = (v: any) => ref(v)
      return {
        runtimeError,
        age: safeRef(null),
        education: safeRef('bachelor'),
        englishTest: safeRef('pte'),
        englishScore: safeRef(null),
        ielts: safeRef(null),
        funds: safeRef(null),
        fundsVndDisplay: safeRef(''),
        onFundsVndInput: () => {},
        experience: safeRef(0),
        thresholds: {
          high: { age: 35, edu: 3, english: 6.5, funds: 20000, exp: 3 },
          medium: { age: 45, edu: 2, english: 6.0, funds: 10000, exp: 1 },
          low: { age: 200, edu: 1, english: 5.0, funds: 0, exp: 0 }
        },
        matches: computed(() => []),
        recommendedVisas: computed(() => []),
        evaluate: () => {},
        reset: () => {},
        result: safeRef({ level: 'Chưa đánh giá', score: {} }),
        visaType: safeRef('student'),
        targetCurrency: safeRef('VND'),
        converted: safeRef(null),
        requiredAud: computed(() => 0),
        requiredVnd: computed(() => null),
        formattedRequiredVnd: safeRef(null),
        convertRequired: async () => {},
        visaDefinitions: {},
        recommendedVisas: computed(() => []),
        getVisaDef: (k: string) => undefined
      }
    }
  }
})
</script>

<style scoped>
.page { padding:1rem }
table th, table td { border-bottom: 1px solid #eee }
</style>
