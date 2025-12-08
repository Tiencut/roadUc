<template>
  <div class="english">
    <h1>Chuyển đổi điểm Tiếng Anh</h1>
    <form @submit.prevent="convert">
      <label>IELTS: <input type="number" step="0.5" v-model.number="ielts" /></label>
      <button type="submit">Chuyển</button>
    </form>
    <div v-if="result">
      <p>CEFR: <strong>{{ result.cefr }}</strong></p>
      <p>PTE: <strong>{{ result.pte }}</strong></p>
    </div>
    <div class="mt-6 bg-white p-4 border rounded">
      <h2 class="text-lg font-semibold">Lộ trình ôn 3 tháng (ví dụ mục tiêu PTE 42 / IELTS 6.0)</h2>
      <ol class="list-decimal pl-5 mt-2 text-sm">
        <li><strong>Tháng 1:</strong> đánh giá, ôn ngữ pháp nền tảng, nghe & vocabulary (20-30 giờ/tháng).</li>
        <li><strong>Tháng 2:</strong> luyện reading/writing theo đề, làm bài theo thời gian, tham gia 1 mock test/2 tuần.</li>
        <li><strong>Tháng 3:</strong> tập trung speaking, full test hàng tuần, chỉnh chiến thuật thi.</li>
      </ol>
      <h3 class="font-semibold mt-3">Checklist & tips</h3>
      <ul class="list-disc pl-5 text-sm">
        <li>Lập kế hoạch học hàng tuần, ghi nhật ký từ vựng chuyên ngành.</li>
        <li>Ghi âm speaking practice và so sánh với mẫu band.</li>
        <li>Dành 1 ngày/tuần review các lỗi thường gặp trong writing.</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

function ieltsToCefr(score: number) {
  if (score >= 8) return 'C2'
  if (score >= 6.5) return 'C1'
  if (score >= 5) return 'B2'
  return 'B1 or below'
}

function ieltsToPte(score: number) {
  if (score >= 8) return 79
  if (score >= 6.5) return 65
  if (score >= 5) return 50
  return 36
}

export default defineComponent({
  name: 'English',
  setup() {
    const ielts = ref<number | null>(null)
    const result = ref<{ cefr: string; pte: number } | null>(null)

    function convert() {
      const s = ielts.value || 0
      result.value = { cefr: ieltsToCefr(s), pte: ieltsToPte(s) }
    }

    return { ielts, result, convert }
  }
})
</script>

<style scoped>
form label { display:block; margin:6px 0 }
</style>
