<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Road To Úc — Lộ trình</h1>
    </header>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <router-link v-for="route in routes" :key="route.id" :to="routeTo(route.id)" class="block p-4 border rounded-lg hover:shadow">
            <h2 class="text-lg font-semibold">{{ route.title }}</h2>
            <p class="text-sm text-gray-600">{{ route.desc }}</p>
          </router-link>
        </div>

        <section class="mt-6 bg-white p-4 rounded-lg border">
          <h2 class="font-semibold mb-2">Tự đánh giá nhanh</h2>
          <p class="text-sm text-gray-600">Bài đánh giá chi tiết đã được gom vào trang Khảo sát — hãy mở trang Khảo sát để làm bài đầy đủ (bao gồm tài chính và đề xuất lộ trình).</p>
          <div class="mt-3">
            <router-link to="/assessment" class="inline-block bg-blue-600 text-white px-4 py-2 rounded">Mở Khảo sát</router-link>
          </div>
        </section>
      </div>

      <aside class="bg-white p-4 rounded-lg border">
        <h2 class="font-semibold mb-2">Checklist mẫu</h2>
        <Checklist />
      </aside>
    </section>

    <VisaTable />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import Checklist from '../components/Checklist.vue'
import VisaTable from '../components/VisaTable.vue'

export default defineComponent({
  name: 'Home',
  components: { Checklist, VisaTable },
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