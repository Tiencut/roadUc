<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-3">Chatbot Hỗ trợ</h1>
    <p class="text-sm text-gray-600 mb-3">Nhập câu hỏi (ví dụ: "Điều kiện visa du học là gì?")</p>
    <div class="flex gap-2">
      <input v-model="q" @keyup.enter="ask" placeholder="Gõ câu hỏi và Enter" class="flex-1 border rounded px-3 py-2" />
      <button @click="ask" class="bg-blue-600 text-white px-4 py-2 rounded">Hỏi</button>
    </div>
    <div v-if="answer" class="answer mt-4 p-3 bg-white border rounded text-sm">{{ answer }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Chatbot',
  setup() {
    const q = ref('')
    const answer = ref('')
    function ask() {
      // Local stub responses
      if (!q.value) return
      if (q.value.toLowerCase().includes('visa')) answer.value = 'Thông tin chung: visa du học subclass 500 yêu cầu COE, chứng minh tài chính, english.'
      else if (q.value.toLowerCase().includes('ielts')) answer.value = 'IELTS: nhiều trường yêu cầu >=6.0 cho diploma, >=6.5 cho bachelor.'
      else answer.value = 'Mình chưa biết trả lời chi tiết, hãy hỏi rõ hơn.'
    }
    return { q, ask, answer }
  }
})
</script>

<style scoped>
.page { padding:1rem }
.answer { margin-top:1rem; padding:0.5rem; border:1px solid #ddd }
</style>
