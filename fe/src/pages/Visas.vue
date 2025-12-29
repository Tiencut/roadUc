<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="bg-white p-4 rounded shadow">
      <VisaTable />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VisaTable from '../components/VisaTable.vue'

export default defineComponent({
  name: 'Visas',
  components: { VisaTable }
})
</script>

<style scoped>
</style>
