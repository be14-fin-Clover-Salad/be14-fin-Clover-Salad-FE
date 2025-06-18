<template>
  <div class="team-sales-bar-chart">
    <div class="chart-title">{{ chartTitle }}</div>
    <v-chart v-show="!loading && !error" :option="barOption" autoresize style="height:320px;" />
    <div v-if="loading">로딩중...</div>
    <div v-else-if="error">데이터가 없습니다.</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import api from '@/api/auth'

const props = defineProps({
  year: { type: Number, required: true },
  periodType: { type: String, default: 'month' }, // 'month' | 'quarter' | 'year'
  periodValue: { type: [Number, String], default: 1 }, // 월/분기 값
  teamColors: { type: Array, default: () => ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'] }
})

const loading = ref(true)
const error = ref(false)
const teamNames = ref([])
const teamAmounts = ref([])

const chartTitle = computed(() => {
  if (props.periodType === 'month') {
    return `${props.year}년 ${props.periodValue}월 팀별 매출`
  } else if (props.periodType === 'quarter') {
    return `${props.year}년 ${props.periodValue}분기 팀별 매출`
  } else {
    return `${props.year}년 팀별 매출`
  }
})

let isUnmounted = false
onUnmounted(() => { isUnmounted = true })

const fetchData = async () => {
  loading.value = true
  error.value = false
  try {
    let url = ''
    if (props.periodType === 'month') {
      url = `/dashboard/sales/amount/monthly/detail?year=${props.year}&month=${props.periodValue}`
    } else if (props.periodType === 'quarter') {
      url = `/dashboard/sales/amount/quarterly/detail?year=${props.year}&quarter=${props.periodValue}`
    } else {
      url = `/dashboard/sales/amount/yearly/detail?year=${props.year}`
    }
    const res = await api.get(url)
    if (!isUnmounted) {
      if (Array.isArray(res.data) && res.data.length > 0) {
        teamNames.value = res.data.map(item => item.teamName)
        teamAmounts.value = res.data.map(item => item.teamAmount)
      } else {
        teamNames.value = []
        teamAmounts.value = []
        error.value = true
      }
    }
  } catch (e) {
    if (!isUnmounted) {
      teamNames.value = []
      teamAmounts.value = []
      error.value = true
    }
  } finally {
    if (!isUnmounted) loading.value = false
  }
}

onMounted(fetchData)
watch(() => [props.year, props.periodType, props.periodValue], fetchData)

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: teamNames.value
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
      data: teamAmounts.value,
      type: 'bar',
      itemStyle: {
        color: function(params) {
          return props.teamColors[params.dataIndex % props.teamColors.length]
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: function(params) {
          if (params.value >= 1e8) return (params.value / 1e8) + '억'
          if (params.value >= 1e4) return (params.value / 1e4) + '만'
          return params.value.toLocaleString()
        }
      },
      barWidth: 40
    }
  ]
}))
</script>

<style scoped>
.team-sales-bar-chart {
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