<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Lộ trình tổng quát -->
    <Roadmap :currentStep="1" />
    <CostEstimator />

    <!-- Bảng  -->
    <VisaTable />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import Checklist from '../components/Checklist.vue'
import VisaTable from '../components/VisaTable.vue'
import VisaUpdates from '../components/VisaUpdates.vue'
import Roadmap from '../components/Roadmap.vue'
import CostEstimator from '../components/CostEstimator.vue'

export default defineComponent({
  name: 'Home',
  components: { Checklist, VisaTable, VisaUpdates, Roadmap, CostEstimator },
  setup() {
    const routes = [
      { id: 'assessment', title: 'Khảo sát khả năng', desc: 'Đánh giá nhanh điều kiện sang Úc' },
      { id: 'study', title: 'Du học', desc: 'Lộ trình Du học' },
      { id: 'schools', title: 'Chọn trường', desc: 'Gợi ý trường và ước tính chi phí' },
      { id: 'finance', title: 'Tài chính', desc: 'Công cụ tính chi phí & chuẩn bị tài chính' },
      { id: 'immi', title: 'Hướng dẫn Immi', desc: 'Tạo ImmiAccount và nộp hồ sơ' },
      { id: 'gte', title: 'GTE / Thư giải trình', desc: 'Hỗ trợ tạo bản nháp GTE' },
      { id: 'chatbot', title: 'Chatbot tư vấn', desc: 'Hỏi đáp 24/7 về visa & du học' },
      { id: 'checklist', title: 'Checklist hồ sơ', desc: 'Quản lý hồ sơ và nhắc việc' }
    ]

    function routeTo(id: string) {
      if (id === 'assessment') return '/assessment'
      if (id === 'schools') return '/schools'
      if (id === 'checklist') return '/reminders'
      return `/route/${id}`
    }

    return { routes, routeTo }
  }
})
</script>

<style scoped>
/* Styles via Tailwind utilities in templates */
</style>