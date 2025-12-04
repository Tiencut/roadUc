<template>
  <div>
    <ul class="space-y-2">
      <li v-for="item in items" :key="item.id" class="flex items-center">
        <label class="flex items-center gap-2 text-sm text-gray-800">
          <input class="h-4 w-4" type="checkbox" :checked="item.done" @change="toggle(item.id, $event)" />
          <span :class="{'line-through text-gray-400': item.done}">{{ item.text }}</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue'

type Item = { id: number; text: string; done: boolean }

export default defineComponent({
  name: 'Checklist',
  setup() {
    const key = 'fe_checklist_v1'
    const defaultItems: Item[] = [
      { id: 1, text: 'Hộ chiếu', done: false },
      { id: 2, text: 'Bằng tốt nghiệp', done: false },
      { id: 3, text: 'Bảng điểm', done: false }
    ]

    const items = reactive<Item[]>(JSON.parse(localStorage.getItem(key) || 'null') || defaultItems)

    watch(
      () => items,
      () => localStorage.setItem(key, JSON.stringify(items)),
      { deep: true }
    )

    function toggle(id: number, ev: Event) {
      const it = items.find(i => i.id === id)
      if (it) it.done = (ev.target as HTMLInputElement).checked
    }

    return { items, toggle }
  }
})
</script>

<style scoped>
/* layout handled with Tailwind utilities */
</style>
