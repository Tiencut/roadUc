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
    <div class="mt-6 bg-white p-4 border rounded">
      <h2 class="text-lg font-semibold">Ngân sách tham khảo theo bang (AUD / tháng)</h2>
      <table class="w-full text-sm mt-2 border-collapse">
        <tr class="bg-gray-100"><th class="p-2 text-left">Bang</th><th class="p-2 text-right">Sinh hoạt</th><th class="p-2 text-right">Tiền học (avg/year)</th></tr>
        <tr><td class="p-2">NSW (Sydney)</td><td class="p-2 text-right">1,800</td><td class="p-2 text-right">25,000</td></tr>
        <tr><td class="p-2">VIC (Melbourne)</td><td class="p-2 text-right">1,600</td><td class="p-2 text-right">23,000</td></tr>
        <tr><td class="p-2">QLD</td><td class="p-2 text-right">1,500</td><td class="p-2 text-right">20,000</td></tr>
      </table>

      <h3 class="font-semibold mt-4">Ví dụ thực tế</h3>
      <div class="text-sm">
        <p><strong>Case A — Sinh viên thạc sĩ (Sydney):</strong> Học phí 25,000 AUD/năm + sinh hoạt 1,800 AUD/tháng → ngân sách năm đầu ~ (25,000 + 1,800*12) = 46,600 AUD.</p>
        <p class="mt-2"><strong>Case B — WH 462 (Brisbane):</strong> Kế hoạch 6 tháng: sinh hoạt 1,500*6 = 9,000 AUD, cộng dự phòng 3,000 AUD.</p>
      </div>
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
