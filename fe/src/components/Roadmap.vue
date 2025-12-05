<template>
  <div class="mb-6">
    <h2 class="text-xl font-bold mb-3">Lộ trình tổng quát</h2>

    <!-- Desktop: three columns for phases -->
    <div class="hidden md:flex gap-6">
      <div v-for="phase in phases" :key="phase.id" class="flex-1 bg-white p-4 border rounded">
        <div class="font-semibold mb-2">{{ phase.title }}</div>
        <div class="text-xs text-gray-600 mb-3">{{ phase.desc }}</div>
        <div class="space-y-3">
          <div v-for="s in phase.steps" :key="s.id" class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-full flex items-center justify-center', (s.index < currentStep) ? 'bg-green-600 text-white' : s.index === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']">
              <span class="text-sm font-semibold">{{ s.index }}</span>
            </div>
            <div>
              <div class="font-medium">{{ s.title }}</div>
              <div class="text-xs text-gray-600">{{ s.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: vertical phases -->
    <div class="md:hidden space-y-4">
      <div v-for="phase in phases" :key="phase.id" class="bg-white p-3 border rounded">
        <div class="font-semibold">{{ phase.title }}</div>
        <div class="text-xs text-gray-600 mb-2">{{ phase.desc }}</div>
        <div class="space-y-3">
          <div v-for="s in phase.steps" :key="s.id" class="flex items-start gap-3">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center mt-1', (s.index < currentStep) ? 'bg-green-600 text-white' : s.index === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700']">
              <span class="text-sm font-semibold">{{ s.index }}</span>
            </div>
            <div>
              <div class="font-medium">{{ s.title }}</div>
              <div class="text-xs text-gray-600">{{ s.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Roadmap',
  props: {
    currentStep: { type: Number, required: false, default: 1 }
  },
  setup(props) {
    // phases with detailed steps and important notes (user-provided content)
    const phases = [
      {
        id: 'before',
        title: 'Trước khi đi Úc',
        desc: 'Các bước chính trước khi xuất cảnh',
        note: 'Độ tuổi 18-30, phí visa 650 AUD. Chuẩn bị 10-12 tháng.',
        steps: [
          { id: 'ballot', index: 1, title: 'Nộp Ballot & hồ sơ', desc: 'Nộp Ballot (25 AUD), chờ lời mời rồi nộp hồ sơ đầy đủ (hộ chiếu, chứng minh tài chính ≥5,000 AUD, tiếng Anh B1+, sức khỏe, lý lịch tư pháp).' },
          { id: 'travel', index: 2, title: 'Chuẩn bị đi lại & hồ sơ', desc: 'Mua vé máy bay khứ hồi, bảo hiểm du lịch, chuẩn bị CV tiếng Anh.' },
          { id: 'study', index: 3, title: 'Học & tích lũy kinh nghiệm', desc: 'Học tiếng Anh/PTE nếu cần, tích lũy kinh nghiệm nghề (nông nghiệp, dịch vụ).' }
        ]
      },
      {
        id: 'during',
        title: 'Khi đang ở Úc',
        desc: 'Các bước chính khi đã có mặt ở Úc',
        note: 'Ở hostel đầu tiên, kết nối cộng đồng backpacker. Thu nhập hỗ trợ chi phí.',
        steps: [
          { id: 'setup', index: 4, title: 'Thiết lập đời sống', desc: 'Mua SIM, mở tài khoản ngân hàng, xin TFN (mã thuế), ABN nếu tự doanh.' },
          { id: 'work', index: 5, title: 'Tìm việc & làm việc', desc: 'Tìm việc qua Seek/Indeed/Gumtree (farm, khách sạn, ≤6 tháng/nhà tuyển dụng).' },
          { id: 'training', index: 6, title: 'Du lịch & học ngắn hạn', desc: 'Du lịch, học ≤4 tháng (RSA/FoodSafety), làm việc regional để gia hạn visa năm 2/3.' }
        ]
      },
      {
        id: 'after',
        title: 'Sau khi về',
        desc: 'Các bước thực hiện sau khi kết thúc hành trình',
        note: '',
        steps: [
          { id: 'super', index: 7, title: 'Rút Superannuation', desc: 'Rút Superannuation (quỹ hưu trí).' },
          { id: 'cv', index: 8, title: 'Cập nhật CV & tận dụng kinh nghiệm', desc: 'Cập nhật CV với kinh nghiệm Úc, dùng để xin việc Việt Nam hoặc visa khác (482/491).' },
          { id: 'evaluate', index: 9, title: 'Đánh giá hướng đi', desc: 'Đánh giá tài chính, kỹ năng để quyết định quay lại hoặc định cư.' }
        ]
      }
    ]

    return { phases, currentStep: props.currentStep }
  }
})
</script>

<style scoped>
/* keep the roadmap simple; layout uses Tailwind utilities */
</style>
