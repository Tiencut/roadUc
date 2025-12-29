<template>
  <div class="max-w-3xl mx-auto bg-white p-6 shadow rounded">
    <h1 class="text-2xl font-semibold mb-2">{{ step?.title }}</h1>
    <p class="text-gray-700 mb-4">{{ step?.content }}</p>

    <div v-if="isCompleted" class="mb-4 p-3 bg-green-50 border border-green-100 text-green-800 rounded">You completed this step ✅</div>

    <div class="flex gap-3">
      <button @click="prev" class="px-4 py-2 rounded border">Previous</button>
      <button v-if="!isCompleted" @click="markComplete" class="px-4 py-2 rounded bg-blue-600 text-white">Mark complete & Next</button>
      <button v-if="isCompleted && !isLast" @click="next" class="px-4 py-2 rounded bg-blue-600 text-white">Next</button>
      <div v-if="isLast && isCompleted" class="ml-auto text-green-600 font-semibold">🎉 Full knowledge unlocked!</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { steps } from '../lib/learning'

const STORAGE_KEY = 'learning.completed'

export default defineComponent({
  name: 'LearningStep',
  setup () {
    const router = useRouter()
    const route = useRoute()

    const id = Number(route.params.id || 1)
    const step = steps.find(s => s.id === id)

    function getProgress (): number[] {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as number[] } catch (e) { return [] }
    }

    function saveProgress (arr: number[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) }

    const isLast = computed(() => id === steps[steps.length - 1].id)
    const isCompleted = computed(() => getProgress().includes(id))

    function markComplete () {
      const p = getProgress()
      if (!p.includes(id)) p.push(id)
      saveProgress(p)
      // go to next step if exists
      const nextId = (steps.find(s => s.id === id + 1) || null)
      if (nextId) router.push({ path: `/learning/step/${nextId.id}` })
    }

    function next () {
      const nextStep = steps.find(s => s.id === id + 1)
      if (nextStep) router.push({ path: `/learning/step/${nextStep.id}` })
    }

    function prev () {
      const prevStep = steps.find(s => s.id === id - 1)
      if (prevStep) router.push({ path: `/learning/step/${prevStep.id}` })
    }

    return { step, isLast, isCompleted, markComplete, next, prev }
  }
})
</script>

<style scoped>
</style>
