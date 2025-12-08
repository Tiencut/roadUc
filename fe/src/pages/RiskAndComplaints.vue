<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Rủi ro & Khiếu nại (Agency)</h1>
    <p class="text-sm text-gray-600 mb-6">Nếu bạn đang cân nhắc thuê agency hoặc lo ngại rủi ro — các công cụ bên dưới giúp tự đánh giá, ghi lại sự kiện, và hướng dẫn cách xử lý.</p>

    <div class="space-y-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <RiskQuiz />
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <RiskChecklist />
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <FraudReport />
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <EventTimeline />
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <CasesLibrary />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RiskQuiz from '../components/risk/RiskQuiz.vue'
import RiskChecklist from '../components/risk/RiskChecklist.vue'
import FraudReport from '../components/risk/FraudReport.vue'
import EventTimeline from '../components/risk/EventTimeline.vue'
import CasesLibrary from '../components/risk/CasesLibrary.vue'
</script>

<style scoped></style>
