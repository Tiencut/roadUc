<template>
  <div id="app-root" class="min-h-screen bg-gray-50 text-gray-900">
    <NavBar />
    <main class="py-8">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

export default defineComponent({
  name: 'App',
  components: { NavBar, Footer }
})
</script>

<style>
/* global styles are in src/styles.css */
</style>
