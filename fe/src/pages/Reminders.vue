<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-3">Nhắc việc & Cập nhật</h1>
    <div class="flex gap-2 mb-3">
      <input v-model="text" placeholder="Nội dung nhắc" class="flex-1 border rounded px-3 py-2" />
      <button @click="add" class="bg-green-600 text-white px-4 py-2 rounded">Thêm</button>
    </div>
    <div class="mb-4 flex gap-2">
      <button @click="applyTemplate('6m')" class="px-3 py-1 border rounded text-sm">Thêm checklist -6 tháng</button>
      <button @click="applyTemplate('3m')" class="px-3 py-1 border rounded text-sm">Thêm checklist -3 tháng</button>
      <button @click="applyTemplate('1m')" class="px-3 py-1 border rounded text-sm">Thêm checklist -1 tháng</button>
      <button @click="applyTemplate('after')" class="px-3 py-1 border rounded text-sm">Sau khi đến Úc</button>
    </div>
    <ul class="space-y-2">
      <li v-for="r in reminders" :key="r.id" class="flex items-center justify-between p-2 border rounded">
        <span>{{ r.text }}</span>
        <button class="text-sm text-red-600" @click="remove(r.id)">X</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Reminders',
  setup() {
    const text = ref('')
    const reminders = ref<any[]>([])
    let id = 1
    function add() { if (!text.value) return; reminders.value.push({ id: id++, text: text.value }); text.value = '' }
    function remove(i:number) { reminders.value = reminders.value.filter(r=>r.id!==i) }

    const templates: Record<string, string[]> = {
      '6m': [
        'Kiểm tra yêu cầu visa và hồ sơ đại sứ quán',
        'Bắt đầu thu thập bằng tốt nghiệp & bảng điểm đã công chứng',
        'Chuẩn bị tài liệu tài chính (bằng chứng tiết kiệm / thu nhập)',
        'Lên kế hoạch lịch thi tiếng Anh (IELTS/TOEFL) nếu cần',
        'Tìm hiểu khóa học & nộp đơn xin học nếu chưa nộp'
      ],
      '3m': [
        'Hoàn thiện hồ sơ, dịch thuật và công chứng',
        'Nộp hồ sơ xin visa / trả lời yêu cầu bổ sung',
        'Đặt vé máy bay sơ bộ (nếu cần)',
        'Mở tài khoản ngân hàng dự phòng hoặc xác nhận tài chính'
      ],
      '1m': [
        'Chuẩn bị hành lý theo danh sách trường cung cấp',
        'Kiểm tra y tế & tiêm chủng cần thiết',
        'In giấy tờ quan trọng: thư mời, visa, bảo hiểm, bằng cấp',
        'Sắp xếp chỗ ở tạm thời hoặc liên hệ homestay'
      ],
      'after': [
        'Đăng ký TFN (Tax File Number) khi đến',
        'Mở tài khoản ngân hàng tại Úc',
        'Đăng ký với trường và hoàn tất thủ tục nhập học',
        'Mua bảo hiểm sức khỏe dành cho du học sinh (OSHC)'
      ]
    }

    function applyTemplate(kind: string) {
      const list = templates[kind] || []
      for (const t of list) {
        reminders.value.push({ id: id++, text: t })
      }
    }

    return { text, add, reminders, remove, applyTemplate }
  }
})
</script>

<style scoped>
.page { padding:1rem }
</style>
