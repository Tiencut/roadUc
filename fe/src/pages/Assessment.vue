<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Khảo sát khả năng đi Úc</h1>

    <div class="bg-white p-4 border rounded">
      <p class="text-sm text-gray-600 mb-4">Nhập thông tin ở cột trái; các cột bên phải hiển thị ngưỡng cần đạt cho từng mức (Cao / Trung bình / Thấp).</p>

      <div class="overflow-x-auto">
        <table class="w-full table-auto text-sm border-collapse">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">Tiêu chí (Bạn nhập)</th>
              <th class="p-2">Cột nhập</th>
              <th class="p-2">Chi tiết phù hợp</th>
              <th class="p-2">Ngưỡng - Cao</th>
              <th class="p-2">Ngưỡng - Trung bình</th>
              <th class="p-2">Ngưỡng - Thấp</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="p-2">Tuổi</td>
              <td class="p-2"><input type="number" v-model.number="age" class="w-24 border rounded px-2 py-1" /></td>
              <td class="p-2">
                <div class="text-sm">
                  <span :class="matches[0].meets.high ? 'text-green-600' : 'text-gray-500'">Cao: {{ matches[0].meets.high ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[0].meets.medium ? 'text-green-600' : 'text-gray-500'">Trung: {{ matches[0].meets.medium ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[0].meets.low ? 'text-green-600' : 'text-gray-500'">Thấp: {{ matches[0].meets.low ? '✓' : '—' }}</span>
                </div>
              </td>
              <td class="p-2">≤ 35</td>
              <td class="p-2">≤ 45</td>
              <td class="p-2">Any</td>
            </tr>

            <tr class="border-b">
              <td class="p-2">Học vấn</td>
              <td class="p-2">
                <select v-model="education" class="border rounded px-2 py-1">
                  <option value="highschool">Trung học</option>
                  <option value="bachelor">Cử nhân</option>
                  <option value="master">Thạc sĩ+</option>
                </select>
              </td>
              <td class="p-2">
                <div class="text-sm">
                  <span :class="matches[1].meets.high ? 'text-green-600' : 'text-gray-500'">Cao: {{ matches[1].meets.high ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[1].meets.medium ? 'text-green-600' : 'text-gray-500'">Trung: {{ matches[1].meets.medium ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[1].meets.low ? 'text-green-600' : 'text-gray-500'">Thấp: {{ matches[1].meets.low ? '✓' : '—' }}</span>
                </div>
              </td>
              <td class="p-2">Thạc sĩ+</td>
              <td class="p-2">Cử nhân</td>
              <td class="p-2">Trung học</td>
            </tr>

            <tr class="border-b">
              <td class="p-2">IELTS (band)</td>
              <td class="p-2"><input type="number" step="0.5" v-model.number="ielts" class="w-24 border rounded px-2 py-1" /></td>
              <td class="p-2">
                <div class="text-sm">
                  <span :class="matches[2].meets.high ? 'text-green-600' : 'text-gray-500'">Cao: {{ matches[2].meets.high ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[2].meets.medium ? 'text-green-600' : 'text-gray-500'">Trung: {{ matches[2].meets.medium ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[2].meets.low ? 'text-green-600' : 'text-gray-500'">Thấp: {{ matches[2].meets.low ? '✓' : '—' }}</span>
                </div>
              </td>
              <td class="p-2">≥ 6.5</td>
              <td class="p-2">≥ 6.0</td>
              <td class="p-2">≥ 5.0</td>
            </tr>

            <tr class="border-b">
              <td class="p-2">Số dư tài khoản (AUD)</td>
              <td class="p-2"><input type="number" v-model.number="funds" class="w-40 border rounded px-2 py-1" /></td>
              <td class="p-2">
                <div class="text-sm">
                  <span :class="matches[3].meets.high ? 'text-green-600' : 'text-gray-500'">Cao: {{ matches[3].meets.high ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[3].meets.medium ? 'text-green-600' : 'text-gray-500'">Trung: {{ matches[3].meets.medium ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[3].meets.low ? 'text-green-600' : 'text-gray-500'">Thấp: {{ matches[3].meets.low ? '✓' : '—' }}</span>
                </div>
              </td>
              <td class="p-2">≥ 20,000</td>
              <td class="p-2">≥ 10,000</td>
              <td class="p-2">Any</td>
            </tr>

            <tr class="border-b">
              <td class="p-2">Kinh nghiệm làm việc (năm)</td>
              <td class="p-2"><input type="number" v-model.number="experience" class="w-24 border rounded px-2 py-1" /></td>
              <td class="p-2">
                <div class="text-sm">
                  <span :class="matches[4].meets.high ? 'text-green-600' : 'text-gray-500'">Cao: {{ matches[4].meets.high ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[4].meets.medium ? 'text-green-600' : 'text-gray-500'">Trung: {{ matches[4].meets.medium ? '✓' : '—' }}</span>
                  <span class="ml-2" :class="matches[4].meets.low ? 'text-green-600' : 'text-gray-500'">Thấp: {{ matches[4].meets.low ? '✓' : '—' }}</span>
                </div>
              </td>
              <td class="p-2">≥ 3</td>
              <td class="p-2">≥ 1</td>
              <td class="p-2">0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <button @click="evaluate" class="bg-blue-600 text-white px-4 py-2 rounded">Đánh giá</button>
        <button @click="reset" class="px-3 py-2 border rounded text-sm">Reset</button>
        <div class="ml-auto text-sm">
          Kết quả: <strong class="ml-2">{{ result.level }}</strong>
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
          <div>Yêu cầu ước tính (AUD): <strong class="ml-2">{{ requiredAud }}</strong></div>
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
              <div class="text-xs text-gray-500 mt-1">Tham khảo: <a :href="visaDefinitions[v.key]?.link" target="_blank" rel="noreferrer" class="text-blue-600">{{ visaDefinitions[v.key]?.linkLabel }}</a></div>
            </li>
          </ul>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

function eduRank(e: string) {
  if (e === 'master') return 3
  if (e === 'bachelor') return 2
  return 1
}

export default defineComponent({
  name: 'Assessment',
  setup() {
    const age = ref<number | null>(null)
    const education = ref('bachelor')
    const ielts = ref<number | null>(null)
    const funds = ref<number | null>(null)
    const experience = ref<number | null>(0)

    const thresholds = {
      high: { age: 35, edu: 3, ielts: 6.5, funds: 20000, exp: 3 },
      medium: { age: 45, edu: 2, ielts: 6.0, funds: 10000, exp: 1 },
      low: { age: 200, edu: 1, ielts: 5.0, funds: 0, exp: 0 }
    }

    function meetsThresholds() {
      const vAge = (age.value ?? 999)
      const vEdu = eduRank(education.value)
      const vIelts = (ielts.value ?? 0)
      const vFunds = (funds.value ?? 0)
      const vExp = (experience.value ?? 0)

      return [
        {
          criteria: 'Tuổi', valueDisplay: age.value ?? '-',
          meets: {
            high: vAge <= thresholds.high.age,
            medium: vAge <= thresholds.medium.age,
            low: true
          }
        },
        {
          criteria: 'Học vấn', valueDisplay: education.value,
          meets: {
            high: vEdu >= thresholds.high.edu,
            medium: vEdu >= thresholds.medium.edu,
            low: vEdu >= thresholds.low.edu
          }
        },
        {
          criteria: 'IELTS', valueDisplay: ielts.value ?? '-',
          meets: {
            high: vIelts >= thresholds.high.ielts,
            medium: vIelts >= thresholds.medium.ielts,
            low: vIelts >= thresholds.low.ielts
          }
        },
        {
          criteria: 'Funds (AUD)', valueDisplay: funds.value ?? '-',
          meets: {
            high: vFunds >= thresholds.high.funds,
            medium: vFunds >= thresholds.medium.funds,
            low: true
          }
        },
        {
          criteria: 'Kinh nghiệm (năm)', valueDisplay: experience.value ?? '-',
          meets: {
            high: vExp >= thresholds.high.exp,
            medium: vExp >= thresholds.medium.exp,
            low: vExp >= thresholds.low.exp
          }
        }
      ]
    }

    const matches = computed(() => meetsThresholds())

    const result = ref({ level: 'Chưa đánh giá', score: { highCount: 0, medCount: 0 } as any })

    function evaluate() {
      // Simple scoring: count meets for high/medium thresholds
      const m = matches.value
      let highCount = 0
      let medCount = 0
      m.forEach(r => { if (r.meets.high) highCount++; if (r.meets.medium) medCount++ })

      if (highCount >= 4) result.value.level = 'Cao'
      else if (medCount >= 3) result.value.level = 'Trung bình'
      else result.value.level = 'Thấp'
      result.value.score = { highCount, medCount }
      // Persist the latest assessment so other components can reference it
      try {
        const snapshot = {
          age: age.value,
          education: education.value,
          ielts: ielts.value,
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
      age.value = null; education.value = 'bachelor'; ielts.value = null; funds.value = null; experience.value = 0
      result.value = { level: 'Chưa đánh giá', score: 0 }
      try { localStorage.removeItem('latest_assessment') } catch (e) {}
    }

    // --- New: currency conversion + visa required amounts ---
    const visaType = ref<'student'|'skilled'|'workingHoliday'|'visitor'>('student')
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

    async function convertRequired() {
      converted.value = null
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
      const lvl = result.value.level
      const vIelts = (ielts.value ?? 0)
      const vEdu = eduRank(education.value)
      const vExp = (experience.value ?? 0)
      const vAge = (age.value ?? 100)
      const vFunds = (funds.value ?? 0)

      // High level => consider Skilled first if English/education/experience are strong
      if (lvl === 'Cao') {
        if (vIelts >= 6.5 && vEdu >= 2 && vExp >= 1) {
          out.push({ key: 'skilled', label: 'Skilled / PR', reason: 'IELTS cao, trình độ và kinh nghiệm phù hợp — đường lao động/định cư' })
        } else {
          out.push({ key: 'student', label: 'Student (Học tập)', reason: 'Điểm tổng cao nhưng cần cải thiện một vài tiêu chí; học tập có thể là lộ trình' })
        }
      } else if (lvl === 'Trung bình') {
        // Medium: either student route or skilled with improvement
        if (vFunds >= 10000 && vIelts >= 6.0) {
          out.push({ key: 'student', label: 'Student (Học tập)', reason: 'Quỹ và tiếng Anh đủ cho học tập; có thể dùng học để cải thiện điểm' })
        }
        if (vIelts >= 6.0 && vEdu >= 2) {
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

    return { age, education, ielts, funds, experience, thresholds, matches, evaluate, reset, result, visaType, targetCurrency, converted, requiredAud, convertRequired, visaDefinitions, recommendedVisas }
  }
})
</script>

<style scoped>
.page { padding:1rem }
table th, table td { border-bottom: 1px solid #eee }
</style>
