<template>
  <div id="app-root" class="min-h-screen bg-gray-50 text-gray-900">
    <div class="flex">
      <Sidebar />
      <main class="flex-1">
        <router-view />
      </main>
    </div>
    <Footer/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Footer from './components/Footer.vue'
import Sidebar from './components/Sidebar.vue'

export default defineComponent({
  name: 'App',
  components: { Footer, Sidebar }
})
</script>


<style>
/* global styles are in src/styles.css */
</style>
