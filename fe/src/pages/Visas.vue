<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Danh sách & cập nhật visa</h1>
    <div class="bg-white p-4 rounded shadow">
      <VisaTable />
    </div>
    <div class="mt-4 text-sm text-gray-600">
      <p>Trang này chứa bảng tổng hợp visa, cập nhật và trạng thái. Bạn có thể tìm chi tiết từng loại bằng cách vào trang "Loại visa".</p>
    </div>
    
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VisaTable from '../components/VisaTable.vue'

export default defineComponent({
  name: 'Visas',
  components: { VisaTable }
})
</script>

<style scoped>
</style>
