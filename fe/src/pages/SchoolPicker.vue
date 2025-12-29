<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <div class="bg-white p-6 rounded shadow">
      <div class="font-semibold">Trang chọn trường đã được tích hợp vào Lộ trình (Roadmap).</div>
      <div class="text-sm text-gray-600 mt-2">Vui lòng mở Lộ trình và chọn "Chọn trường (tùy chọn)" tại bước "Học & tích lũy kinh nghiệm".</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SchoolPickerPage',
  setup() {
    const router = useRouter()
    // redirect to plan create or roadmap
    onMounted(() => {
      setTimeout(() => router.push('/'), 400)
    })
    return {}
  }
})
</script>

<style scoped>
</style>
