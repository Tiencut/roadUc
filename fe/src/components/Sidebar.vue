<template>
  <aside class="w-64 bg-white border-r h-screen p-4 hidden md:block flex flex-col overflow-hidden">
    <!-- Brand -->
    <div class="flex items-center gap-3 mb-6">
      <router-link
        to="/"
        class="group flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
      >
        <div
          class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl"
        >
          AU
        </div>
        <span class="text-lg font-bold">Road To Úc</span>
      </router-link>
    </div>

    <!-- Quick start -->
    <div class="mb-4 p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg border border-blue-100">
      <div class="text-sm font-semibold mb-2">Bắt đầu nhanh</div>
      <ol class="list-decimal ml-4 space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <div class="font-medium">1.</div>
          <div class="flex-1">
            Tạo kế hoạch cá nhân
            <button
              @click="goCreatePlan"
              class="ml-3 text-xs px-2 py-1 bg-blue-600 text-white rounded"
            >
              Tạo ngay
            </button>
          </div>
        </li>
        <li class="flex items-start gap-2">
          <div class="font-medium">2.</div>
          <div class="flex-1">Xem & tuỳ chỉnh roadmap trên trang Kế hoạch</div>
        </li>
        <li class="flex items-start gap-2">
          <div class="font-medium">3.</div>
          <div class="flex-1">
            Xuất PDF / Tự điền mẫu (Premium)
            <button
              @click="goBilling"
              class="ml-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
            >
              Nâng cấp
            </button>
          </div>
        </li>
      </ol>
    </div>

    <!-- Unified navigation -->
    <nav class="space-y-4 mb-6 flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] pr-2">
      <div v-for="section in navSections" :key="section.label">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {{ section.label }}
        </div>
        <ul class="space-y-1">
          <li v-for="item in section.items" :key="item.to || item.label" class="flex items-center justify-between">
            <router-link :to="item.to || '#'" class="flex-1 px-2 py-1 rounded text-sm truncate whitespace-nowrap overflow-hidden" :class="route.path === item.to ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold' : 'text-gray-700 hover:text-blue-600'">
              {{ item.label }}
            </router-link>
            <input type="checkbox" class="ml-3" :checked="completedSet.has(itemKey(item))" @click.stop="toggleComplete(itemKey(item))" />
          </li>
        </ul>
      </div>
    </nav>

    <!-- Bottom: progress + auth -->
    <div class="mt-auto pt-4 border-t border-gray-100">
      <div class="text-sm text-gray-600 mb-3">
        Progress:
        <strong>{{ completedCount }}/{{ totalNav }}</strong>
        <button @click.stop="resetProgress" class="ml-3 text-xs px-2 py-1 bg-gray-100 rounded">Reset</button>
        <div
          v-if="completedCount === totalNav"
          class="mt-2 text-green-600 font-semibold"
        >
          Full knowledge unlocked ✅
        </div>
      </div>

      <!-- Auth -->
      <div class="pt-4 border-t border-gray-100">
        <template v-if="user">
          <div
            class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-3"
          >
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-sm font-bold text-white"
            >
              {{ user.name?.charAt(0) || user.email?.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-gray-900">Xin chào,</div>
              <div class="text-sm text-gray-600">
                {{ user.name || user.email.split('@')[0] }}
              </div>
            </div>
          </div>
          <button
            @click="logout"
            class="w-full px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200"
          >
            Đăng xuất
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="w-full block px-6 py-3 text-sm font-semibold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl text-center border border-gray-200"
          >
            Đăng nhập
          </router-link>
        </template>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const STORAGE_KEY = 'nav.completed'

export default defineComponent({
  name: 'Sidebar',
  setup () {
    const router = useRouter()
    const route = useRoute()
    const { user, logout, refresh } = useAuth()


    // Gộp toàn bộ navigation vào một mảng (sắp xếp lại để dễ truy cập)
    const navSections = [
      {
        label: 'Điều hướng',
        items: [
          { to: '/', label: 'Trang chủ' },
          { to: '/assessment', label: 'Khảo sát' },
          { to: '/plan/create', label: 'Kế hoạch di trú' },
          { to: '/visas', label: 'Bảng visa' }
        ]
      },
      {
        label: 'Học tập',
        items: [
          { to: '/finance', label: 'Tài chính' },
          { to: '/english', label: 'Tiếng Anh' }
        ]
      },
      {
        label: 'Công cụ & Tiện ích',
        items: [
          { to: '/chatbot', label: 'Chatbot' },
          { to: '/reminders', label: 'Nhắc việc' },
          { to: '/work-types', label: 'Công việc' },
          { to: '/risk', label: 'Rủi ro & Khiếu nại' },
          { to: '/review', label: 'Gửi tài liệu (check)' }
        ]
      },
      {
        label: 'Hướng dẫn & Tài liệu',
        items: [
          { to: '/immi', label: 'ImmiGuide' },
          { to: '/gte', label: 'GTE' },
          { to: '/templates', label: 'Mẫu & Tự điền' }
        ]
      }
    ]

    const state = reactive({
      completed: new Set<string>()
    })

    function loadProgress () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const arr = JSON.parse(raw) as string[]
        state.completed = new Set(arr)
      } catch (e) {
        // ignore
      }
    }

    function saveProgress () {
      const arr = Array.from(state.completed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
    }

    loadProgress()

    const completedSet = computed(() => state.completed as Set<string>)
    const completedCount = computed(() => (state.completed ? state.completed.size : 0))

    function itemKey(item: any) {
      return item && item.to ? String(item.to) : String(item?.label || '')
    }

    const totalNav = computed(() => navSections.reduce((sum: number, sec: any) => sum + (sec.items ? sec.items.length : 0), 0))





    function resetProgress () {
      state.completed = new Set()
      saveProgress()
    }

    function toggleComplete (key: string) {
      const s = new Set(state.completed)
      if (s.has(key)) s.delete(key)
      else s.add(key)
      state.completed = s
      saveProgress()
    }

    function doLogout () {
      try {
        logout && logout()
      } catch (e) {}
      router.push({ path: '/' })
    }

    onMounted(() => {
      try {
        refresh && refresh().catch(() => {})
      } catch (e) {}
    })

    function goCreatePlan () {
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'quickstart_clicked',
            action: 'create_plan'
          })
        })
      } catch (e) {}
      router.push({ path: '/plan/create' })
    }

    function goBilling () {
      router.push({ path: '/billing' })
    }

    return {
      navSections,
      completedSet,
      completedCount,
      totalNav,
      itemKey,
      toggleComplete,
      resetProgress,
      user,
      logout: doLogout,
      route,
      goCreatePlan,
      goBilling
    }
  }
})
</script>

<style scoped>
/* Tailwind is used for styles */
</style>
