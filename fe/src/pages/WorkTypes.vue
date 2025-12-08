<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Các công việc phổ biến</h1>
    <div class="bg-white p-4 rounded shadow">
      <WorkTypesTable />
    </div>
    <div class="mt-4 text-sm text-gray-600">
      <p>Trang này liệt kê các công việc theo ngành, với dữ liệu mô tả và mức lương tham khảo.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import WorkTypesTable from '../components/WorkTypesTable.vue'

export default defineComponent({
  name: 'WorkTypes',
  components: { WorkTypesTable }
})
</script>

<style scoped>
</style>
