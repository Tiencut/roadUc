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
