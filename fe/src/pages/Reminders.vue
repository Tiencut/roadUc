<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-3">Nhắc việc & Cập nhật</h1>
    <div class="flex gap-2 mb-3">
      <input v-model="text" placeholder="Nội dung nhắc" class="flex-1 border rounded px-3 py-2" />
      <button @click="add" class="bg-green-600 text-white px-4 py-2 rounded">Thêm</button>
    </div>
    <ul class="space-y-2">
      <li v-for="r in reminders" :key="r.id" class="flex items-center justify-between p-2 border rounded">
        <span>{{ r.text }}</span>
        <button class="text-sm text-red-600" @click="remove(r.id)">X</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Reminders',
  setup() {
    const text = ref('')
    const reminders = ref<any[]>([])
    let id = 1
    function add() { if (!text.value) return; reminders.value.push({ id: id++, text: text.value }); text.value = '' }
    function remove(i:number) { reminders.value = reminders.value.filter(r=>r.id!==i) }
    return { text, add, reminders, remove }
  }
})
</script>

<style scoped>
.page { padding:1rem }
</style>
