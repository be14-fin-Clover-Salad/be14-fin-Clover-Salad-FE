<template>
  <div class="yearly-sales-line-chart">
    <div class="chart-title">{{ year }}년 {{ periodType === 'quarter' ? '분기별' : periodType === 'year' ? '연도별' : '월별' }} 매출 추이</div>
    <v-chart v-show="!loading && !error" :option="lineOption" autoresize style="height:320px;" />
    <div v-if="loading">로딩중...</div>
    <div v-else-if="error">데이터가 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import api from '@/api/auth'

const props = defineProps({
  year: { type: Number, required: true },
  periodType: { type: String, default: 'month' } // 'month' | 'quarter' | 'year'
})

const loading = ref(true)
const error = ref(false)
const salesData = ref([])

const xLabels = computed(() => {
  if (props.periodType === 'quarter') {
    return ['1분기','2분기','3분기','4분기']
  } else if (props.periodType === 'year') {
    // 올해 포함 10년간
    const thisYear = props.year
    return Array.from({length: 10}, (_, i) => (thisYear - 9 + i) + '년')
  } else {
    return ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  }
})

let isUnmounted = false
onUnmounted(() => { isUnmounted = true })

const fetchData = async () => {
  loading.value = true
  error.value = false
  try {
    let url = ''
    if (props.periodType === 'quarter') {
      url = `/dashboard/sales/trend/quarterly?year=${props.year}`
    } else if (props.periodType === 'year') {
      const thisYear = props.year
      const startYear = thisYear - 9
      url = `/dashboard/sales/trend/yearly?startYear=${startYear}&endYear=${thisYear}`
    } else {
      url = `/dashboard/sales/trend/monthly?year=${props.year}`
    }
    const res = await api.get(url)
    if (!isUnmounted) {
      let arr
      if (props.periodType === 'quarter') {
        arr = Array(4).fill(0)
        if (Array.isArray(res.data)) {
          res.data.forEach(item => {
            if (item.quarter >= 1 && item.quarter <= 4) {
              arr[item.quarter - 1] = item.totalAmount
            }
          })
        }
      } else if (props.periodType === 'year') {
        // 연간 데이터: 10년간
        const thisYear = props.year
        arr = Array(10).fill(0)
        if (Array.isArray(res.data)) {
          res.data.forEach(item => {
            const idx = item.year - (thisYear - 9)
            if (idx >= 0 && idx < 10) {
              arr[idx] = item.totalAmount
            }
          })
        }
      } else {
        arr = Array(12).fill(0)
        if (Array.isArray(res.data)) {
          res.data.forEach(item => {
            if (item.month >= 1 && item.month <= 12) {
              arr[item.month - 1] = item.totalAmount
            }
          })
        }
      }
      salesData.value = arr
      if (!arr || arr.every(v => v === 0)) error.value = true
    }
  } catch (e) {
    if (!isUnmounted) {
      salesData.value = props.periodType === 'quarter' ? Array(4).fill(0) : props.periodType === 'year' ? Array(10).fill(0) : Array(12).fill(0)
      error.value = true
    }
  } finally {
    if (!isUnmounted) loading.value = false
  }
}

onMounted(fetchData)
watch(() => [props.year, props.periodType], fetchData)

const lineOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: xLabels.value
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: function(value) {
        if (value >= 1e8) return (value / 1e8) + '억'
        if (value >= 1e4) return (value / 1e4) + '만'
        return value.toLocaleString()
      }
    }
  },
  series: [
    {
      data: salesData.value,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      areaStyle: { color: 'rgba(84,112,198,0.1)' },
      lineStyle: { color: '#5470C6' }
    }
  ]
}))
</script>

<style scoped>
.yearly-sales-line-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.chart-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style> 