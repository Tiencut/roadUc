<template>
  <div class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Mẫu & Tự điền</h1>

    <div v-if="isAdmin" class="mb-6 p-4 bg-white border rounded">
      <h3 class="font-semibold mb-2">(Admin) Upload template HTML</h3>
      <div class="grid gap-2">
        <input v-model="uploadName" placeholder="Template name" class="border rounded px-3 py-2" />
        <input v-model="uploadDesc" placeholder="Description (optional)" class="border rounded px-3 py-2" />
        <textarea v-model="uploadHtml" placeholder="Paste HTML or use file input" class="border rounded px-3 py-2 h-32"></textarea>
        <input type="file" @change="onFile" accept="text/html" />
        <div v-if="Object.keys(detectedFields).length" class="text-sm text-gray-600">Detected placeholders: <strong>{{ Object.keys(detectedFields).join(', ') }}</strong></div>
        <div class="flex items-center gap-3">
          <button @click="uploadTemplate" class="px-3 py-2 bg-blue-600 text-white rounded">Upload Template</button>
          <button @click="(uploadHtml=''),(detectedFields={})" class="px-3 py-2 bg-gray-100 rounded">Clear</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Đang tải...</div>

    <div v-if="templates.length">
      <ul class="space-y-4">
        <li v-for="t in templates" :key="t.id" class="p-4 border rounded bg-white">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">{{ t.name }}</div>
              <div class="text-sm text-gray-500">{{ t.description }}</div>
            </div>
            <div>
              <button @click="openGenerate(t)" class="px-3 py-2 bg-blue-600 text-white rounded">Mở mẫu</button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="selected" class="mt-6 p-4 border rounded bg-white">
      <h3 class="font-semibold mb-3">{{ selected.name }}</h3>
      <form @submit.prevent="generate">
        <div class="grid gap-3">
          <div v-for="(label, key) in selected.fields" :key="key">
            <label class="block text-sm font-medium">{{ label }}</label>
            <input v-model="values[key]" class="mt-1 block w-full rounded border px-3 py-2" />
          </div>

          <div class="flex items-center gap-3 mt-4">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Tạo PDF</button>
            <button type="button" @click="selected = null" class="px-4 py-2 bg-gray-100 rounded">Đóng</button>
          </div>
        </div>
      </form>

      <div v-if="exportUrl" class="mt-4">
        <a :href="exportUrl" target="_blank" class="text-blue-600 underline">Tải về bản xuất</a>
      </div>
    </div>

    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

export default defineComponent({
  name: 'Templates',
  setup () {
    const templates = ref<any[]>([])
    const loading = ref(false)
    const selected = ref<any | null>(null)
    const values = ref<any>({})
    const error = ref('')
    const exportUrl = ref('')

    const authRaw = localStorage.getItem('rtu_user')
    const isAdmin = authRaw ? (JSON.parse(authRaw).role === 'admin') : false

    // admin upload state
    const uploadName = ref('')
    const uploadDesc = ref('')
    const uploadHtml = ref('')
    const detectedFields = ref<any>({})

    async function load() {
      loading.value = true
      try {
        const r = await fetch('/api/templates')
        const j = await r.json()
        if (!j.ok) { error.value = j.error || 'Lỗi'; loading.value = false; return }
        templates.value = j.templates
      } catch (e: any) { error.value = String(e?.message || e) }
      loading.value = false
    }

    function openGenerate(t: any) {
      selected.value = t
      values.value = {}
      for (const k of Object.keys(t.fields || {})) values.value[k] = ''
      exportUrl.value = ''
    }

    function detectPlaceholders(html: string) {
      const re = /{{\s*([a-zA-Z0-9_]+)\s*}}/g
      let m
      const fields: any = {}
      while ((m = re.exec(html)) !== null) fields[m[1]] = m[1]
      detectedFields.value = fields
    }

    function onFile(e: Event) {
      const inp = e.target as HTMLInputElement
      if (!inp.files || !inp.files[0]) return
      const f = inp.files[0]
      const reader = new FileReader()
      reader.onload = () => { uploadHtml.value = String(reader.result || ''); detectPlaceholders(uploadHtml.value) }
      reader.readAsText(f)
    }

    async function uploadTemplate() {
      error.value = ''
      try {
        if (!uploadName.value || !uploadHtml.value) { error.value = 'Vui lòng nhập tên và nội dung HTML'; return }
        const raw = localStorage.getItem('rtu_user')
        const token = raw ? JSON.parse(raw).token : null
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers.authorization = 'Bearer ' + token
        const body: any = { name: uploadName.value, description: uploadDesc.value, html: uploadHtml.value, fields: detectedFields.value }
        const r = await fetch('/api/templates/upload', { method: 'POST', headers, body: JSON.stringify(body) })
        const j = await r.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi upload'; return }
        // refresh
        await load()
        uploadName.value = ''
        uploadDesc.value = ''
        uploadHtml.value = ''
        detectedFields.value = {}
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    async function generate() {
      if (!selected.value) return
      try {
        const raw = localStorage.getItem('rtu_user')
        const token = raw ? JSON.parse(raw).token : null
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers.authorization = 'Bearer ' + token
        const r = await fetch(`/api/templates/${selected.value.id}/generate`, { method: 'POST', headers, body: JSON.stringify({ answers: values.value }) })
        if (r.status === 401) { error.value = 'Vui lòng đăng nhập để sử dụng tính năng này.'; return }
        if (r.status === 402) { error.value = 'Tính năng này chỉ dành cho tài khoản Premium. Xin nâng cấp.'; return }
        const j = await r.json()
        if (!j.ok) { error.value = j.error || 'Lỗi khi tạo'; return }
        exportUrl.value = j.url || j.pdf || ''
        // analytics event
        try { fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'template_generated', templateId: selected.value.id }) }) } catch (e) {}
      } catch (e: any) { error.value = String(e?.message || e) }
    }

    onMounted(() => { load() })

    return { templates, loading, selected, values, openGenerate, generate, error, exportUrl, isAdmin, uploadName, uploadDesc, uploadHtml, detectPlaceholders, onFile, detectedFields, uploadTemplate }
  }
})
</script>

<style scoped>
</style>