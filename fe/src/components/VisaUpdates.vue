<template>
  <div class="mb-4 p-3 bg-gray-50 border rounded text-sm">
    <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">Tình trạng dữ liệu visa</div>
          <div class="text-xs text-gray-600 mt-1">
            <span v-if="loading">Đang tải…</span>
            <span v-else-if="error" class="text-red-600">Lỗi: {{ error }}</span>
            <span v-else-if="successMessage" class="text-green-600">{{ successMessage }}</span>
            <template v-else-if="meta">
              <template v-if="!hasUsefulMeta">
                <span class="text-gray-600">Chưa có bản ghi metadata — thử bấm 'Tải lại (refresh)'.</span>
              </template>
              <template v-else>
                <span>
                  Cập nhật: <strong class="ml-1">{{ fetchedAtDisplay }}</strong>
                  <span class="ml-2">Nguồn:
                    <span v-if="meta.source">
                      <a :href="meta.source" target="_blank" class="text-blue-600">{{ meta.sourceLabel || meta.source }}</a>
                    </span>
                    <span v-else class="text-gray-500">—</span>
                  </span>
                  <span class="ml-2 text-gray-500">(version: {{ versionDisplay }})</span>
                </span>
              </template>
            </template>
            <span v-else class="text-gray-500">Không có metadata.</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="checkNow" class="px-3 py-1 border rounded bg-white hover:bg-gray-100 text-sm" :disabled="loading">Kiểm tra cập nhật</button>
          <button @click="refreshData" class="px-3 py-1 bg-green-600 text-white rounded text-sm" :disabled="loading">Tải lại (refresh)</button>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'VisaUpdates',
  setup() {
    const loading = ref(false)
    const error = ref<string | null>(null)
    const meta = ref<any | null>(null)
    const successMessage = ref<string | null>(null)

    const hasUsefulMeta = computed(() => {
      if (!meta.value) return false
      return Boolean(meta.value.fetchedAt || meta.value.lastUpdated || meta.value.source || meta.value.version)
    })

    const fetchedAtDisplay = computed(() => {
      if (!meta.value) return '—'
      return meta.value.fetchedAt || meta.value.lastUpdated || '—'
    })

    const versionDisplay = computed(() => {
      if (!meta.value) return '—'
      return meta.value.version ? String(meta.value.version).slice(0, 8) : '—'
    })

    async function loadMeta() {
      loading.value = true
      error.value = null
      try {
        const res = await fetch('/api/visas/metadata')
        if (!res.ok) {
          const text = await res.text().catch(() => null)
          throw new Error('Failed to load metadata: ' + (text || res.status))
        }
        const ct = (res.headers.get('content-type') || '')
        if (ct.includes('application/json')) {
          meta.value = await res.json()
        } else {
          const text = await res.text().catch(() => null)
          throw new Error('Expected JSON metadata but got non-JSON: ' + (String(text).slice(0,200)))
        }
      } catch (e: any) {
        error.value = e?.message || String(e)
        meta.value = null
      } finally {
        loading.value = false
      }
      // If the server returned { ok: true, meta: {...} } unwrap it
      if (meta.value && meta.value.ok && meta.value.meta) {
        meta.value = meta.value.meta
      }
      // reset any old success message
      successMessage.value = null
    }

    async function checkNow() {
      // quick re-fetch metadata
      await loadMeta()
    }

    async function refreshData() {
      // ask backend to refresh (if supported)
      loading.value = true
      error.value = null
      try {
        const res = await fetch('/api/visas?refresh=true', { method: 'GET' })
        if (!res.ok) {
          const text = await res.text().catch(() => null)
          throw new Error('Refresh failed: ' + (text || res.status))
        }
        // try read JSON if present
        const ct = (res.headers.get('content-type') || '')
        if (ct.includes('application/json')) {
          // ignore content but reload metadata afterwards
          await res.json().catch(() => null)
        }
        // reload metadata
        await loadMeta()
        // show success if metadata now available
        if (meta.value && (meta.value.fetchedAt || meta.value.version || meta.value.source)) {
          successMessage.value = 'Đã tải dữ liệu mới.'
        } else {
          successMessage.value = 'Yêu cầu tải lại đã gửi; chưa có metadata cập nhật.'
        }
      } catch (e: any) {
        error.value = e?.message || String(e)
      } finally {
        loading.value = false
      }
    }

    // load on mount
    loadMeta()

    return { loading, error, meta, checkNow, refreshData, successMessage, hasUsefulMeta, fetchedAtDisplay, versionDisplay }
  }
})
</script>

<style scoped>
</style>
