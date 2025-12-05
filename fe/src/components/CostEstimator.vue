<template>
  <div class="bg-white p-4 border rounded mb-6">
    <h3 class="text-lg font-semibold mb-3">Công cụ dự toán chi phí</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div></div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Chi phí sinh hoạt</label>
      </div>
    </div>

    <div class="mt-4 text-sm text-gray-600">
      Tỷ giá AUD → VND: <strong v-if="audToVnd">{{ formatDigits(audToVnd) }} VND</strong><span v-else> (đang tải...)</span>
    </div>

    <div class="mt-4">
      <h4 class="font-semibold">Tổng dự toán</h4>
      <div class="mt-2 overflow-x-auto">
        <table class="w-full table-auto text-sm border-collapse">
          <thead>
            <tr class="text-left border-b">
              <th class="p-2">Nhập</th>
              <th class="p-2">Mục</th>
              <th class="p-2">AUD</th>
              <th class="p-2">VND</th>
            </tr>
          </thead>
          <tbody>
                <tr class="border-b">
                  <td class="p-2"><input type="number" v-model.number="flight" class="w-28 border rounded px-2 py-1" min="0" /></td>
                  <td class="p-2">Vé máy bay</td>
                  <td class="p-2">{{ formatAud(flight) }}AUD</td>
                  <td class="p-2">{{ formatVnd(flightVnd) }}</td>
                </tr>
                <tr class="border-b">
                  <td class="p-2"><input type="number" v-model.number="insurance" class="w-28 border rounded px-2 py-1" min="0" /></td>
                  <td class="p-2">Bảo hiểm</td>
                  <td class="p-2">{{ formatAud(insurance) }}AUD</td>
                  <td class="p-2">{{ formatVnd(insuranceVnd) }}</td>
                </tr>
            <!-- Detail: monthly items (per month) -->
            <template v-if="showLivingDetails">
              <tr class="border-b">
                <td class="p-2"><input type="number" v-model.number="rentPerMonth" class="w-28 border rounded px-2 py-1" min="0" /></td>
                <td class="p-2">- Thuê nhà / tháng</td>
                <td class="p-2">{{ formatAud(rentPerMonth) }}AUD</td>
                <td class="p-2">{{ formatVnd(toVnd(rentPerMonth)) }}</td>
              </tr>
              <tr class="border-b">
                <td class="p-2"><input type="number" v-model.number="utilitiesPerMonth" class="w-28 border rounded px-2 py-1" min="0" /></td>
                <td class="p-2">- Tiện ích / tháng</td>
                <td class="p-2">{{ formatAud(utilitiesPerMonth) }}AUD</td>
                <td class="p-2">{{ formatVnd(toVnd(utilitiesPerMonth)) }}</td>
              </tr>
              <tr class="border-b">
                <td class="p-2"><input type="number" v-model.number="foodPerMonth" class="w-28 border rounded px-2 py-1" min="0" /></td>
                <td class="p-2">- Ăn uống / tháng</td>
                <td class="p-2">{{ formatAud(foodPerMonth) }}AUD</td>
                <td class="p-2">{{ formatVnd(toVnd(foodPerMonth)) }}</td>
              </tr>
              <tr class="border-b">
                <td class="p-2"><input type="number" v-model.number="transportPerMonth" class="w-28 border rounded px-2 py-1" min="0" /></td>
                <td class="p-2">- Di chuyển / tháng</td>
                <td class="p-2">{{ formatAud(transportPerMonth) }}AUD</td>
                <td class="p-2">{{ formatVnd(toVnd(transportPerMonth)) }}</td>
              </tr>
              <tr class="border-b">
                <td class="p-2"><input type="number" v-model.number="otherPerMonth" class="w-28 border rounded px-2 py-1" min="0" /></td>
                <td class="p-2">- Khác / tháng</td>
                <td class="p-2">{{ formatAud(otherPerMonth) }}AUD</td>
                <td class="p-2">{{ formatVnd(toVnd(otherPerMonth)) }}</td>
              </tr>
            </template>
            <!-- Total living for the entire duration (months input + toggle in left column) -->
            <tr class="border-b">
              <td class="p-2">
                <div class="flex items-center gap-2">
                  <input type="number" v-model.number="months" class="w-20 border rounded px-2 py-1" min="0" />
                  <button type="button" @click="showLivingDetails = !showLivingDetails" class="text-sm text-blue-600">{{ showLivingDetails ? 'Ẩn' : 'Xem' }}</button>
                </div>
              </td>
              <td class="p-2">Sinh hoạt ({{ months }} tháng)</td>
              <td class="p-2">{{ formatAud(livingTotal) }}AUD</td>
              <td class="p-2">{{ formatVnd(livingTotalVnd) }}</td>
            </tr>
            <tr class="border-b">
              <td class="p-2"><input type="number" v-model.number="visaFee" class="w-20 border rounded px-2 py-1" min="0" /></td>
              <td class="p-2">Phí visa</td>
              <td class="p-2">{{ formatAud(visaFee) }}AUD</td>
              <td class="p-2">{{ formatVnd(visaFeeVnd) }}</td>
            </tr>
            <tr class="border-b">
              <td class="p-2"><input type="number" v-model.number="bufferPercent" class="w-20 border rounded px-2 py-1" min="0" max="100" /></td>
              <td class="p-2">Dự phòng ({{ bufferPercent }}%)</td>
              <td class="p-2">{{ formatAud(bufferAmount) }}AUD</td>
              <td class="p-2">{{ formatVnd(bufferAmountVnd) }}</td>
            </tr>
            <tr><td class="p-2 font-semibold"></td><td class="p-2 font-semibold">Tổng</td><td class="p-2 font-semibold">{{ formatAud(totalAud) }}AUD</td><td class="p-2 font-semibold">{{ formatVnd(totalVnd) }}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <button @click="save" class="bg-blue-600 text-white px-4 py-2 rounded">Lưu ước tính</button>
      <button @click="reset" class="px-3 py-2 border rounded">Reset</button>
      <div class="ml-auto text-sm text-gray-600">Lưu trữ: <em>localStorage.latest_estimate</em></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  name: 'CostEstimator',
  setup() {
    const months = ref<number>(3)
    // Monthly breakdown fields (detailed)
    const rentPerMonth = ref<number>(800)
    const utilitiesPerMonth = ref<number>(150)
    const foodPerMonth = ref<number>(150)
    const transportPerMonth = ref<number>(50)
    const otherPerMonth = ref<number>(50)
    const livingPerMonth = computed(() => Math.round((rentPerMonth.value || 0) + (utilitiesPerMonth.value || 0) + (foodPerMonth.value || 0) + (transportPerMonth.value || 0) + (otherPerMonth.value || 0)))
    const flight = ref<number>(1200)
    const insurance = ref<number>(200)
    const visaFee = ref<number>(650)
    const bufferPercent = ref<number>(10)

    // Provide a sensible default so VND values are available immediately
    // while we fetch the latest rate. We also track loading state so the UI
    // can indicate when the live rate is still being retrieved.
    const audToVnd = ref<number | null>(16000)
    const audRateLoading = ref<boolean>(true)
    // Toggle to show/hide detailed monthly inputs and rows
    const showLivingDetails = ref<boolean>(false)

    onMounted(async () => {
      try {
        const r = await fetch('https://api.exchangerate.host/latest?base=AUD&symbols=VND')
        const d = await r.json()
        if (d && d.rates && typeof d.rates.VND === 'number') audToVnd.value = d.rates.VND
      } catch (e) {
        // keep the default fallback already set above
      } finally {
        audRateLoading.value = false
      }
    })

    const livingTotal = computed(() => Math.round((livingPerMonth.value || 0) * (months.value || 0)))
    const subtotalAud = computed(() => (flight.value || 0) + (insurance.value || 0) + livingTotal.value + (visaFee.value || 0))
    const bufferAmount = computed(() => Math.round(subtotalAud.value * ((bufferPercent.value || 0) / 100)))
    const totalAud = computed(() => subtotalAud.value + bufferAmount.value)

    // VND conversions — use the current `audToVnd` value (fallback available)
    const toVnd = (aud: number) => {
      if (!audToVnd.value) return null
      return Math.round((aud || 0) * audToVnd.value)
    }

    const flightVnd = computed(() => toVnd(flight.value))
    const insuranceVnd = computed(() => toVnd(insurance.value))
    const livingTotalVnd = computed(() => toVnd(livingTotal.value))
    const visaFeeVnd = computed(() => toVnd(visaFee.value))
    const bufferAmountVnd = computed(() => toVnd(bufferAmount.value))
    const totalVnd = computed(() => toVnd(totalAud.value))

    function formatDigits(n: number | null | undefined) {
      if (n === null || n === undefined || Number.isNaN(n)) return '-'
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const formatAud = (v: number) => `${formatDigits(v)} `
    const formatVnd = (v: number | null | undefined) => {
      if (v === null || v === undefined || Number.isNaN(v)) return '-'
      return `${formatDigits(v)} VND`
    }

    function save() {
      try {
        const snapshot = {
          months: months.value,
          livingPerMonth: livingPerMonth.value,
          rentPerMonth: rentPerMonth.value,
          utilitiesPerMonth: utilitiesPerMonth.value,
          foodPerMonth: foodPerMonth.value,
          transportPerMonth: transportPerMonth.value,
          otherPerMonth: otherPerMonth.value,
          flight: flight.value,
          insurance: insurance.value,
          visaFee: visaFee.value,
          bufferPercent: bufferPercent.value,
          totalAud: totalAud.value,
          totalVnd: totalVnd.value,
          audToVnd: audToVnd.value
        }
        localStorage.setItem('latest_estimate', JSON.stringify(snapshot))
        alert('Đã lưu ước tính')
      } catch (e) {
        // ignore
      }
    }

    function reset() {
      months.value = 3
      rentPerMonth.value = 800
      utilitiesPerMonth.value = 150
      foodPerMonth.value = 150
      transportPerMonth.value = 50
      otherPerMonth.value = 50
      flight.value = 1200
      insurance.value = 200
      visaFee.value = 650
      bufferPercent.value = 10
    }

    return { months, rentPerMonth, utilitiesPerMonth, foodPerMonth, transportPerMonth, otherPerMonth, livingPerMonth, flight, insurance, visaFee, bufferPercent, audToVnd, audRateLoading, showLivingDetails, livingTotal, bufferAmount, totalAud, flightVnd, insuranceVnd, livingTotalVnd, visaFeeVnd, bufferAmountVnd, totalVnd, formatDigits, formatAud, formatVnd, toVnd, save, reset }
  }
})
</script>

<style scoped>
</style>
