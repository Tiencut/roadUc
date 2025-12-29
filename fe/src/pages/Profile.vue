<template>
  <div class="max-w-2xl mx-auto mt-8">
    <section class="bg-white p-6 rounded shadow">
      <h2 class="text-lg font-semibold mb-4">Trang cá nhân</h2>
      <div v-if="user">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p v-if="user.name"><strong>Tên:</strong> {{ user.name }}</p>
        <div class="mt-4">
            <button @click="onLogout" class="px-3 py-1 bg-red-600 text-white rounded">Đăng xuất</button>
            <router-link v-if="!user?.premium" to="/billing" class="ml-2 px-3 py-1 bg-green-600 text-white rounded">Nâng cấp Premium</router-link>
        </div>
      </div>
      <div v-else>
        <p>Bạn chưa đăng nhập.</p>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  setup() {
    const auth = useAuth()
    const onLogout = () => {
      auth.logout()
    }
    return { user: auth.user, onLogout }
  }
})
</script>

<style scoped>
</style>
