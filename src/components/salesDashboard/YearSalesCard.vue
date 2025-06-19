<template>
  <div class="year-sales-card">
    <div class="title">올해 매출</div>
    <div class="value">{{ formatCurrency(currentYear) }}</div>
    <div v-if="!loading && !isNaN(diff) && lastYear > 0" class="diff-text">
      <span :class="diff > 0 ? 'triangle-up' : diff < 0 ? 'triangle-down' : ''">
        <template v-if="diff > 0">▲</template>
        <template v-else-if="diff < 0">▼</template>
      </span>
      {{ diffText }}
    </div>
    <div class="subtitle">작년 매출</div>
    <div class="subvalue">{{ formatCurrency(lastYear) }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/auth'

const currentYear = ref(null)
const lastYear = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const resYear = await api.get('/dashboard/sales/total?period=year')
    console.log('올해 매출 응답:', resYear.data)
    currentYear.value = resYear.data.totalAmount
    
    const resLastYear = await api.get('/dashboard/sales/total?period=lastyear')
    console.log('작년 매출 응답:', resLastYear.data)
    lastYear.value = resLastYear.data.totalAmount
  } catch (e) {
    currentYear.value = 0
    lastYear.value = 0
  } finally {
    loading.value = false
  }
})

const diff = computed(() => {
  if (currentYear.value == null || lastYear.value == null) return NaN
  return currentYear.value - lastYear.value
})
const diffRate = computed(() => {
  if (currentYear.value == null || lastYear.value == null || lastYear.value === 0) return null
  return ((diff.value / lastYear.value) * 100).toFixed(1)
})
const diffText = computed(() => {
  if (isNaN(diff.value) || lastYear.value === 0) return '-'
  const absDiff = Math.abs(diff.value)
  return `${formatCurrency(absDiff)} (${diffRate.value}%)`
})

function formatCurrency(val) {
  if (val == null) return '-'
  if (val >= 1e8) return (val / 1e8).toFixed(1) + '억원'
  if (val >= 1e4) return (val / 1e4).toFixed(1) + '만원'
  return val.toLocaleString() + '원'
}
</script>

<style scoped>
.year-sales-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}
.value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}
.diff-text {
  color: #888;
  font-size: 15px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.triangle-up {
  color: #2ecc71;
  font-size: 18px;
  margin-right: 4px;
}
.triangle-down {
  color: #e74c3c;
  font-size: 18px;
  margin-right: 4px;
}
.subtitle {
  font-size: 15px;
  color: #888;
  margin-bottom: 4px;
  margin-top: 70px;
}
.subvalue {
  font-size: 22px;
  font-weight: 500;
}
</style> 