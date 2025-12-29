<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Gửi tài liệu để kiểm tra</h1>
    <div class="bg-white p-4 rounded border">
      <div class="mb-3">
        <label class="text-sm font-medium">File (PDF/DOC/Images)</label>
        <input type="file" @change="onFile" />
      </div>
      <div class="mb-3">
        <label class="text-sm font-medium">Ghi chú</label>
        <textarea v-model="note" class="w-full border rounded p-2" />
      </div>
      <div class="flex items-center gap-3">
        <button @click="submit" class="px-3 py-2 bg-blue-600 text-white rounded">Gửi để kiểm tra</button>
        <button @click="buyReview" class="px-3 py-2 bg-yellow-100 text-yellow-800 rounded">Mua phiếu kiểm tra</button>
      </div>
      <div v-if="msg" class="mt-3 text-sm text-green-700">{{ msg }}</div>
      <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  setup() {
    const auth = useAuth()
    const fileBase64 = ref<string | null>(null)
    const note = ref('')
    const msg = ref('')
    const error = ref('')

    function onFile(e: Event) {
      const inp = e.target as HTMLInputElement
      if (!inp.files || !inp.files[0]) return
      const f = inp.files[0]
      const reader = new FileReader()
      reader.onload = () => { const res = reader.result as string; const base64 = res.split(',')[1]; fileBase64.value = base64 }
      reader.readAsDataURL(f)
    }

    async function submit() {
      error.value = ''
      msg.value = ''
      try {
        const token = auth.user.value?.token
        if (!token) { error.value = 'Vui lòng đăng nhập trước khi gửi tài liệu.'; return }
        if (!fileBase64.value) { error.value = 'Chưa có file để gửi.'; return }
        const resp = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ filename: 'upload', fileBase64: fileBase64.value, note: note.value }) })
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi gửi'; return }
        msg.value = 'Gửi thành công. Chúng tôi sẽ thông báo khi có kết quả.'
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    async function buyReview() {
      try {
        const token = auth.user.value?.token
        if (!token) { error.value = 'Vui lòng đăng nhập trước khi mua.'; return }
        const resp = await fetch('/api/reviews/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({}) })
        const j = await resp.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi tạo checkout'; return }
        if (j.url) window.location.href = j.url
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    return { onFile, submit, note, msg, error, buyReview }
  }
})
</script>

<style scoped>
</style>