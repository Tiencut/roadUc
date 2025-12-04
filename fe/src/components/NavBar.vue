<template>
  <nav class="bg-white border-b">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">AU</div>
            <span class="text-lg font-semibold text-gray-800">Road To Úc</span>
          </router-link>
        </div>

        <!-- Desktop menu -->
        <div class="hidden md:flex md:items-center md:space-x-6">
          <ul class="flex items-center space-x-4 text-sm text-gray-700">
            <li>
              <router-link :to="'/'" :class="linkClass('/')">Home</router-link>
            </li>
            <li>
              <router-link :to="'/assessment'" :class="linkClass('/assessment')">Khảo sát</router-link>
            </li>
            <li>
              <router-link :to="'/schools'" :class="linkClass('/schools')">Chọn trường</router-link>
            </li>
            <li>
              <router-link :to="'/finance'" :class="linkClass('/finance')">Tài chính</router-link>
            </li>
            <li>
              <router-link :to="'/english'" :class="linkClass('/english')">Tiếng Anh</router-link>
            </li>
            <li>
              <router-link :to="'/immi'" :class="linkClass('/immi')">ImmiGuide</router-link>
            </li>
            <li>
              <router-link :to="'/gte'" :class="linkClass('/gte')">GTE</router-link>
            </li>
            <li>
              <router-link :to="'/chatbot'" :class="linkClass('/chatbot')">Chatbot</router-link>
            </li>
            <li>
              <router-link :to="'/reminders'" :class="linkClass('/reminders')">Nhắc việc</router-link>
            </li>
          </ul>

          <!-- Divider before auth area (desktop) -->
          <div class="hidden md:block border-l border-gray-200 h-6 mx-3" aria-hidden="true"></div>

          <!-- Auth area -->
          <div class="hidden md:flex items-center space-x-4">
            <template v-if="user">
              <div class="text-sm text-gray-700">Hi, <strong>{{ user.name || user.email }}</strong></div>
              <button @click="logout" class="text-sm text-red-600 hover:text-red-800">Đăng xuất</button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-sm text-gray-700 hover:text-gray-900">Đăng nhập</router-link>
            </template>
          </div>
        </div>

        <!-- Mobile button -->
        <div class="md:hidden">
          <button @click="open = !open" aria-label="Toggle menu" class="p-2 rounded-md text-gray-700 hover:bg-gray-100">
            <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div v-show="open" class="md:hidden border-t">
      <div class="px-4 pt-2 pb-4 space-y-1">
        <router-link v-for="item in items" :key="item.to" :to="item.to" :class="mobileLinkClass(item.to)">
          {{ item.label }}
        </router-link>
        <!-- mobile auth -->
        <div class="pt-3 border-t mt-2">
          <div v-if="user" class="pt-2">
            <div class="text-sm text-gray-700">Hi, <strong>{{ user.name || user.email }}</strong></div>
            <button @click="logout" class="mt-2 w-full text-left text-red-600">Đăng xuất</button>
          </div>
          <div v-else class="pt-2">
            <router-link to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Đăng nhập</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  name: 'NavBar',
  setup() {
    const open = ref(false)
    const route = useRoute()
    const { user, logout } = useAuth()

    const items = [
      { to: '/', label: 'Home' },
      { to: '/assessment', label: 'Khảo sát' },
      { to: '/schools', label: 'Chọn trường' },
      { to: '/finance', label: 'Tài chính' },
      { to: '/english', label: 'Tiếng Anh' },
      { to: '/immi', label: 'ImmiGuide' },
      { to: '/gte', label: 'GTE' },
      { to: '/chatbot', label: 'Chatbot' },
      { to: '/reminders', label: 'Nhắc việc' }
    ]

    function linkClass(path: string) {
      const base = 'hover:text-gray-900'
      return (route.path === path || route.path.startsWith(path + '/')) ? `${base} text-blue-600 font-semibold` : `${base} text-gray-700`
    }

    function mobileLinkClass(path: string) {
      return (route.path === path) ? 'block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-gray-50' : 'block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50'
    }

    return { open, items, linkClass, mobileLinkClass, user, logout }
  }
})
</script>

<style scoped>
/* keep styling to Tailwind utilities; scoped placeholder in case we need overrides */
</style>
