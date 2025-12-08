<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Hướng dẫn tạo ImmiAccount & nộp hồ sơ</h1>
    <div class="bg-white p-4 border rounded space-y-2">
      <h3 class="font-semibold">Timeline & checklist (gợi ý)</h3>
      <ol class="list-decimal pl-5 space-y-2">
        <li><strong>-6 đến -12 tháng:</strong> Chọn khóa học, xác định yêu cầu đầu vào, đăng ký trường, bắt đầu ôn thi tiếng Anh.</li>
        <li><strong>-3 đến -6 tháng:</strong> Hoàn thiện hồ sơ học tập, xin transcript, PSC (nếu cần), chuẩn bị bằng chứng tài chính.</li>
        <li><strong>-1 đến -3 tháng:</strong> Nộp ImmiAccount, upload tài liệu, thanh toán phí, book medical/biometrics nếu yêu cầu.</li>
        <li><strong>Trong 1 tháng:</strong> Theo dõi trạng thái, chuẩn bị kế hoạch đến Úc (nhà ở, bảo hiểm, vé máy bay).</li>
      </ol>

      <h3 class="font-semibold mt-3">Tài liệu cần chuẩn bị</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li>Hộ chiếu còn hạn</li>
        <li>Bảng điểm, chứng chỉ học vấn (có công chứng)</li>
        <li>Chứng chỉ tiếng Anh (IELTS/PTE/TOEFL)</li>
        <li>Chứng minh tài chính (bank statement, scholarship letter)</li>
        <li>GTE / thư giải trình (nếu apply student visa)</li>
        <li>Giấy khám sức khoẻ (nếu được yêu cầu), police check</li>
      </ul>

      <p class="text-sm text-gray-600 mt-2">Gợi ý: lưu các file PDF theo chuẩn tên: "Surname_GivenName_Type_Date.pdf" để dễ quản lý.</p>
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
