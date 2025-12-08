<template>
  <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <router-link to="/" class="group flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-all duration-200 scale-100 group-hover:scale-105">
              AU
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Road To Úc</span>
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <!-- Primary Navigation -->
          <ul class="flex items-center space-x-8">
            <li><router-link :to="'/'" :class="linkClass('/')">Trang chủ</router-link></li>
            <li><router-link :to="'/assessment'" :class="linkClass('/assessment')">Khảo sát</router-link></li>

            <!-- Combined Schools & Visas dropdown -->
            <li class="relative" data-primary-dropdown @mouseenter="onPrimaryEnter()" @mouseleave="onPrimaryLeave()">
              <button @click.prevent="togglePrimary()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-gray-100" :class="linkClass('/schools')">
                <span>Chọn trường</span>
                <svg class="w-4 h-4 transition-transform duration-200" :class="primaryOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div v-show="primaryOpen" class="absolute mt-2 w-48 right-0 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-200" @click.stop>
                <router-link to="/schools" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Chọn trường</router-link>
                <router-link to="/visas" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">Bảng visa</router-link>
              </div>
            </li>
          </ul>

          <!-- Grouped dropdowns (each group becomes its own hoverable menu) -->
          <div v-for="(group, gi) in groups" :key="gi" class="relative" data-group-dropdown @mouseenter="onGroupEnter(gi)" @mouseleave="onGroupLeave(gi)">
            <button
              data-group-btn
              @click.prevent="toggleGroup(gi)"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white/50 hover:bg-gray-100 border border-gray-200/50 rounded-2xl transition-all duration-200 hover:shadow-md"
            >
              <span>{{ group.label }}</span>
              <svg class="w-4 h-4 transition-transform duration-200" :class="openGroups[gi] ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-show="openGroups[gi]" data-group-menu class="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in duration-200" @click.stop>
              <div class="px-4 pb-2">
                <ul class="space-y-1">
                  <li v-for="item in group.items" :key="item.to">
                    <router-link :to="item.to" @click="closeAllGroups(); open = false" class="block px-3 py-2 rounded text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50">{{ item.label }}</router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="w-px h-6 bg-gradient-to-b from-gray-200 to-transparent mx-6"></div>

          <!-- Auth Section -->
          <div class="flex items-center space-x-3">
            <template v-if="user">
              <div class="flex items-center gap-2 text-sm text-gray-700 bg-gray-100/50 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {{ user.name?.charAt(0) || user.email?.charAt(0) }}
                </div>
                <span class="font-medium">{{ user.name || user.email.split('@')[0] }}</span>
              </div>
              <button 
                @click="logout" 
                class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                Đăng xuất
              </button>
            </template>
            <template v-else>
              <router-link 
                to="/login"
                class="px-5 py-2.5 text-sm font-semibold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                Đăng nhập
              </router-link>
            </template>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button 
            @click="open = !open" 
            class="p-2 rounded-2xl text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200 group"
            :aria-label="open ? 'Đóng menu' : 'Mở menu'"
          >
            <svg v-if="!open" class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-show="open" class="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-xl">
      <div class="px-4 pt-4 pb-6 space-y-3">
        <router-link 
          v-for="item in items" 
          :key="item.to" 
          :to="item.to" 
          @click="open = false"
          :class="mobileLinkClass(item.to)"
          class="block w-full"
        >
          {{ item.label }}
        </router-link>
        
        <!-- Mobile More Section -->
        <div class="pt-4 border-t border-gray-200">
          <div v-for="(group, gi) in groups" :key="gi" class="py-3">
            <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{{ group.label }}</div>
            <ul class="space-y-2">
              <li v-for="item in group.items" :key="item.to">
                <router-link 
                  :to="item.to" 
                  @click="open = false"
                  class="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                >
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- Mobile Auth -->
        <div class="pt-6 border-t border-gray-200 space-y-3">
          <template v-if="user">
            <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-sm font-bold text-white">
                {{ user.name?.charAt(0) || user.email?.charAt(0) }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">Xin chào,</div>
                <div class="text-sm text-gray-600">{{ user.name || user.email.split('@')[0] }}</div>
              </div>
            </div>
            <button 
              @click="logout; open = false" 
              class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-200 border border-red-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/login"
              @click="open = false"
              class="w-full block px-6 py-4 text-lg font-semibold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-center border border-gray-200"
            >
              Đăng nhập ngay
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  name: 'ModernNavBar',
  setup() {
    const open = ref(false)
    const openGroups = ref<boolean[]>([])
    const route = useRoute()
    const { user, logout } = useAuth()

    const items = [
      { to: '/', label: 'Trang chủ' },
      { to: '/assessment', label: 'Khảo sát' },
      { to: '/schools', label: 'Chọn trường' },
      { to: '/visas', label: 'Bảng visa' }
    ]

    const groups = [
          { 
        label: 'Công cụ & Tiện ích', 
        items: [ 
          { to: '/chatbot', label: 'Chatbot' }, 
          { to: '/reminders', label: 'Nhắc việc' }, 
          { to: '/work-types', label: 'Công việc' },
          { to: '/risk', label: 'Rủi ro & Khiếu nại' }
        ] 
      },
      { 
        label: 'Hướng dẫn & Tài liệu', 
        items: [ 
          { to: '/immi', label: 'ImmiGuide' }, 
          { to: '/gte', label: 'GTE' } 
        ] 
      },
      { 
        label: 'Học tập', 
        items: [ 
          { to: '/finance', label: 'Tài chính' }, 
          { to: '/english', label: 'Tiếng Anh' } 
        ] 
      }
    ]

    // initialize openGroups to match groups length
    openGroups.value = groups.map(() => false)

    // primary dropdown state for combined Schools/Visas with small hide-delay
    const primaryOpen = ref(false)
    let primaryCloseTimer: number | null = null
    function openPrimary() { if (primaryCloseTimer) { clearTimeout(primaryCloseTimer); primaryCloseTimer = null } ; primaryOpen.value = true }
    function closePrimary() { primaryOpen.value = false }
    function togglePrimary() { primaryOpen.value = !primaryOpen.value }
    function scheduleClosePrimary(ms = 180) {
      if (primaryCloseTimer) clearTimeout(primaryCloseTimer)
      primaryCloseTimer = window.setTimeout(() => { primaryOpen.value = false; primaryCloseTimer = null }, ms)
    }
    function onPrimaryEnter() { openPrimary() }
    function onPrimaryLeave() { scheduleClosePrimary() }

    function closeMenus(e: MouseEvent) {
      const target = e.target as HTMLElement
      // close group dropdowns if click outside
      if (!target.closest('[data-group-dropdown]')) {
        closeAllGroups()
      }
      // close primary dropdown if click outside
      if (!target.closest('[data-primary-dropdown]')) {
        primaryOpen.value = false
      }
    }

    // group open state with small hide-delay to avoid flicker
    const groupCloseTimers: Array<number | null> = []
    function openGroup(i: number) {
      if (groupCloseTimers[i]) { clearTimeout(groupCloseTimers[i] as number); groupCloseTimers[i] = null }
      openGroups.value[i] = true
    }
    function scheduleCloseGroup(i: number, ms = 180) {
      if (groupCloseTimers[i]) clearTimeout(groupCloseTimers[i] as number)
      groupCloseTimers[i] = window.setTimeout(() => { openGroups.value[i] = false; groupCloseTimers[i] = null }, ms)
    }
    function closeGroup(i: number) { openGroups.value[i] = false }
    function toggleGroup(i: number) { openGroups.value[i] = !openGroups.value[i] }
    function closeAllGroups() { openGroups.value = openGroups.value.map(() => false); for (let t of groupCloseTimers) if (t) clearTimeout(t as number) }
    function onGroupEnter(i: number) { openGroup(i) }
    function onGroupLeave(i: number) { scheduleCloseGroup(i) }

    onMounted(() => {
      document.addEventListener('click', closeMenus)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeMenus)
    })

    function linkClass(path: string) {
      const base = 'px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-gray-100'
      const active = route.path === path || route.path.startsWith(path + '/')
      return active 
        ? `${base} bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold` 
        : `${base} text-gray-700 hover:text-blue-600 hover:shadow-sm`
    }

    function mobileLinkClass(path: string) {
      const active = route.path === path
      return active 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500 shadow-lg' 
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
    }

    return { 
      open, 
      openGroups,
      openGroup,
      closeGroup,
      toggleGroup,
      closeAllGroups,
      onGroupEnter,
      onGroupLeave,
      primaryOpen,
      openPrimary,
      closePrimary,
      togglePrimary,
      onPrimaryEnter,
      onPrimaryLeave,
      items, 
      groups, 
      user, 
      logout, 
      linkClass, 
      mobileLinkClass 
    }
  }
})
</script>

<style scoped>
/* Custom animations for modern feel */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}
</style>
