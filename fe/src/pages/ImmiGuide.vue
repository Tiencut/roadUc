<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Hướng dẫn tạo ImmiAccount & nộp hồ sơ</h1>
    <div class="bg-white p-4 border rounded space-y-2">
      <ol class="list-decimal pl-5 space-y-1">
        <li>Tạo tài khoản ImmiAccount: truy cập immi.homeaffairs.gov.au → Register</li>
        <li>Chọn loại visa: chọn 'Student visa (subclass 500)' cho du học</li>
        <li>Chuẩn bị giấy tờ: hộ chiếu, bảng điểm, chứng chỉ tiếng Anh, GTE, chứng minh tài chính</li>
        <li>Upload tài liệu theo form (PDF/JPG) — đảm bảo tên file rõ ràng</li>
        <li>Thanh toán lệ phí bằng thẻ quốc tế</li>
        <li>Theo dõi trạng thái và hoàn tất biometrics / medical nếu được yêu cầu</li>
      </ol>
      <p class="text-sm text-gray-600">Gợi ý: chuẩn bị bản scan, chú ý hạn nộp và thời gian xử lý.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'ImmiGuide' })
</script>

<style scoped>
.page { padding:1rem }
</style>
