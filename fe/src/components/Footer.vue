<template>
  <footer class="mt-12 border-t bg-white">
    <div class="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
      <div>© {{ new Date().getFullYear() }} Road To Úc — Tài nguyên hướng dẫn & checklist</div>
      <div class="space-x-4">
        <a class="hover:text-gray-900" href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        <a class="hover:text-gray-900" href="#/">Docs</a>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'Footer' })
</script>

<style scoped>
/* minimal — rely on Tailwind */
</style>
