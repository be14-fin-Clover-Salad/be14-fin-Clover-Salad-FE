<template>
  <div class="month-quarter-sales-card">
    <div class="sales-block">
      <div class="title">이번 달 매출</div>
      <div class="value" v-if="!loadingMonth">{{ formatCurrency(monthTotal) }}</div>
      <div class="value" v-else>로딩중...</div>
    </div>
    <div class="sales-block">
      <div class="title">이번 분기 매출</div>
      <div class="value" v-if="!loadingQuarter">{{ formatCurrency(quarterTotal) }}</div>
      <div class="value" v-else>로딩중...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/auth'

const monthTotal = ref(null)
const quarterTotal = ref(null)
const loadingMonth = ref(true)
const loadingQuarter = ref(true)

onMounted(async () => {
  try {
    const resMonth = await api.get('/dashboard/sales/total?period=month')
    monthTotal.value = resMonth.data.totalAmount
  } catch (e) {
    monthTotal.value = 0
  } finally {
    loadingMonth.value = false
  }

  try {
    const resQuarter = await api.get('/dashboard/sales/total?period=quarter')
    quarterTotal.value = resQuarter.data.totalAmount
  } catch (e) {
    quarterTotal.value = 0
  } finally {
    loadingQuarter.value = false
  }
})

function formatCurrency(val) {
  if (val == null) return '-'
  if (val >= 1e8) return (val / 1e8).toFixed(1) + '억원'
  if (val >= 1e4) return (val / 1e4).toFixed(1) + '만원'
  return val.toLocaleString() + '원'
}
</script>

<style scoped>
.month-quarter-sales-card {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: 100%;
  justify-content: center;
}
.sales-block {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  flex: 1 1 0;
  justify-content: center;
}
.title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
}
.value {
  font-size: 28px;
  font-weight: bold;
}
</style> 