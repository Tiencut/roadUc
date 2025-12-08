<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Hỗ trợ viết GTE / Thư giải trình</h1>
    <form @submit.prevent="generate" class="space-y-3 bg-white p-4 border rounded">
      <div>
        <label class="block text-sm">Họ tên</label>
        <input class="mt-1 block w-full border rounded px-2 py-1" v-model="name" />
      </div>
      <div>
        <label class="block text-sm">Ngành học / Mục tiêu</label>
        <input class="mt-1 block w-full border rounded px-2 py-1" v-model="course" />
      </div>
      <div>
        <label class="block text-sm">Tóm tắt profile (khoảng 2-3 câu)</label>
        <textarea class="mt-1 block w-full border rounded px-2 py-1" v-model="profile"></textarea>
      </div>
      <div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Tạo bản nháp</button>
      </div>
    </form>

    <div v-if="draft" class="mt-4">
      <h2 class="text-lg font-semibold">Bản nháp GTE (hãy chỉnh sửa trước khi dùng)</h2>
      <textarea class="mt-2 block w-full border rounded px-2 py-2" v-model="draft" rows="10"></textarea>
      <div class="mt-4 bg-gray-50 p-3 rounded">
        <h3 class="font-semibold">Mẫu dàn ý GTE</h3>
        <ol class="list-decimal pl-5 text-sm mt-2">
          <li>Giới thiệu bản thân và lý do chọn chương trình.</li>
          <li>Trình bày liên hệ giữa kinh nghiệm/lý lịch học tập và chương trình chọn.</li>
          <li>Giải thích mục tiêu nghề nghiệp sau khi hoàn thành (về VN hay Úc).</li>
          <li>Chứng minh tài chính & ràng buộc ở Việt Nam (gia đình, hợp đồng lao động, tài sản).</li>
          <li>Kết luận và cam kết tuân thủ quy định visa.</li>
        </ol>
        <h3 class="font-semibold mt-3">Chứng cứ thường dùng (checklist)</h3>
        <ul class="list-disc pl-5 text-sm">
          <li>Hợp đồng lao động / thư xác nhận công việc</li>
          <li>Sao kê ngân hàng / giấy tờ sở hữu tài sản</li>
          <li>Giấy đăng ký kinh doanh / sổ đỏ (nếu có)</li>
          <li>Thư mời học / Offer letter</li>
        </ul>
        <h3 class="font-semibold mt-3">Lý do bị từ chối hay lỗi thường gặp</h3>
        <ul class="list-disc pl-5 text-sm">
          <li>GTE quá chung chung, không nêu ràng buộc tại Việt Nam.</li>
          <li>Chứng minh tài chính thiếu minh bạch.</li>
          <li>Tài liệu không hợp lệ hoặc không được công chứng đúng chuẩn.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'GTEHelper',
  setup() {
    const name = ref('')
    const course = ref('')
    const profile = ref('')
    const draft = ref('')

    function generate() {
      draft.value = `Kính gửi cơ quan xét duyệt,\nTôi tên ${name.value}. Tôi dự định theo học ${course.value}. ${profile.value} Tôi cam kết... (hãy hoàn thiện và cá nhân hoá)`
    }

    return { name, course, profile, generate, draft }
  }
})
</script>

<style scoped>
.page { padding:1rem }
form label { display:block; margin:0.5rem 0 }
</style>
