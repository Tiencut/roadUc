<template>
  <div class="overflow-x-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-xl">
    <!-- Header với search và filter -->
    <div class="mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Công Việc Visa 462 Úc 2025</h1>
          <p class="text-sm text-gray-500">12 loại việc làm phổ biến - Regional work để gia hạn visa [web:1][web:2]</p>
        </div>
      </div>
      <div class="flex gap-2">
        <select class="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
          <option>Tất cả (12)</option>
          <option>Gia hạn visa (6)</option>
          <option>Không gia hạn (6)</option>
        </select>
      </div>
    </div>

    <!-- Desktop Table - Modern Design -->
    <div class="hidden md:block">
      <table class="min-w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <thead>
          <tr class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <th class="py-5 px-6 text-left font-semibold rounded-tl-2xl">Gia hạn visa</th>
            <th class="py-5 px-6 text-left font-semibold">Loại công việc</th>
            <th class="py-5 px-6 text-left font-semibold">Mô tả chi tiết</th>
            <th class="py-5 px-6 text-left font-semibold">Yêu cầu cơ bản</th>
            <th class="py-5 px-6 text-right font-semibold rounded-tr-2xl">Lương/giờ (AUD)</th>
          </tr>
          <tr class="bg-gradient-to-r from-blue-50 to-indigo-50">
            <th class="py-3 px-6 text-xs text-emerald-700 font-medium border-b border-gray-200"></th>
            <th class="py-3 px-6 text-xs text-gray-600 font-medium border-b border-gray-200">Khu vực phổ biến</th>
            <th class="py-3 px-6 text-xs text-gray-600 font-medium border-b border-gray-200">Cách tìm việc 2025</th>
            <th class="py-3 px-6 text-xs text-gray-600 font-medium border-b border-gray-200"></th>
            <th class="py-3 px-6 text-xs text-gray-600 font-medium text-right border-b border-gray-200">Phúc lợi</th>
          </tr>
        </thead>
        <tbody>
          <tr @click="openDrawer(r)" v-for="(r, idx) in filteredRows" :key="idx" class="cursor-pointer hover:bg-emerald-50/50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group">
            <td class="py-5 px-6">
              <span :class="r.canExtend === 'CÓ' ? 'bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold' : 'bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold'">
                {{ r.canExtend }}
              </span>
            </td>
            <td class="py-5 px-6 font-semibold text-gray-900 group-hover:text-emerald-700">{{ r.jobType }}</td>
            <td class="py-5 px-6 text-gray-700 max-w-md">{{ r.detail }}</td>
            <td class="py-5 px-6 text-sm">
              <ul class="space-y-1">
                <li v-for="(req, i) in r.requirement.split(',')" :key="i" class="flex items-center gap-1 text-xs text-gray-600">
                  <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  {{ req.trim() }}
                </li>
              </ul>
            </td>
            <td class="py-5 px-6 text-right">
              <div class="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {{ r.pay }}
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ r.payWeekly }} / tuần</div>
            </td>
            <td class="py-5 px-6 text-center">
              <button @click.stop="addToCompare(r)" :class="isCompared(r) ? 'px-3 py-1 rounded-xl bg-yellow-100 text-yellow-800 border' : 'px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border'">
                {{ isCompared(r) ? 'Đã chọn' : 'So sánh' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Legend -->
      <div class="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100">
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>CÓ = Regional work ≥88 ngày → Visa thứ 2 [web:1]</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>KHÔNG = City work, không gia hạn</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Cards - Enhanced -->
    <div class="md:hidden space-y-4">
    <div v-for="(r, idx) in filteredRows" :key="idx" @click="openDrawer(r)" class="cursor-pointer bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-emerald-100 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200">
        <!-- Header card -->
        <div class="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div class="inline-flex items-center gap-2 mb-1">
              <span :class="r.canExtend === 'CÓ' ? 'bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold' : 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold'">
                {{ r.canExtend }}
              </span>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Regional</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900">{{ r.jobType }}</h3>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-emerald-600">{{ r.pay }}</div>
            <div class="text-xs text-gray-500">{{ r.payWeekly }} /tuần</div>
          </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div class="font-semibold text-gray-800 mb-1">📍 Khu vực</div>
            <div class="text-gray-700">{{ r.region }}</div>
          </div>
          <div>
            <div class="font-semibold text-gray-800 mb-1">⚡ Phúc lợi</div>
            <div class="text-emerald-700 font-medium">{{ r.benefits }}</div>
          </div>
        </div>

        <!-- Detail sections -->
        <div class="space-y-3">
          <div>
            <div class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
              Mô tả công việc
            </div>
            <p class="text-gray-700 leading-relaxed">{{ r.detail }}</p>
          </div>

          <div class="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl">
            <div class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Yêu cầu & Cách apply
            </div>
            <div class="grid grid-cols-1 gap-3 text-sm">
              <div class="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 mb-1">{{ r.requirement }}</div>
                  <div class="text-xs text-gray-500">Chi phí: {{ r.cost }}</div>
                </div>
              </div>
              <div class="p-3 bg-white rounded-lg shadow-sm border">
                <div class="font-semibold text-gray-900 mb-1">📱 Tìm việc ngay:</div>
                <div class="text-sm text-emerald-700">{{ r.howTo }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-3">
          <button @click.stop="addToCompare(r)" :class="isCompared(r) ? 'px-3 py-1 rounded-xl bg-yellow-100 text-yellow-800 border' : 'px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border'">{{ isCompared(r) ? 'Đã chọn' : 'So sánh' }}</button>
        </div>
      </div>
    </div>
    
    <!-- Drawer component -->
    <WorkTypeDetailDrawer
      v-if="selected"
      :work="selected"
      :visible="drawerOpen"
      @close="closeDrawer"
      @save="(w) => { saveToPlan(w); closeDrawer() }"
      @compare="(w) => addToCompare(w)"
      @checklist="(w) => { viewChecklist(w); closeDrawer() }"
    />

    <!-- toast -->
    <div v-if="toast" class="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">{{ toast }}</div>
    
    <!-- Compare modal -->
    <CompareModal :visible="compareOpen" @close="() => (compareOpen = false)" />

    <!-- Floating compare button -->
    <button v-if="compareCount > 0" @click="compareOpen = true" class="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg">So sánh</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import * as CompareModalModule from './CompareModal.vue'
const CompareModal: any = (CompareModalModule as any).default || (CompareModalModule as any)
import { useRouter } from 'vue-router'
import WorkTypeDetailDrawer from './WorkTypeDetailDrawer.vue'

const filter = ref('all')

const router = useRouter()
const { user } = useAuth()
const compareOpen = ref(false)
// reactive compare list synced with localStorage
const compareList = ref<any[]>([])
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    compareList.value = JSON.parse(localStorage.getItem('rtu_compare_jobs') || '[]') || []
  }
} catch (e) {
  compareList.value = []
}

const compareCount = computed(() => compareList.value.length)

function isCompared(job: Record<string, any>) {
  return compareList.value.some(j => j.jobType === job.jobType)
}
const selected = ref<Record<string, any> | null>(null)
const drawerOpen = ref(false)
const toast = ref('')

function openDrawer(row: Record<string, any>) {
  selected.value = row
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  setTimeout(() => { selected.value = null }, 250)
}

function saveToPlan(work: Record<string, any>) {
  try {
    const key = 'rtu_saved_jobs'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    if (!existing.find((w: any) => w.jobType === work.jobType)) existing.push(work)
    localStorage.setItem(key, JSON.stringify(existing))
    toast.value = 'Đã lưu vào lộ trình của tôi'
    setTimeout(() => (toast.value = ''), 2000)
    // If user is logged in, sync to backend
    try {
      if (user.value && user.value.token) {
        fetch('/api/me/saved-jobs', { method: 'POST', headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + user.value.token }, body: JSON.stringify({ job: work }) })
          .then(r => {
            if (!r.ok) {
              toast.value = 'Lưu cục bộ thành công — không thể đồng bộ server'
              setTimeout(() => (toast.value = ''), 2500)
            } else {
              toast.value = 'Đã lưu và đồng bộ'
              setTimeout(() => (toast.value = ''), 2000)
            }
          }).catch(() => {
            toast.value = 'Lưu cục bộ thành công — không thể đồng bộ server'
            setTimeout(() => (toast.value = ''), 2500)
          })
      }
    } catch (e) {}
  } catch (e) {
    alert('Không thể lưu — kiểm tra localStorage')
  }
}

