<template>
  <div>
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
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredVisas.length === 0">
            <td colspan="5" class="p-3 text-center text-sm text-gray-600">Không có kết quả khớp.</td>
          </tr>
          <tr v-for="(v, i) in filteredVisas" :key="i" class="border-b hover:bg-gray-50 cursor-pointer" @click="openDetails(v)" tabindex="0" @keydown.enter.prevent="openDetails(v)">
            <td class="p-2">{{ v.type }}</td>
            <td class="p-2">{{ v.code }}</td>
            <td class="p-2">{{ v.purpose }}</td>
            <td class="p-2">{{ v.duration }}</td>
            <td class="p-2">
              <div class="flex items-center">
                <span>{{ v.audience }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </section>
  <div v-if="selected" class="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
    <div class="bg-white max-w-2xl w-full p-4 rounded shadow">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-semibold text-lg">{{ selected.def.title }}</h3>
          <div class="text-xs text-gray-600">{{ selected.def.desc }}</div>
        </div>
        <button @click="closeDetails" class="text-gray-600">Đóng</button>
      </div>

      <div class="mt-3">
        <h4 class="font-medium">Yêu cầu chính</h4>
        <ul class="mt-2 space-y-2 text-sm">
          <li v-for="(r, idx) in (selected.def.requirements || [])" :key="idx" class="flex items-center justify-between">
            <div>{{ r.label }}</div>
            <div>
              <span v-if="latestAssessment === null" class="text-gray-500">(Không có dữ liệu khảo sát)</span>
              <span v-else>
                <span v-if="evalReq(r) === true" class="text-green-600">✓ Bạn đạt</span>
                <span v-else-if="evalReq(r) === false" class="text-red-600">✕ Chưa đạt</span>
                <span v-else class="text-gray-500">— Không xác định</span>
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="selected.def.guidance" class="mt-4">
        <h4 class="font-medium">Lời khuyên & Thông tin</h4>
        <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div class="font-semibold">Trước khi đi</div>
            <ul class="mt-1 list-disc list-inside text-sm text-gray-700">
              <li v-for="(it, idx) in (selected.def.guidance.before || [])" :key="'b-'+idx">{{ it }}</li>
            </ul>
          </div>
          <div>
            <div class="font-semibold">Khi đang ở Úc</div>
            <ul class="mt-1 list-disc list-inside text-sm text-gray-700">
              <li v-for="(it, idx) in (selected.def.guidance.during || [])" :key="'d-'+idx">{{ it }}</li>
            </ul>
          </div>
          <div>
            <div class="font-semibold">Sau khi đi / Kết thúc</div>
            <ul class="mt-1 list-disc list-inside text-sm text-gray-700">
              <li v-for="(it, idx) in (selected.def.guidance.after || [])" :key="'a-'+idx">{{ it }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <router-link to="/assessment" class="px-3 py-2 border rounded text-sm">Mở Khảo sát</router-link>
        <button @click="closeDetails" class="px-3 py-2 bg-blue-600 text-white rounded text-sm">Đóng</button>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'VisaTable',
  setup() {
    // visa definitions including simple requirement checks
    const visaDefinitions: Record<string, { key: string; title: string; desc?: string; requirements?: Array<any>; guidance?: { before?: string[]; during?: string[]; after?: string[] } }> = {
      '600 (Tourist/Sponsored Family Stream)': {
        key: 'visitor', title: 'Visitor 600', desc: 'Visa ngắn hạn cho du lịch / thăm thân',
        requirements: [
          { id: 'funds', label: 'Chứng minh tài chính (AUD)', type: 'funds', op: '>=', value: 1500 }
        ]
      },
      '500': {
        key: 'student', title: 'Student 500', desc: 'Visa học toàn thời gian',
        requirements: [
          { id: 'funds', label: 'Số dư tối thiểu (AUD)', type: 'funds', op: '>=', value: 21041 },
          { id: 'ielts', label: 'IELTS (band) tối thiểu (tham khảo)', type: 'ielts', op: '>=', value: 5.0 }
        ]
      },
      '482': {
        key: 'tss', title: 'Temporary Skill Shortage 482', desc: 'Lao động tay nghề do employer sponsor',
        requirements: [
          { id: 'experience', label: 'Kinh nghiệm (năm)', type: 'experience', op: '>=', value: 1 }
        ]
      },
      '462 (Work & Holiday)': {
        key: '462', title: 'Work & Holiday 462', desc: 'Visa du lịch kết hợp làm việc cho người trẻ (tuổi hạn chế, danh sách quốc gia)',
        requirements: [
          { id: 'age_le', label: 'Tuổi tối đa (thường)', type: 'age_le', op: '<=', value: 30 },
          { id: 'funds', label: 'Số dư khởi đầu ước tính (AUD)', type: 'funds', op: '>=', value: 5000 }
        ],
        guidance: {
          before: [
            'Kiểm tra quốc tịch của bạn có nằm trong danh sách đủ điều kiện Work & Holiday hay không.',
            'Chuẩn bị passport còn hạn ít nhất 6 tháng, ảnh, giấy tờ cá nhân và bằng chứng học vấn nếu cần.',
            'Mua bảo hiểm y tế du học/du lịch (OSHC hoặc bảo hiểm du lịch quốc tế) cho thời gian ở Úc.',
            'Chứng minh tài chính ban đầu (ít nhất AUD 5,000) và kế hoạch chi tiêu ban đầu.',
            'Tìm hiểu điều kiện làm việc (giới hạn giờ, nghề bị hạn chế) và yêu cầu tuổi.'
          ],
          during: [
            'Mở tài khoản ngân hàng Úc và xin TFN (Tax File Number) nếu bạn làm việc.',
            'Tôn trọng giới hạn làm việc của visa; giữ các giấy tờ quan trọng (passport, visa grant letter) an toàn.',
            'Ký hợp đồng lao động bằng văn bản khi có thể; lưu hợp đồng, payslips để làm bằng chứng.',
            'Đăng ký Medicare/OSHC theo hướng dẫn, và gia hạn bảo hiểm khi cần.',
            'Tìm kiếm công việc phù hợp, kiểm tra quyền lợi lao động và mức lương tối thiểu.'
          ],
          after: [
            'Lưu giữ bằng chứng làm việc, payslips, hợp đồng nếu bạn cần xin visa tiếp theo hoặc chứng minh kinh nghiệm.',
            'Nếu muốn ở lại lâu hơn, nghiên cứu các pathway (ví dụ visa tay nghề vùng/đề cử bang) và thời hạn nộp hồ sơ.',
            'Khai báo thuế cuối năm, giữ giấy tờ thuế để hoàn thuế nếu có.',
            'Nếu về nước, kiểm tra điều kiện quay lại Úc (nếu muốn làm việc tiếp) và gia hạn giấy tờ cần thiết.'
          ]
        }
      },
      '189': {
        key: '189', title: 'Skilled Independent 189', desc: 'Định cư qua điểm — yêu cầu điểm cao',
        requirements: [
          { id: 'ielts', label: 'IELTS (band) tham khảo', type: 'ielts', op: '>=', value: 7.0 },
          { id: 'education', label: 'Bằng cấp tối thiểu (Cử nhân)', type: 'education', op: '>=', value: 2 }
        ]
      }
    }

    const selected = ref<any | null>(null)
    const latestAssessment = ref<any | null>(null)

    function loadLatest() {
      try {
        const raw = localStorage.getItem('latest_assessment')
        if (raw) latestAssessment.value = JSON.parse(raw)
        else latestAssessment.value = null
      } catch (e) { latestAssessment.value = null }
    }

    loadLatest()

    function openDetails(row: any) {
      // attach definition if available
      const def = visaDefinitions[row.code] || { title: row.type, desc: '', requirements: [] }
      selected.value = { ...row, def }
      // ensure latest is fresh
      loadLatest()
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
    const visaRows = [
      { type: 'Du lịch/Thăm thân', code: '600 (Tourist/Sponsored Family Stream)', purpose: 'Du lịch, thăm bạn bè/gia đình', duration: '3-12 tháng/lần', audience: 'Du khách Việt Nam' },
      { type: 'Công tác ngắn hạn', code: '600 (Business Visitor Stream)', purpose: 'Họp hành, khảo sát thị trường', duration: 'Tối đa 3 tháng/lần, hiệu lực đến 3 năm', audience: 'Doanh nhân' },
      { type: 'Du học', code: '500', purpose: 'Học toàn thời gian tại trường Úc', duration: 'Theo thời gian khóa học + làm thêm', audience: 'Sinh viên quốc tế' },
      { type: 'Giám hộ học sinh', code: '590', purpose: 'Giám hộ con dưới 18 tuổi du học', duration: 'Theo visa con', audience: 'Cha mẹ' },
      { type: 'Làm việc tạm thời (TSS)', code: '482', purpose: 'Lao động tay nghề ngắn/dài hạn', duration: '2-4 năm', audience: 'Người được bảo lãnh doanh nghiệp' },
      { type: 'Sau tốt nghiệp', code: '485 (Graduate Temporary)', purpose: 'Làm việc sau du học', duration: '18 tháng - 4 năm', audience: 'Du học sinh tốt nghiệp' },
      { type: 'Tay nghề vùng miền', code: '491', purpose: 'Làm việc ở khu vực vùng sâu', duration: '5 năm (dẫn đến PR)', audience: 'Lao động có kỹ năng, được đề cử' },
      { type: 'Tay nghề độc lập', code: '189', purpose: 'Định cư vĩnh viễn không bảo lãnh', duration: 'Vĩnh viễn (gia hạn 5 năm)', audience: 'Người điểm cao, nghề hot' },
      { type: 'Tay nghề được đề cử', code: '190', purpose: 'Định cư với đề cử tiểu bang', duration: 'Vĩnh viễn', audience: 'Lao động kỹ năng cao' },
      { type: 'Lao động nghỉ dưỡng', code: '462 (Work & Holiday)', purpose: 'Du lịch + làm việc', duration: '1 năm (gia hạn 2 lần)', audience: 'Người trẻ 18-30 tuổi' },
      { type: 'Bảo lãnh vợ/chồng', code: '300/309/820', purpose: 'Kết hôn/đồng sống', duration: 'Tạm trú dẫn đến PR', audience: 'Người có quan hệ hôn nhân' },
      { type: 'Bảo lãnh cha mẹ', code: '143', purpose: 'Định cư đóng góp tài chính', duration: 'Vĩnh viễn', audience: 'Cha mẹ con cái bảo lãnh' },
      { type: 'Quá cảnh', code: 'Transit', purpose: 'Chuyển tiếp sân bay', duration: '72 giờ (hàng không)', audience: 'Hành khách trung chuyển' }
    ]

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

    return { searchQuery, filterPurpose, purposes, filteredVisas, selected, openDetails, closeDetails, latestAssessment, evalReq }
  }
})
</script>

<style scoped>
/* tiny local styles if needed */
</style>

<!-- modal moved into main template -->
