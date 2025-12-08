<template>
  <transition name="slide">
    <div v-if="visible" class="fixed inset-0 z-50 flex">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40" @click="emitClose"></div>

      <!-- Drawer -->
      <aside class="relative ml-auto w-full md:w-[540px] bg-white h-full shadow-2xl overflow-auto p-6">
        <button @click="emitClose" class="absolute top-4 right-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <header class="mb-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">{{ work.jobType }}</h2>
              <div class="text-sm text-gray-500">{{ work.region }} • {{ work.canExtend === 'CÓ' ? 'Có thể gia hạn' : 'Không gia hạn' }}</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-emerald-600">{{ work.pay }}</div>
              <div class="text-xs text-gray-500">{{ work.payWeekly }} / tuần</div>
            </div>
          </div>
        </header>

        <section class="space-y-4">
          <div>
            <h3 class="font-semibold">Thông tin tổng quan</h3>
            <p class="text-sm text-gray-700 mt-2">{{ work.detail }}</p>
            <ul class="mt-2 text-sm text-gray-600 space-y-1">
              <li><strong>Môi trường:</strong> {{ work.environment || 'Thường xuyên ngoài trời / theo mô tả' }}</li>
              <li v-if="work.shift"><strong>Ca làm:</strong> {{ work.shift }}</li>
              <li v-if="work.contractType"><strong>Loại hợp đồng:</strong> {{ work.contractType }}</li>
              <li v-if="work.seasonal"><strong>Mùa vụ:</strong> {{ work.seasonal }}</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">Điều kiện / Đầu vào</h3>
            <ul class="mt-2 text-sm text-gray-600 space-y-1">
              <li><strong>Visa thường gặp:</strong> <span class="text-gray-800">{{ work.suggestedVisas || '462/417; 482 có thể nếu sponsor' }}</span></li>
              <li><strong>Tuổi / Học vấn / Tiếng Anh:</strong> <span class="text-gray-800">{{ work.ageOrEdu || 'Không yêu cầu cao; tiếng Anh cơ bản' }}</span></li>
              <li><strong>Lý lịch tư pháp:</strong> <span class="text-gray-800">{{ work.police || 'Không tiền án; kiểm tra khi apply' }}</span></li>
              <li><strong>Tài chính tối thiểu:</strong> <span class="text-gray-800">{{ work.minFinance || 'Khoảng $2,000-$5,000 tuỳ đường bay / khu vực' }}</span></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">Giấy tờ thường dùng</h3>
            <ul class="mt-2 text-sm text-gray-600 space-y-1">
              <li>✔️ Hộ chiếu còn hạn</li>
              <li v-if="work.needsDriver"><span>✔️ Bằng lái (có thể cần chuyển đổi sau khi sang Úc)</span></li>
              <li>✔️ Chứng chỉ an toàn / White Card / Chainsaw / Forklift (nếu yêu cầu)</li>
              <li v-if="work.medical">✔️ Medical / Health check</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">Lộ trình đi Úc với công việc này</h3>
            <div class="mt-3 border-l-2 border-emerald-100 pl-4 space-y-3 text-sm">
              <div>
                <div class="font-semibold">Bước 1: Chuẩn bị tại Việt Nam</div>
                <div class="text-gray-600">Học & thi tiếng Anh, chuẩn bị tài chính, hộ chiếu, dịch thuật bằng cấp. Nếu là lái xe: lấy bằng B2 ở VN để dễ chuyển đổi.</div>
              </div>
              <div>
                <div class="font-semibold">Bước 2: Xin visa phù hợp</div>
                <div class="text-gray-600">Chuẩn bị hồ sơ, nộp online (462/417). Với diện tay nghề (482) cần employer sponsor — lưu ý điều kiện nghề & tay nghề.</div>
              </div>
              <div>
                <div class="font-semibold">Bước 3: Sang Úc & On-boarding</div>
                <div class="text-gray-600">Xin TFN, mở tài khoản ngân hàng, mua SIM, tìm chỗ ở gần job; tham gia training an toàn nếu employer yêu cầu.</div>
              </div>
              <div>
                <div class="font-semibold">Bước 4: Mục tiêu</div>
                <div class="text-gray-600">Ví dụ: hoàn thành 88 ngày regional để xin gia hạn hoặc chuyển sang job có sponsor.</div>
              </div>
            </div>
            <div class="mt-3 text-xs text-gray-500">Hiển thị theo dạng timeline: Bước — Nội dung + thời gian dự kiến</div>
          </div>
        </section>

        <footer class="mt-6 flex gap-3">
          <button @click="onSave" class="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700">Lưu vào lộ trình của tôi</button>
          <button @click="onCompare" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">So sánh</button>
          <button @click="onChecklist" class="px-4 py-2 rounded-xl bg-white text-gray-800 border border-gray-200">Xem checklist chuẩn bị</button>
        </footer>

      </aside>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'WorkTypeDetailDrawer',
  props: {
    work: { type: Object as PropType<Record<string, any>>, required: true },
    visible: { type: Boolean, required: true }
  },
  emits: ['close', 'save', 'compare', 'checklist'],
  methods: {
    emitClose() { this.$emit('close') },
    onSave() { this.$emit('save', this.work) },
    onCompare() { this.$emit('compare', this.work) },
    onChecklist() { this.$emit('checklist', this.work) }
  }
})
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 250ms ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0%);
  opacity: 1;
}
.slide-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
