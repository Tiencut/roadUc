<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">Thư viện case thực tế (ẩn danh)</h2>
    <p class="text-sm text-gray-600 mb-3">Tóm tắt ngắn các vụ việc đã xảy ra và bài học rút ra.</p>

    <div class="space-y-3">
      <div v-for="(c, i) in cases" :key="i" class="p-3 border rounded">
        <div class="font-semibold">{{ c.title }}</div>
        <div class="text-sm text-gray-600">{{ c.summary }}</div>
        <div class="mt-2 text-sm text-amber-700 font-medium">Bài học: {{ c.lessons.join(' • ') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cases = [
  { title: 'Agency A thu tiền rồi mất contact', summary: 'Agency được thành lập, thu tiền đặt cọc, sau vài tuần không trả lời và đóng cửa.', lessons: ['Yêu cầu hợp đồng rõ ràng', 'Không chuyển tiền cho cá nhân'] },
  { title: 'Agency hứa 100% đậu', summary: 'Agency dùng ngôn từ cam kết, thu tiền cao và thất bại trong hồ sơ.', lessons: ['Không tin cam kết 100%', 'Yêu cầu mô tả dịch vụ rõ ràng'] }
]
</script>

<style scoped></style>
