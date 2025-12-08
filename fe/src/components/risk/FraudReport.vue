<template>
  <div>
    <h2 class="text-lg font-semibold mb-2" id="report">Module: Tôi nghi bị lừa</h2>
    <p class="text-sm text-gray-600 mb-3">Hướng dẫn từng bước nếu bạn nghi ngờ agency không minh bạch.</p>

    <ol class="list-decimal pl-6 space-y-2 text-sm mb-4">
      <li><strong>Ngừng nộp thêm tiền</strong> và dừng gửi hồ sơ nhạy cảm.</li>
      <li><strong>Thu thập bằng chứng</strong>: hợp đồng, biên lai, email, tin nhắn, ghi âm, hóa đơn chuyển khoản.</li>
      <li><strong>Liên hệ hỗ trợ</strong>: công an địa phương, Sở GDĐT nơi công ty đặt trụ sở, luật sư.</li>
    </ol>

    <div class="mb-4">
      <h3 class="font-semibold">Danh sách cơ quan theo tỉnh/thành (gợi ý)</h3>
      <p class="text-sm text-gray-600">Bạn có thể liên hệ Sở GDĐT tại nơi doanh nghiệp đăng ký hoặc công an nơi xảy ra sự việc.</p>
    </div>

    <div class="mb-4">
      <h3 class="font-semibold">Mẫu cấu trúc đơn tố cáo (gợi ý)</h3>
      <p class="text-sm text-gray-600 mb-2">Sao chép cấu trúc dưới đây để hoàn thiện thông tin của bạn.</p>
      <div class="bg-gray-50 border p-3 rounded text-sm">
        <div><strong>Họ và tên:</strong> [Họ tên]</div>
        <div><strong>Địa chỉ:</strong> [Địa chỉ]</div>
        <div><strong>Tên công ty agency:</strong> [Tên công ty]</div>
        <div><strong>Số tiền đã nộp:</strong> [Số tiền]</div>
        <div><strong>Diễn biến sự việc:</strong> [Mô tả ngắn các bước và thời gian]</div>
        <div><strong>Yêu cầu:</strong> [Yêu cầu hoàn tiền / xử lý]</div>
      </div>
    </div>

    <div>
      <h3 class="font-semibold mb-2">Gửi thông tin tới trang này (lưu cục bộ)</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input v-model="form.name" placeholder="Họ và tên" class="p-2 border rounded" />
        <input v-model="form.company" placeholder="Tên agency" class="p-2 border rounded" />
        <input v-model="form.amount" placeholder="Số tiền đã nộp (AUD)" class="p-2 border rounded" />
        <input v-model="form.contact" placeholder="Số điện thoại / email" class="p-2 border rounded" />
      </div>
      <textarea v-model="form.summary" rows="4" class="w-full mt-3 p-2 border rounded" placeholder="Tóm tắt diễn biến"></textarea>
      <div class="mt-3 flex gap-2">
        <button @click="saveReport" class="px-3 py-1 bg-emerald-600 text-white rounded">Lưu báo cáo</button>
        <button @click="clear" class="px-3 py-1 bg-gray-200 rounded">Xóa</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const STORAGE = 'rtu_fraud_reports'

const form = ref({ name: '', company: '', amount: '', contact: '', summary: '' })

function saveReport() {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE) || '[]')
    existing.push({ ...form.value, createdAt: new Date().toISOString() })
    localStorage.setItem(STORAGE, JSON.stringify(existing))
    alert('Đã lưu báo cáo cục bộ. Hãy giữ chứng cứ và liên hệ cơ quan chức năng nếu cần.')
    form.value = { name: '', company: '', amount: '', contact: '', summary: '' }
  } catch (e) { alert('Không thể lưu — kiểm tra localStorage') }
}

function clear() { form.value = { name: '', company: '', amount: '', contact: '', summary: '' } }
</script>

<style scoped></style>
