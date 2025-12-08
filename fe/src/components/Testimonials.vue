<template>
  <section class="max-w-6xl mx-auto px-4 py-6">
    <h2 class="text-xl font-semibold mb-3">Câu chuyện thực tế</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white p-4 border rounded">
        <div class="font-semibold">Nguyễn Anh — Sinh viên thạc sĩ</div>
        <div class="text-sm text-gray-700 mt-2">"Tôi dùng Road To Australia để ước tính chi phí và hoàn thiện GTE. Họ giúp tôi biết phải chuẩn bị gì trong 6 tháng trước khi nộp hồ sơ."</div>
      </div>
      <div class="bg-white p-4 border rounded">
        <div class="font-semibold">Trần Bình — WH 462</div>
        <div class="text-sm text-gray-700 mt-2">"Ví dụ ngân sách và checklist đã giúp tôi tự tin đi làm mùa vụ, tìm housing và mua bảo hiểm đúng lúc."</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'Testimonials' })
</script>

<style scoped>
</style>
