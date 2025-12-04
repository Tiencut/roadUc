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
