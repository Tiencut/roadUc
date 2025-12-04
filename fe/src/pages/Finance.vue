<template>
  <div class="finance">
    <h1>Máy tính Tài chính</h1>
    <form @submit.prevent="calc">
      <label>Chi phí ước tính (AUD): <input type="number" v-model.number="cost" /></label>
      <label>Số tiền tiết kiệm hiện có (AUD): <input type="number" v-model.number="savings" /></label>
      <label>Thời gian (tháng): <input type="number" v-model.number="months" /></label>
      <button type="submit">Tính</button>
    </form>
    <div v-if="result" class="mt-4 bg-white p-4 border rounded">
      <p>Số tiền cần thêm: <strong>{{ formatCurrency(result.shortfall) }}</strong></p>
      <p>Gợi ý tiết kiệm hàng tháng: <strong>{{ formatCurrency(result.monthly) }}</strong></p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Finance',
  setup() {
    const cost = ref<number | null>(null)
    const savings = ref<number | null>(0)
    const months = ref<number | null>(6)
    const result = ref<{ shortfall: number; monthly: number } | null>(null)

    function calc() {
      const c = cost.value || 0
      const s = savings.value || 0
      const m = months.value && months.value > 0 ? months.value : 1
      const shortfall = Math.max(0, c - s)
      const monthly = Math.ceil(shortfall / m)
      result.value = { shortfall, monthly }
    }

    function formatCurrency(n: number) {
      return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n)
    }

    return { cost, savings, months, result, calc, formatCurrency }
  }
})
</script>

<style scoped>
form label { display:block; margin:6px 0 }
</style>
