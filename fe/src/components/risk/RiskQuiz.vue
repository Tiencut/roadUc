<template>
  <div>
    <h2 class="text-lg font-semibold mb-2">Quiz: Tự đánh giá rủi ro agency</h2>
    <p class="text-sm text-gray-600 mb-4">Trả lời các câu hỏi dưới đây để ước lượng mức rủi ro. Nếu điểm cao, dừng và liên hệ hỗ trợ.</p>

    <div class="space-y-3">
      <div v-for="(q, i) in questions" :key="i" class="p-3 border rounded">
        <div class="font-medium">{{ q.text }}</div>
        <div class="mt-2 flex gap-2">
          <button @click="answer(i, true)" :class="answers[i] === true ? 'bg-emerald-600 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Có</button>
          <button @click="answer(i, false)" :class="answers[i] === false ? 'bg-amber-500 text-white' : 'bg-gray-100'" class="px-3 py-1 rounded">Không</button>
        </div>
      </div>
    </div>

    <div class="mt-4 p-3 bg-slate-50 rounded">
      <div class="font-semibold">Kết quả</div>
      <div class="mt-2">Điểm rủi ro: <strong>{{ score }}</strong> / {{ questions.length }}</div>
      <div class="mt-2 text-sm text-gray-700">Mức: <strong>{{ levelText }}</strong></div>
      <div class="mt-3">
        <button @click="reset" class="px-3 py-1 bg-gray-200 rounded mr-2">Đặt lại</button>
        <button @click="gotoReport" class="px-3 py-1 bg-emerald-600 text-white rounded">Nếu đã đóng tiền, bấm vào đây</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const questions = ref([
  { text: 'Có hợp đồng bằng văn bản rõ ràng không?' },
  { text: 'Agency hứa chắc đậu visa 100% không?' },
  { text: 'Yêu cầu đóng tiền mặt, không biên lai không?' },
  { text: 'Nói không cần chứng minh tiếng Anh/tài chính không?' },
  { text: 'Sử dụng mô tả “đổi tên/giấy tờ” hoặc gửi tiền qua cá nhân không?' }
])

const answers = ref<Array<boolean|null>>(questions.value.map(() => null))

function answer(idx: number, val: boolean) {
  answers.value[idx] = val
}

const score = computed(() => answers.value.reduce((s, a, i) => s + ((a === true && isDanger(i)) ? 1 : 0), 0))

function isDanger(i: number) { return true } // treat all 'Có' as risky for scoring

const levelText = computed(() => {
  const s = score.value
  if (s === 0) return 'Thấp'
  if (s <= 2) return 'Trung bình — Cẩn trọng'
  return 'Cao — Dừng lại và kiểm tra kỹ'
})

function reset() { answers.value = questions.value.map(() => null) }
function gotoReport() { router.push({ path: '/risk', hash: '#report' }) }
</script>

<style scoped></style>
