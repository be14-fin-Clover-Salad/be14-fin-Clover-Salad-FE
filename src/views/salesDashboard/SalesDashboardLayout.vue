<template>
  <div class="dashboard-container">
    <div class="dashboard-top">
      <div class="year-sales">
        <YearSalesCard />
      </div>
      <div class="dashboard-middle">
        <div class="month-and-quarter-sales">
          <MonthQuarterSalesCard />
        </div>
        <div class="filter-sales">
          <div class="filter-options-row">
            <!-- 연도 선택 -->
            <select v-model="filterYear">
              <option v-for="year in yearRange" :key="year" :value="year">{{ year }}년</option>
            </select>
            <!-- 기간 타입 선택 -->
            <select v-model="filterPeriodType">
              <option value="month">월</option>
              <option value="quarter">분기</option>
              <option value="year">년</option>
            </select>
            <!-- 월/분기/년 옵션 -->
            <select v-model="filterPeriodValue" :disabled="filterPeriodType === 'year'">
              <option v-if="filterPeriodType === 'month'" v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
              <option v-else-if="filterPeriodType === 'quarter'" v-for="q in 4" :key="q" :value="q">{{ q }}분기</option>
              <option v-else value="">-</option>
            </select>
          </div>
        </div>
      </div>
      <div class="condition-graph">
        <div class="condition-title">
          <span>{{ conditionGraphTitle }}</span>
          <span class="total-amount">{{ formatCurrency(totalTeamAmount) }}</span>
        </div>
        <v-chart :option="donutOption" autoresize style="height:320px;" />
      </div>
    </div>
    <div class="dashboard-bottom">
      <div class="sales-progress">
        <YearlySalesLineChart :year="filterYear" :periodType="filterPeriodType" />
      </div>
      <div class="sales-by-teams">
        <TeamSalesBarChart :year="filterYear" :periodType="filterPeriodType" :periodValue="filterPeriodValue" :teamColors="teamColors" @totalAmount="handleTotalAmount" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import YearSalesCard from '@/components/salesDashboard/YearSalesCard.vue'
import MonthQuarterSalesCard from '@/components/salesDashboard/MonthQuarterSalesCard.vue'
import YearlySalesLineChart from '@/components/salesDashboard/YearlySalesLineChart.vue'
import TeamSalesBarChart from '@/components/salesDashboard/TeamSalesBarChart.vue'
import api from '@/api/auth'

const router = useRouter()

// 기간/연도/월/분기 옵션
const period = ref('month')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedQuarter = ref(Math.floor((new Date().getMonth()) / 3) + 1)
const yearOptions = [2022, 2023, 2024]

// filter-sales용 옵션
const thisYear = new Date().getFullYear()
const yearRange = Array.from({length: thisYear - 2010 + 1}, (_, i) => 2010 + i).reverse()
const filterYear = ref(thisYear)
const filterPeriodType = ref('month')
const filterPeriodValue = ref(1)

watch(filterPeriodType, (val) => {
  if (val === 'month') filterPeriodValue.value = 1
  else if (val === 'quarter') filterPeriodValue.value = 1
  else filterPeriodValue.value = ''
})

const conditionGraphTitle = computed(() => {
  if (filterPeriodType.value === 'month') {
    return `${filterYear.value}년 ${filterPeriodValue.value}월 매출`
  } else if (filterPeriodType.value === 'quarter') {
    return `${filterYear.value}년 ${filterPeriodValue.value}분기 매출`
  } else {
    return `${filterYear.value}년 전체 매출`
  }
})

// 영업1팀~5팀 도넛 차트 데이터 (반응형)
const teamDonutData = ref([])
const teamColors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']

// filterYear, filterPeriodType, filterPeriodValue 변경 시 API 요청
watch([filterYear, filterPeriodType, filterPeriodValue], async ([year, type, value]) => {
  let url = ''
  if (type === 'month') {
    url = `/dashboard/sales/ratio/monthly/detail?year=${year}&month=${value}`
  } else if (type === 'quarter') {
    url = `/dashboard/sales/ratio/quarterly/detail?year=${year}&quarter=${value}`
  } else if (type === 'year') {
    url = `/dashboard/sales/ratio/yearly/detail?year=${year}`
  }
  if (url) {
    try {
      const res = await api.get(url)
      if (Array.isArray(res.data)) {
        teamDonutData.value = res.data.map(item => ({
          name: item.teamName,
          value: item.ratio
        }))
      } else {
        teamDonutData.value = []
      }
    } catch (e) {
      teamDonutData.value = []
      console.error('팀 비중 요청 에러:', e)
    }
  }
}, { immediate: true })

