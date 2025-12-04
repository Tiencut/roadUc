<template>
  <div class="max-w-md mx-auto px-4 py-12">
    <div class="bg-white p-6 border rounded shadow-sm">
      <h1 class="text-2xl font-bold mb-4">Đăng nhập</h1>
      <form @submit.prevent="onSubmit" class="space-y-3">
        <div>
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm">Mật khẩu</label>
          <input v-model="password" type="password" class="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div class="flex items-center justify-between">
          <button class="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Đăng nhập</button>
          <router-link to="/" class="text-sm text-gray-600">Quay lại</router-link>
        </div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </form>
      <p class="text-xs text-gray-500 mt-3">(Đây là demo: dùng email hợp lệ và mật khẩu >=6 ký tự để đăng nhập)</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

export default defineComponent({
  name: 'Login',
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref<string | null>(null)
    const { login } = useAuth()
    const router = useRouter()
    const route = useRoute()

    async function onSubmit() {
      error.value = null
      try {
        await login(email.value.trim(), password.value)
        // redirect to intended route or home
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
      } catch (e: any) {
        error.value = e?.message || String(e)
      }
    }

    return { email, password, onSubmit, error }
  }
})
</script>

<style scoped>
/* rely on Tailwind utilities */
</style>
