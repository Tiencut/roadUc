<template>
    <div class="bg-white p-4 border rounded mb-6">
        <div class="mt-4 text-sm text-gray-600">
            Tỷ giá AUD → VND: <strong v-if="audToVnd">{{ formatDigits(audToVnd) }} VND</strong><span v-else> (đang
                tải...)</span>
        </div>

        <div class="mt-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Tổng dự toán</h4>
                <div class="flex items-center gap-2">
                    <div class="text-sm mr-2">Đơn vị:</div>
                    <button @click="currency = 'VND'"
                        :class="currency === 'VND' ? 'bg-blue-600 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 border rounded text-sm'">VND</button>
                    <button @click="currency = 'AUD'"
                        :class="currency === 'AUD' ? 'bg-blue-600 text-white px-3 py-1 rounded text-sm' : 'px-3 py-1 border rounded text-sm'">AUD</button>
                </div>
            </div>

            <div class="mt-2">
                <div class="flex gap-4">
                    <div class="flex-1 overflow-x-auto py-2">
                        <div class="flex gap-4 min-w-max">
                            <!-- Pre column - Trước -->
                            <div class="phase-card border rounded p-4 min-w-[300px] bg-white">
                                <div class="text-sm font-semibold mb-2">
                                    <span>Trước</span>
                                </div>
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th class="text-left">Mục</th>
                                            <th class="text-right">{{ currency }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="applicationSubmission"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(applicationSubmission) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="englishTest"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(englishTest) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="translationCert"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(translationCert) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="policeCheck"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(policeCheck) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="healthCheck"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(healthCheck) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="documentCert"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(documentCert) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="agentFee"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(agentFee) }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="border-t">
                                            <td class="font-semibold">Tổng</td>
                                            <td class="text-right font-semibold text-lg">{{ displayAmount(preTotalAud)
                                                }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div class="mt-2 text-xs text-gray-600 text-right">{{ displayAmount(preTotalAud) }}
                                </div>
                            </div>

                            <!-- During column - Trong -->
                            <div class="phase-card border rounded p-4 min-w-[300px] bg-white">
                                <div class="text-sm font-semibold mb-2">
                                    <span>Trong</span>
                                </div>
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th class="text-left">Mục</th>
                                            <th class="text-right">{{ currency }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="flight"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(flight) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="insurance"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(insurance) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="initialAccommodationDeposit"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(initialAccommodationDeposit) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="firstMonthRent"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(firstMonthRent) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="simAndSetup"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(simAndSetup) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="groceriesFirstWeeks"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(groceriesFirstWeeks) }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="border-t">
                                            <td class="font-semibold">Tổng</td>
                                            <td class="text-right font-semibold text-lg">{{
                                                displayAmount(duringTotalAud) }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div class="mt-2 text-xs text-gray-600 text-right">{{ displayAmount(duringTotalAud) }}
                                </div>
                            </div>

                            <!-- Post column - Sau -->
                            <div class="phase-card border rounded p-4 min-w-[320px] bg-white">
                                <div class="text-sm font-semibold mb-2">
                                    <span>Sau</span>
                                </div>
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th class="text-left">Mục</th>
                                            <th class="text-right">{{ currency }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Sinh hoạt/tháng</td>
                                            <td class="text-right">{{ displayAmount(livingPerMonth) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div class="flex items-center gap-2">
                                                    <input type="number" v-model.number="months"
                                                        class="w-16 border rounded px-1 py-1 text-xs" min="1" />
                                                    <span class="text-xs">tháng</span>
                                                </div>
                                            </td>
                                            <td class="text-right">{{ displayAmount(livingTotal) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="rentPerMonth"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(rentPerMonth) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="utilitiesPerMonth"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(utilitiesPerMonth) }}</td>
                                        </tr>
                                        <!-- ... other monthly inputs ... -->
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="settlingFurniture"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(settlingFurniture) }}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input type="number" v-model.number="registrationFees"
                                                    class="w-full border rounded px-2 py-1 text-xs" min="0" />
                                            </td>
                                            <td class="text-right">{{ displayAmount(registrationFees) }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="border-t">
                                            <td class="font-semibold">Tổng một lần</td>
                                            <td class="text-right font-semibold text-lg">{{
                                                displayAmount(postOneTimeAud) }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div class="mt-2 text-xs text-gray-600 text-right">{{ displayAmount(postSummaryAud) }}
                                </div>
                            </div>
                        </div>

                        <!-- Tổng hợp column (right fixed column) -->
                        <div class="w-80 flex-shrink-0">
                            <div
                                class="phase-card border rounded p-4 bg-gradient-to-b from-blue-50 to-white sticky top-4">
                                <div class="text-sm font-bold mb-3 text-blue-700">Tổng hợp</div>
                                <table class="w-full text-sm">
                                    <tbody>
                                        <tr>
                                            <td>Trước</td>
                                            <td class="text-right font-semibold">{{ displayAmount(preTotalAud) }}</td>
                                        </tr>
                                        <tr>
                                            <td>Trong</td>
                                            <td class="text-right font-semibold">{{ displayAmount(duringTotalAud) }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Sau (1 lần)</td>
                                            <td class="text-right font-semibold">{{ displayAmount(postOneTimeAud) }}
                                            </td>
                                        </tr>
                                        <tr class="border-t">
                                            <td>Dự phòng
                                                <input type="number" v-model.number="bufferPercent"
                                                    class="w-12 ml-1 border rounded px-1 py-0.5 text-xs" min="0"
                                                    max="50" />
                                                %
                                            </td>
                                            <td class="text-right font-semibold">{{ displayAmount(bufferAmount) }}</td>
                                        </tr>
                                        <tr class="border-t bg-blue-100">
                                            <td class="font-bold text-lg">TỔNG</td>
                                            <td class="text-right font-bold text-xl text-blue-700">{{
                                                displayAmount(totalAud) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                                    {{ formatVnd(totalVnd) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="mt-4 flex gap-2">
                <button @click="save" class="bg-blue-600 text-white px-4 py-2 rounded">Lưu ước tính</button>
                <button @click="reset" class="px-3 py-2 border rounded">Reset</button>
                <div class="ml-auto text-sm text-gray-600">Lưu trữ: <em>localStorage.latest_estimate</em></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
    name: 'CostEstimator',
    setup() {
        const months = ref<number>(3)
        // Monthly breakdown fields (detailed)
        const rentPerMonth = ref<number>(800)
        const utilitiesPerMonth = ref<number>(150)
        const foodPerMonth = ref<number>(150)
        const transportPerMonth = ref<number>(50)
        const otherPerMonth = ref<number>(50)
        const livingPerMonth = computed(() => Math.round((rentPerMonth.value || 0) + (utilitiesPerMonth.value || 0) + (foodPerMonth.value || 0) + (transportPerMonth.value || 0) + (otherPerMonth.value || 0)))
        const flight = ref<number>(1200)
        const insurance = ref<number>(200)
        const bufferPercent = ref<number>(10)
        // Pre-departure costs
        const applicationSubmission = ref<number>(700)
        const englishTest = ref<number>(350)
        const translationCert = ref<number>(200)
        const policeCheck = ref<number>(40)
        const healthCheck = ref<number>(300)
        const documentCert = ref<number>(100)
        const agentFee = ref<number>(0)

        // During / arrival costs
        const initialAccommodationDeposit = ref<number>(800)
        const firstMonthRent = ref<number>(800)
        const simAndSetup = ref<number>(20)
        const groceriesFirstWeeks = ref<number>(200)

        // After / settling one-time costs
        const settlingFurniture = ref<number>(300)
        const registrationFees = ref<number>(50)

        // Provide a sensible default so VND values are available immediately
        // while we fetch the latest rate. We also track loading state so the UI
        // can indicate when the live rate is still being retrieved.
        const audToVnd = ref<number | null>(16000)
        const audRateLoading = ref<boolean>(true)
        // View mode: table vs horizontal phase cards (kept for potential future use)
        const phaseCardsView = ref<boolean>(false)
        // Currency selection: default to VND
        const currency = ref<'VND' | 'AUD'>('VND')

        function displayAmount(aud: number | null | undefined) {
            if (aud === null || aud === undefined || Number.isNaN(aud)) return '-'
            if (currency.value === 'AUD') return `${formatDigits(aud)} AUD`
            const v = toVnd(aud)
            if (v === null || v === undefined) return '-'
            return `${formatDigits(v)} VND`
        }

        onMounted(async () => {
            try {
                const r = await fetch('https://api.exchangerate.host/latest?base=AUD&symbols=VND')
                const d = await r.json()
                if (d && d.rates && typeof d.rates.VND === 'number') audToVnd.value = d.rates.VND
            } catch (e) {
                // keep the default fallback already set above
            } finally {
                audRateLoading.value = false
            }
        })

        const livingTotal = computed(() => Math.round((livingPerMonth.value || 0) * (months.value || 0)))

        const preTotalAud = computed(() => {
            return (applicationSubmission.value || 0) + (englishTest.value || 0) + (translationCert.value || 0) + (policeCheck.value || 0) + (healthCheck.value || 0) + (documentCert.value || 0) + (agentFee.value || 0)
        })

        const duringTotalAud = computed(() => {
            return (flight.value || 0) + (insurance.value || 0) + (initialAccommodationDeposit.value || 0) + (firstMonthRent.value || 0) + (simAndSetup.value || 0) + (groceriesFirstWeeks.value || 0)
        })

        const postOneTimeAud = computed(() => {
            return (settlingFurniture.value || 0) + (registrationFees.value || 0)
        })

        const subtotalAud = computed(() => {
            return preTotalAud.value + duringTotalAud.value + postOneTimeAud.value + livingTotal.value
        })

        const bufferAmount = computed(() => Math.round(subtotalAud.value * ((bufferPercent.value || 0) / 100)))
        const totalAud = computed(() => subtotalAud.value + bufferAmount.value)

        // VND conversions — use the current `audToVnd` value (fallback available)
        const toVnd = (aud: number) => {
            if (!audToVnd.value) return null
            return Math.round((aud || 0) * audToVnd.value)
        }

        const flightVnd = computed(() => toVnd(flight.value))
        const insuranceVnd = computed(() => toVnd(insurance.value))
        const livingTotalVnd = computed(() => toVnd(livingTotal.value))
        const bufferAmountVnd = computed(() => toVnd(bufferAmount.value))
        const totalVnd = computed(() => toVnd(totalAud.value))

        const preTotalVnd = computed(() => toVnd(preTotalAud.value) || null)
        const duringTotalVnd = computed(() => toVnd(duringTotalAud.value) || null)
        const postOneTimeVnd = computed(() => toVnd(postOneTimeAud.value) || null)
        const postSummaryAud = computed(() => postOneTimeAud.value + livingTotal.value)
        const postSummaryVnd = computed(() => toVnd(postSummaryAud.value) || null)

        function formatDigits(n: number | null | undefined) {
            if (n === null || n === undefined || Number.isNaN(n)) return '-'
            return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }

        const formatAud = (v: number) => `${formatDigits(v)} `
        const formatVnd = (v: number | null | undefined) => {
            if (v === null || v === undefined || Number.isNaN(v)) return '-'
            return `${formatDigits(v)} VND`
        }

        function save() {
            try {
                const snapshot = {
                    months: months.value,
                    livingPerMonth: livingPerMonth.value,
                    rentPerMonth: rentPerMonth.value,
                    utilitiesPerMonth: utilitiesPerMonth.value,
                    foodPerMonth: foodPerMonth.value,
                    transportPerMonth: transportPerMonth.value,
                    otherPerMonth: otherPerMonth.value,
                    // pre-departure
                    applicationSubmission: applicationSubmission.value,
                    englishTest: englishTest.value,
                    translationCert: translationCert.value,
                    policeCheck: policeCheck.value,
                    healthCheck: healthCheck.value,
                    documentCert: documentCert.value,
                    agentFee: agentFee.value,
                    // during
                    flight: flight.value,
                    insurance: insurance.value,
                    initialAccommodationDeposit: initialAccommodationDeposit.value,
                    firstMonthRent: firstMonthRent.value,
                    simAndSetup: simAndSetup.value,
                    groceriesFirstWeeks: groceriesFirstWeeks.value,
                    // post
                    settlingFurniture: settlingFurniture.value,
                    registrationFees: registrationFees.value,
                    bufferPercent: bufferPercent.value,
                    totalAud: totalAud.value,
                    totalVnd: totalVnd.value,
                    audToVnd: audToVnd.value
                }
                localStorage.setItem('latest_estimate', JSON.stringify(snapshot))
                alert('Đã lưu ước tính')
            } catch (e) {
                // ignore
            }
        }

        function reset() {
            months.value = 3
            rentPerMonth.value = 800
            utilitiesPerMonth.value = 150
            foodPerMonth.value = 150
            transportPerMonth.value = 50
            otherPerMonth.value = 50
            // pre
            applicationSubmission.value = 700
            englishTest.value = 350
            translationCert.value = 200
            policeCheck.value = 40
            healthCheck.value = 300
            documentCert.value = 100
            agentFee.value = 0
            // during
            flight.value = 1200
            insurance.value = 200
            initialAccommodationDeposit.value = 800
            firstMonthRent.value = 800
            simAndSetup.value = 20
            groceriesFirstWeeks.value = 200
            // post
            settlingFurniture.value = 300
            registrationFees.value = 50
            bufferPercent.value = 10
        }

        return {
            // basic
            months,
            rentPerMonth,
            utilitiesPerMonth,
            foodPerMonth,
            transportPerMonth,
            otherPerMonth,
            livingPerMonth,
            // pre-departure
            applicationSubmission,
            englishTest,
            translationCert,
            policeCheck,
            healthCheck,
            documentCert,
            agentFee,
            // during
            flight,
            insurance,
            initialAccommodationDeposit,
            firstMonthRent,
            simAndSetup,
            groceriesFirstWeeks,
            // post
            settlingFurniture,
            registrationFees,
            // computed totals
            preTotalAud,
            duringTotalAud,
            postOneTimeAud,
            livingTotal,
            subtotalAud,
            bufferPercent,
            bufferAmount,
            totalAud,
            // VND conversions
            flightVnd,
            insuranceVnd,
            livingTotalVnd,
            bufferAmountVnd,
            totalVnd,
            preTotalVnd,
            duringTotalVnd,
            postOneTimeVnd,
            audToVnd,
            audRateLoading,

            postSummaryAud,
            postSummaryVnd,
            // helpers
            formatDigits,
            formatAud,
            formatVnd,
            toVnd,
            phaseCardsView,
            currency,
            displayAmount,
            save,
            reset
        }
    }
})
</script>

<style scoped>
.cost-input {
    min-width: 120px;
    max-width: 220px
}

table td {
    vertical-align: middle
}

.spacer td {
    padding: 0;
    border: none;
    height: 8px
}

thead th {
    background: #fbfdff
}
</style>
