<template>
  <div class="max-w-3xl mx-auto px-4 py-12 text-center">
    <h1 class="text-3xl font-bold mb-4">Trang không tìm thấy</h1>
    <p class="text-gray-600 mb-6">Xin lỗi — trang bạn truy cập không tồn tại hoặc đã bị di chuyển.</p>
    <router-link to="/" class="inline-block bg-blue-600 text-white px-4 py-2 rounded">Quay về Trang chủ</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'NotFound' })
</script>

<style scoped>
/* rely on Tailwind */
</style>
