<template>
  <div>
    <table class="min-w-full text-sm border-collapse">
      <thead>
        <tr class="text-left text-xs text-gray-600">
          <th class="py-1">Mục</th>
          <th class="py-1">Chi tiết</th>
          <th class="py-1 text-right">Chi phí (AUD)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(d, idx) in details" :key="idx" class="border-t">
          <td class="py-1">{{ d.label || '-' }}</td>
          <td class="py-1">{{ d.desc || '-' }}</td>
          <td class="py-1 text-right">
            <span v-if="parseCostStr(d.cost)">
              {{ currency === 'AUD' ? formatRange(parseCostStr(d.cost)) : formatRangeVnd(parseCostStr(d.cost)) }}
            </span>
            <span v-else class="text-gray-500">{{ d.cost || '-' }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMoney } from '../composables/useMoney'

export default defineComponent({
  name: 'StepDetails',
  props: {
    details: { type: Array as () => any[], required: true },
    currency: { type: String as () => 'VND' | 'AUD', required: true }
  },
  setup() {
    const { parseCostStr, formatRange, formatRangeVnd } = useMoney()
    return { parseCostStr, formatRange, formatRangeVnd }
  }
})
</script>

<style scoped>
/* keep table compact to match Roadmap style */
</style>