function addToCompare(work: Record<string, any>) {
  try {
    const key = 'rtu_compare_jobs'
    const existing = compareList.value || []
    const exists = existing.find((w: any) => w.jobType === work.jobType)
    if (exists) {
      compareList.value = existing.filter((w: any) => w.jobType !== work.jobType)
      localStorage.setItem(key, JSON.stringify(compareList.value))
      toast.value = 'Đã bỏ khỏi danh sách so sánh'
    } else {
      if (existing.length >= 3) {
        toast.value = 'Chỉ so sánh tối đa 3 công việc'
      } else {
        compareList.value = [...existing, work]
        localStorage.setItem(key, JSON.stringify(compareList.value))
        toast.value = 'Đã thêm vào danh sách so sánh'
      }
    }
    setTimeout(() => (toast.value = ''), 2000)
  } catch (e) {
    alert('Không thể cập nhật so sánh — kiểm tra localStorage')
  }
}

function viewChecklist(work: Record<string, any>) {
  router.push({ path: '/reminders', query: { job: work.jobType } })
}

const rows = ref([
  // Regional Work - CÓ gia hạn (88 ngày specified work)
  {
    canExtend: 'CÓ', jobType: '🌱 Nông nghiệp thực vật', 
    detail: 'Trồng/hái dâu tây, nho, việt quất, táo. Tưới nước, tỉa cành, đóng gói xuất khẩu. Làm ngoài trời 8-10h/ngày, mùa vụ quanh năm.',
    requirement: 'Sức khỏe tốt, chịu nóng/lạnh, tiếng Anh cơ bản giao tiếp. Không cần kinh nghiệm',
    pay: '$26-35', payWeekly: '$1,000-1,400', region: 'QLD (Bowen, Stanthorpe), VIC (Mildura), NSW (Griffith)',
    howTo: 'Harvest Trail app, Facebook "Fruit Picking Jobs Australia 2025", Pick Aus', 
    benefits: 'Ở miễn phí + ăn 3 bữa', cost: 'Ticket $0'
  },
  {
    canExtend: 'CÓ', jobType: '🐄 Chăn nuôi bò sữa/cừu', 
    detail: 'Vắt sữa bò tự động, cho ăn, dọn chuồng, cắt lông cừu. Ca sáng 4h-8h, chiều 3h-7h. Mùi hôi nhẹ.',
    requirement: 'Sức bền tốt, chịu mùi, chịu lạnh (VIC). Bằng C là lợi thế lớn',
    pay: '$28-38', payWeekly: '$1,100-1,500', region: 'VIC (Gippsland), NSW (Dubbo), TAS (Smithton)',
    howTo: 'Seek.com.au "farm hand", Backpacker Job Board, Dairy Australia Jobs', 
    benefits: 'Ở + ăn miễn phí, sữa tươi free', cost: '$0'
  },
  {
    canExtend: 'CÓ', jobType: '⛏️ Khai thác mỏ (FIFO)', 
    detail: 'Khoan đất, vận hành máy xúc nhỏ, dọn công trường mỏ quặng sắt. Ca 12h, ở camp 2 tuần ON/1 tuần OFF.',
    requirement: 'White Card ($110), thể lực tốt, chịu remote. Training free từ BHP/Rio Tinto',
    pay: '$35-48', payWeekly: '$2,800-3,800', region: 'WA (Pilbara - Port Hedland), QLD (Bowen Basin)',
    howTo: 'Indeed "mine labourer", BHP trainee program, WorkPac FIFO jobs', 
    benefits: 'Fly in/out free, camp 5 sao, gym', cost: 'White Card $110'
  },
  {
    canExtend: 'CÓ', jobType: '🏗️ Xây dựng hạ tầng', 
    detail: 'Đào đất, đổ bê tông đường cao tốc, hỗ trợ thợ hồ cầu đường. Dự án chính phủ lớn.',
    requirement: 'White Card bắt buộc ($110). Đào tạo an toàn free trên chỗ',
    pay: '$30-42', payWeekly: '$1,200-1,700', region: 'QLD (Toowoomba), NSW (regional infrastructure)',
    howTo: 'Gumtree "construction labourer", Hays Recruitment, Main Roads QLD jobs', 
    benefits: 'Penalty rates weekend + OT x1.5-2', cost: 'White Card $110'
  },
  {
    canExtend: 'CÓ', jobType: '🎣 Ngư nghiệp tàu cá', 
    detail: 'Thả lưới câu tôm hùm, cá ngừ, phân loại hải sản. Ra khơi 7-14 ngày, tàu lớn có phòng riêng.',
    requirement: 'Chống say sóng, sức khỏe biển. Training free',
    pay: '$32-45 + share', payWeekly: '$1,300-2,000', region: 'QLD (Cairns), WA (Broome), NT (Darwin)',
    howTo: 'Facebook "Fishing Crew Jobs Australia", Seafood Industry Jobs', 
    benefits: 'Ăn hải sản free, ở tàu', cost: '$0'
  },
  {
    canExtend: 'CÓ', jobType: '🌲 Lâm nghiệp trồng cây', 
    detail: 'Trồng cây keo, thông bằng máy, đốn cây (chainsaw training 2 ngày). Mùa trồng quanh năm.',
    requirement: 'Chainsaw ticket ($220), chịu bụi. Training company pay',
    pay: '$29-40', payWeekly: '$1,150-1,600', region: 'QLD (Gympie), NSW (plantation areas)',
    howTo: 'Seek "forestry labourer", HQ Plantations careers', 
    benefits: 'Ở camp + ăn free', cost: 'Chainsaw $220'
  },
  // City Work - KHÔNG gia hạn
  {
    canExtend: 'KHÔNG', jobType: '🚛 Lái xe tải HR/MR', 
    detail: 'Lái tải nhẹ/nặng chở hàng hóa, giao nhận nội thành. Ca 8-12h, weekend penalty.',
    requirement: 'Bằng HR/MR Úc ($400-600 training), 1 năm kinh nghiệm, load/unload',
    pay: '$30-38', payWeekly: '$1,200-1,500', region: 'Sydney, Brisbane, Melbourne city',
    howTo: 'Seek "HR truck driver", Drivers.com.au, 1800Drivers', 
    benefits: 'OT x1.5, fuel card', cost: 'HR license $500'
  },
  {
    canExtend: 'KHÔNG', jobType: '🚜 Lái Forklift kho', 
    detail: 'Xe nâng hàng Amazon/Woolworths DC, xếp pallet, kiểm inventory. Ca 8h, AC kho mát.',
    requirement: 'Forklift High Risk License ($350, 2 ngày training), LF ưu tiên',
    pay: '$32-40', payWeekly: '$1,250-1,600', region: 'Sydney West, Melbourne North, Brisbane',
    howTo: 'Randstad "forklift operator", Gumtree, Amazon Jobs', 
    benefits: 'Overtime thường xuyên', cost: 'Forklift ticket $350'
  },
  {
    canExtend: 'KHÔNG', jobType: '🍽️ Nhà hàng Kitchenhand', 
    detail: 'Rửa chén, chuẩn bị nguyên liệu, hỗ trợ đầu bếp. Ca tối 5h-11h, tips tốt.',
    requirement: 'Tiếng Anh giao tiếp cơ bản, chịu nóng bếp, fast pace',
    pay: '$27-35 + tips', payWeekly: '$1,000-1,300', region: 'Sydney CBD, Melbourne cafes/pubs',
    howTo: 'Facebook "Vietnamese Jobs Sydney", Hospitality Jobs Australia', 
    benefits: 'Tips $100-200/tuần, free meal', cost: 'RSA $50 (nếu serve)'
  },
  {
    canExtend: 'KHÔNG', jobType: '📦 Warehouse Picker/Packer', 
    detail: 'Đóng gói Amazon, quét mã vạch, pick order RF scanner. Ca 7h-15h/15h-23h.',
    requirement: 'Không kinh nghiệm, chịu đứng lâu, tốc độ nhanh',
    pay: '$26-34', payWeekly: '$1,000-1,350', region: 'Sydney Western Suburbs, Melbourne Derrimut',
    howTo: 'Randstad, Amazon Flex, Chandler Macleod agency', 
    benefits: 'Weekly pay, training free', cost: '$0'
  },
  {
    canExtend: 'KHÔNG', jobType: '🏪 Bán lẻ Thu ngân', 
    detail: 'Coles/Woolworths xếp kệ, thu ngân self-checkout, customer service.',
    requirement: 'Tiếng Anh tốt (IELTS 5.0), available weekend',
    pay: '$25-32', payWeekly: '$950-1,250', region: 'Sydney/Melbourne supermarkets',
    howTo: 'Coles careers, Woolworths apply trực tiếp store', 
    benefits: 'Staff discount 10%, stable hours', cost: '$0'
  },
  {
    canExtend: 'KHÔNG', jobType: '🔧 Phụ tùng ô tô Garage', 
    detail: 'Bán phụ tùng xe tải, hỗ trợ thợ sửa chữa, order parts. Liên quan kinh doanh Việt.',
    requirement: 'Hiểu cơ bản xe tải/motor (kinh nghiệm VN OK), customer service',
    pay: '$28-36', payWeekly: '$1,100-1,450', region: 'Sydney West garages, Brisbane auto parts',
    howTo: 'Facebook "Auto Mechanic Jobs Australia", Repco/Supercheap careers', 
    benefits: 'Commission sales 2-5%', cost: '$0'
  }
])

const filteredRows = computed(() => {
  if (filter.value === 'extend') return rows.value.filter(r => r.canExtend === 'CÓ')
  if (filter.value === 'no-extend') return rows.value.filter(r => r.canExtend === 'KHÔNG')
  return rows.value
})
</script>

<style scoped>
/* Smooth animations */
.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(to right, #10b981, #059669);
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to right, #059669, #047857);
}
</style>
