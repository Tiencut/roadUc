<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Hero / Intro -->
    <section class="bg-white rounded shadow p-6 mb-6">
      <div class="md:flex md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Road To Australia</h1>
          <p class="mt-2 text-gray-700">Road To Australia là nền tảng hướng dẫn, đánh giá và hỗ trợ chuẩn bị hồ sơ cho người mong muốn sang Úc: du học, Working Holiday (462) hoặc di trú tay nghề. Dành cho sinh viên, người đi làm và người muốn tìm cơ hội sống/việc tại Úc.</p>
          <div class="mt-4 flex gap-3">
            <button @click="goTo('assessment')" class="px-4 py-2 bg-blue-600 text-white rounded">Bắt đầu khảo sát</button>
            <button @click="goTo('finance')" class="px-4 py-2 border rounded">Tính nhanh chi phí</button>
            <button @click="goTo('roadmap')" class="px-4 py-2 border rounded">Xem trình bày cho người mới</button>
            <button @click="goTo('visas')" class="px-4 py-2 border rounded">Xem loại visa</button>
          </div>
        </div>
        <div class="mt-4 md:mt-0">
          <div class="bg-gray-50 p-3 rounded">
            <div class="font-medium">Ví dụ người dùng</div>
            <ul class="text-sm text-gray-700 mt-2 space-y-2">
              <li><strong>Sinh viên mới tốt nghiệp:</strong> muốn học thạc sĩ, cần IELTS/PTE, ngân sách học + sinh hoạt, lộ trình hồ sơ 6-12 tháng.</li>
              <li><strong>Người đi WH 462:</strong> dưới 31 tuổi, tìm việc tạm thời, cần kế hoạch chi phí 6 tháng, thông tin bảo hiểm/y tế và công việc mùa vụ.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Lợi ích khi sang Úc -->
    <section class="bg-white rounded shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-3">Lợi ích khi sang Úc</h2>
      <div class="grid md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Chất lượng giáo dục:</strong> Các trường đại học và chương trình đào tạo có uy tín toàn cầu, bằng cấp được công nhận rộng rãi.</li>
            <li><strong>Cơ hội làm thêm:</strong> Du học sinh được làm part-time, giúp giảm chi phí sinh hoạt và tích luỹ kinh nghiệm làm việc.</li>
            <li><strong>Quyền lợi y tế và an sinh:</strong> Hệ thống y tế và an toàn xã hội tốt; có chương trình bảo hiểm dành cho du học sinh (OSHC).</li>
            <li><strong>Tiếng Anh nhanh tiến bộ:</strong> Môi trường nói tiếng Anh giúp nâng cao kỹ năng giao tiếp và chuyên môn nhanh hơn.</li>
          </ul>
        </div>
        <div>
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Khả năng xin việc sau tốt nghiệp:</strong> Có lộ trình Post-Study Work visas, nhiều cơ hội nghề nghiệp cho sinh viên tốt nghiệp.</li>
            <li><strong>Đa văn hoá & an toàn:</strong> Xã hội đa dạng, tôn trọng văn hoá, môi trường sống an toàn cho gia đình.</li>
            <li><strong>Con đường định cư:</strong> Một số chương trình học và kinh nghiệm làm việc có thể mở cửa cho visa diện tay nghề và thường trú.</li>
            <li><strong>Phát triển sự nghiệp dài hạn:</strong> Cơ hội networking, thăng tiến và chuyển đổi kỹ năng phù hợp với thị trường toàn cầu.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Lộ trình tổng quát -->
    <Roadmap :currentStep="1" />

    <!-- Link to Visas page -->
    <!-- <div class="mt-6">
      <div class="bg-white p-4 rounded shadow flex items-center justify-between">
        <div>
          <div class="font-semibold">Bảng trạng thái visa</div>
          <div class="text-sm text-gray-600">Xem tổng quan các tuyến visa, trạng thái và cập nhật.</div>
        </div>
        <div>
          <button @click="goTo('visas')" class="px-4 py-2 bg-blue-600 text-white rounded">Xem bảng visa</button>
        </div>
      </div>
    </div> -->

    <!-- Testimonials -->
    <!-- <Testimonials class="mt-8" /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import Checklist from '../components/Checklist.vue'
import VisaUpdates from '../components/VisaUpdates.vue'
import Roadmap from '../components/Roadmap.vue'
import CostEstimator from '../components/CostEstimator.vue'
import Testimonials from '../components/Testimonials.vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Home',
  components: { Checklist, VisaUpdates, Roadmap, CostEstimator, Testimonials },
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

    const router = useRouter()
    function routeTo(id: string) {
      if (id === 'assessment') return '/assessment'
      if (id === 'schools') return '/schools'
      if (id === 'checklist') return '/reminders'
      return `/route/${id}`
    }
    function goTo(id: string) {
      if (id === 'finance') return router.push('/finance')
      if (id === 'roadmap') return router.push('/')
      if (id === 'visas') return router.push('/visas')
      return router.push(routeTo(id))
    }

    return { routes, routeTo, goTo }
  }
})
</script>

<style scoped>
/* Styles via Tailwind utilities in templates */
</style>