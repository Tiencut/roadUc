<template>
  <div class="route-detail">
    <h1>{{ route.title }}</h1>
    <p>{{ route.desc }}</p>
    <h3>Điều kiện</h3>
    <ul>
      <li v-for="(c, i) in conditions" :key="i">{{ c }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

const ROUTES = {
  '462': { title: 'Work & Holiday (462)', desc: 'Thông tin Work & Holiday', conditions: ['Tuổi hợp lệ', 'Hộ chiếu', 'Tài chính'] },
  'study': { title: 'Du học', desc: 'Thông tin Du học', conditions: ['Thư mời', 'Bằng cấp', 'Chi phí'] },
  'skilled': { title: 'Lao động Tay nghề', desc: 'Thông tin Lao động tay nghề', conditions: ['Điểm skill', 'Kinh nghiệm'] },
  'tourist': { title: 'Du lịch', desc: 'Thông tin Du lịch', conditions: ['Hộ chiếu', 'Trả phí'] }
}

export default defineComponent({
  name: 'RouteDetail',
  setup() {
    const r = useRoute()
    const id = (r.params.id as string) || 'study'
    const route = ROUTES[id] || ROUTES['study']
    return { route, conditions: route.conditions }
  }
})
</script>

<style scoped>
.route-detail { padding:1rem }
</style>