const donutOption = computed(() => ({
  color: teamColors,
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {d}%'
  },
  legend: {
    show: false
  },
  series: [
    {
      name: '팀별 비중',
      type: 'pie',
      radius: '90%',
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}\n{d}%',
        fontSize: 16,
        fontWeight: 'bold'
      },
      labelLine: { show: false },
      data: teamDonutData.value
    }
  ]
}))

function goToSales(periodType) {
  let query = `/sales?period=${periodType}&team=all&year=${selectedYear.value}`
  if (periodType === 'month') query += `&month=${selectedMonth.value}`
  if (periodType === 'quarter') query += `&quarter=${selectedQuarter.value}`
  router.push(query)
}
function onLineClick(params) {
  let idx = params.dataIndex
  let periodType = period.value
  let label = lineLabels[periodType][idx]
  let query = `/sales?period=${periodType}&team=all&year=${selectedYear.value}`
  if (periodType === 'month') query += `&month=${selectedMonth.value}`
  if (periodType === 'quarter') query += `&quarter=${selectedQuarter.value}`
  query += `&label=${label}`
  router.push(query)
}
function onBarClick(params) {
  let periodType = period.value
  let query = `/sales?period=${periodType}&team=${params.name}&year=${selectedYear.value}`
  if (periodType === 'month') query += `&month=${selectedMonth.value}`
  if (periodType === 'quarter') query += `&quarter=${selectedQuarter.value}`
  router.push(query)
}

function formatCurrency(val) {
  if (val >= 1e8) return (val / 1e8).toFixed(1) + '억원'
  if (val >= 1e4) return (val / 1e4).toFixed(1) + '만원'
  return val.toLocaleString() + '원'
}

const totalTeamAmount = ref(0)
function handleTotalAmount(val) {
  totalTeamAmount.value = val
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background: #f7f8fa;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.dashboard-top, .dashboard-bottom {
  width: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
}
.dashboard-top {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 24px;
  flex: 0.5 1 0;
  min-height: 0;
}
.dashboard-bottom {
  flex: 1 1 0;
  min-height: 0;
  margin-top: 24px;
  gap: 24px;
}
.dashboard-middle, .condition-graph {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 0;
}
.year-sales {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 0.8 1 0;
}
.dashboard-middle {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: stretch;
  background: #f7f8fa;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
.month-and-quarter-sales {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
}
.filter-sales {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.condition-graph {
  flex: 1 1 0;
  margin-left: 0;
}
.sales-progress, .sales-by-teams {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dashboard-cards {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px 32px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  position: relative;
}
.card-title {
  color: #888;
  font-size: 15px;
  margin-bottom: 8px;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
}
.card-donut {
  position: absolute;
  right: 16px;
  bottom: 16px;
}
.card-dropdown {
  min-width: 300px;
  font-size: 15px;
  label { margin-right: 8px; }
  select {
    margin-right: 16px;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  cursor: default;
}
.percent {
  font-size: 16px;
  margin-left: 8px;
}
.dashboard-charts {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.chart-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chart-title {
  font-size: 17px;
  font-weight: 500;
  margin-bottom: 16px;
}
.dashboard-line {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  margin-bottom: 32px;
}
.filter-options-row {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  align-items: center;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 0.15em 0.5em rgba(80, 120, 200, 0.07);
  padding: 1.1em 1.5em;
  flex-wrap: wrap;
  border: 1px solid #f0f1f5;
}
.filter-options-row select {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  appearance: none;
  background: #f8fafd;
  border: 1.5px solid #e0e4ea;
  border-radius: 0.5em;
  padding: 0.7em 2.2em 0.7em 1em;
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  box-shadow: 0 0.05em 0.2em rgba(80, 120, 200, 0.04);
  transition: border 0.18s, box-shadow 0.18s;
  outline: none;
  cursor: pointer;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%2399a" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 8.293a1 1 0 011.414 0L10 9.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.9em center;
}
.filter-options-row select:focus, .filter-options-row select:hover {
  border: 1.5px solid #5470c6;
  box-shadow: 0 0.2em 0.6em rgba(84, 112, 198, 0.10);
  background: #f4f7fd;
}
.filter-options-row option {
  font-size: 0.97rem;
  color: #333;
}
@media (max-width: 600px) {
  .filter-options-row {
    flex-direction: column;
    gap: 0.7em;
    padding: 0.7em 0.5em;
  }
  .filter-options-row select {
    width: 100%;
    min-width: 0;
  }
}
.condition-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-amount {
  font-size: 18px;
  font-weight: 500;
  color: #858585;
  margin-left: 1.5em;
}
</style>