<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">Checklist: Trước khi ký hợp đồng</h2>
    <p class="text-sm text-gray-600 mb-3">Đánh dấu các mục đã kiểm tra — lưu vào trình duyệt để xem lại.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <label v-for="(c, i) in checklist" :key="i" class="flex items-start gap-2 p-3 border rounded">
        <input type="checkbox" v-model="states[i]" />
        <div>
          <div class="font-medium">{{ c.title }}</div>
          <div class="text-sm text-gray-600">{{ c.hint }}</div>
        </div>
      </label>
    </div>

    <div class="mt-3 flex gap-2">
      <button @click="save" class="px-3 py-1 bg-emerald-600 text-white rounded">Lưu checklist</button>
      <button @click="clear" class="px-3 py-1 bg-gray-200 rounded">Đặt lại</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const checklist = ref([
  { title: 'Yêu cầu hợp đồng bằng văn bản', hint: 'Ghi rõ dịch vụ, phí, điều kiện hoàn tiền, thời hạn' },
  { title: 'Có hóa đơn/biên lai chuyển khoản', hint: 'Không chuyển tiền mặt mà không có biên lai' },
  { title: 'Kiểm tra giấy phép tư vấn', hint: 'Tra mã số doanh nghiệp, chứng chỉ nếu có' },
  { title: 'Không hứa 100% đậu', hint: 'Mọi agency chân chính không thể cam kết 100%' },
  { title: 'Không chuyển tiền qua cá nhân', hint: 'Chỉ chuyển cho công ty, theo hợp đồng' }
])

const states = ref(checklist.value.map(() => false))

const STORAGE_KEY = 'rtu_risk_checklist'

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states.value))
  alert('Checklist đã lưu cục bộ')
}

function clear() {
  states.value = checklist.value.map(() => false)
  localStorage.removeItem(STORAGE_KEY)
}

// load existing
try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) states.value = JSON.parse(raw)
} catch (e) {}
</script>

<style scoped></style>
