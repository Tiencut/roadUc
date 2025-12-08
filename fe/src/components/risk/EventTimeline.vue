<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">Nhật ký sự kiện</h2>
    <p class="text-sm text-gray-600 mb-3">Ghi lại các mốc (đóng tiền, trao đổi) để dùng khi khiếu nại hoặc đưa cho luật sư.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <input type="date" v-model="entry.date" class="p-2 border rounded" />
      <input v-model="entry.amount" placeholder="Số tiền (AUD)" class="p-2 border rounded" />
      <input v-model="entry.who" placeholder="Người nhận / agency" class="p-2 border rounded" />
    </div>
    <textarea v-model="entry.note" rows="3" class="w-full mt-2 p-2 border rounded" placeholder="Nội dung trao đổi / link / bằng chứng"></textarea>
    <div class="mt-2 flex gap-2">
      <button @click="add" class="px-3 py-1 bg-emerald-600 text-white rounded">Thêm</button>
      <button @click="clearAll" class="px-3 py-1 bg-gray-200 rounded">Xóa tất cả</button>
      <button @click="exportPDF" class="px-3 py-1 bg-blue-600 text-white rounded">Xuất PDF</button>
    </div>

    <div class="mt-4 space-y-2">
      <div v-for="(e, i) in events" :key="i" class="p-3 border rounded">
        <div class="text-sm text-gray-500">{{ e.date }} — {{ e.who }} — {{ e.amount }}</div>
        <div class="mt-1">{{ e.note }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const STORAGE = 'rtu_fraud_events'

const events = ref<Array<any>>([])
try { events.value = JSON.parse(localStorage.getItem(STORAGE) || '[]') } catch (e) { events.value = [] }

const entry = ref({ date: new Date().toISOString().slice(0,10), amount: '', who: '', note: '' })

function escapeHtml(s: any) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function add() {
  if (!entry.value.date) { alert('Chọn ngày'); return }
  events.value = [...events.value, { ...entry.value }]
  localStorage.setItem(STORAGE, JSON.stringify(events.value))
  entry.value = { date: new Date().toISOString().slice(0,10), amount: '', who: '', note: '' }
}

function clearAll() { if (confirm('Xóa tất cả nhật ký?')) { events.value = []; localStorage.removeItem(STORAGE) } }

function exportPDF() {
  // open printable window — user can Print -> Save as PDF
  const html = `
    <html><head><title>Nhật ký sự kiện</title><meta charset="utf-8"><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} .entry{margin-bottom:12px;padding:10px;border:1px solid #ddd}</style></head><body>
    <h1>Nhật ký sự kiện</h1>
    ${events.value.map(e => `<div class="entry"><div><strong>${e.date}</strong> — ${escapeHtml(e.who)} — ${escapeHtml(e.amount)}</div><div>${escapeHtml(e.note)}</div></div>`).join('')}
    <script>window.onload = () => { setTimeout(() => { window.print(); }, 300); }<\/script>
    </body></html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}
</script>

<style scoped></style>
