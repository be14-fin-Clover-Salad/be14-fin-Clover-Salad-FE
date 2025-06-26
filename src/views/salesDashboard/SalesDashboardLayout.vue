<template>
  <!-- 공통 layout(view-area)의 패딩/배경을 덮는 래퍼 -->
  <div class="dashboard-wrapper">
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
              <select v-model="filterYear">
                <option v-for="year in yearRange" :key="year" :value="year">{{ year }}년</option>
              </select>
              <select v-model="filterPeriodType">
                <option value="month">월</option>
                <option value="quarter">분기</option>
                <option value="year">년</option>
              </select>
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

const period = ref('month')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedQuarter = ref(Math.floor((new Date().getMonth()) / 3) + 1)
const thisYear = new Date().getFullYear()
const yearRange = Array.from({ length: thisYear - 2010 + 1 }, (_, i) => 2010 + i).reverse()

const filterYear = ref(thisYear)
const filterPeriodType = ref('month')
const filterPeriodValue = ref(1)

watch(filterPeriodType, (val) => {
  if (val === 'month') filterPeriodValue.value = 1
  else if (val === 'quarter') filterPeriodValue.value = 1
  else filterPeriodValue.value = ''
})

const conditionGraphTitle = computed(() => {
  if (filterPeriodType.value === 'month') return `${filterYear.value}년 ${filterPeriodValue.value}월 매출`
  if (filterPeriodType.value === 'quarter') return `${filterYear.value}년 ${filterPeriodValue.value}분기 매출`
  return `${filterYear.value}년 전체 매출`
})

const teamDonutData = ref([])
const teamColors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']

watch([filterYear, filterPeriodType, filterPeriodValue], async ([year, type, value]) => {
  let url = ''
  if (type === 'month') url = `/dashboard/sales/ratio/monthly/detail?year=${year}&month=${value}`
  else if (type === 'quarter') url = `/dashboard/sales/ratio/quarterly/detail?year=${year}&quarter=${value}`
  else if (type === 'year') url = `/dashboard/sales/ratio/yearly/detail?year=${year}`

  try {
    const res = await api.get(url)
    teamDonutData.value = Array.isArray(res.data)
      ? res.data.map(item => ({ name: item.teamName, value: item.ratio }))
      : []
  } catch (e) {
    teamDonutData.value = []
  }
}, { immediate: true })

const donutOption = computed(() => ({
  color: teamColors,
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: {
      fontSize: 14
    }
  },
  series: [{
    name: '팀별 비중',
    type: 'pie',
    radius: '70%',
    center: ['40%', '50%'],
    label: {
      show: true,
      position: 'inside',
      formatter: '{d}%',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff'
    },
    labelLine: { show: false },
    data: teamDonutData.value
  }]
}))

const totalTeamAmount = ref(0)
function handleTotalAmount(val) {
  totalTeamAmount.value = val
}

function formatCurrency(val) {
  if (val >= 1e8) return (val / 1e8).toFixed(1) + '억원'
  if (val >= 1e4) return (val / 1e4).toFixed(1) + '만원'
  return val.toLocaleString() + '원'
}
</script>

<style lang="scss" scoped>
.dashboard-wrapper {
  position: relative;
  z-index: 10;
  padding: 30px;
  background-color: #f7f8fa;
  overflow-x: hidden;
  overflow-y: auto;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 이하 기존 스타일 그대로 유지 */
.dashboard-top, .dashboard-bottom {
  width: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
}

.dashboard-top {
  gap: 24px;
  flex: none;
  height: 320px;
  min-height: 0;
}
.dashboard-bottom {
  flex: none;
  height: 500px;
  min-height: 0;
  margin-top: 24px;
  gap: 24px;
}
.dashboard-middle, .condition-graph {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: none;
  width: 475px;
}
.year-sales {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: none;
  width: 380px;
}
.dashboard-middle {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f8fa;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
  justify-content: space-between;
}
.month-and-quarter-sales {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  min-height: 140px;
}
.filter-sales {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.condition-graph {
  margin-left: 0;
}
.sales-progress, .sales-by-teams {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: none;
  width: 676px;
}
.filter-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding: 1.1em 1.5em;
  background: #fff;
  border: 1px solid #f0f1f5;
  border-radius: 0.75rem;
  box-shadow: 0 0.15em 0.5em rgba(80, 120, 200, 0.07);
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
  background-image: url('data:image/svg+xml;utf8,<svg fill="%2399a" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 8.293a1 1 0 011.414 0L10 9.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.9em center;
  box-shadow: 0 0.05em 0.2em rgba(80, 120, 200, 0.04);
  transition: border 0.18s, box-shadow 0.18s;
  outline: none;
  cursor: pointer;
}
.filter-options-row select:focus,
.filter-options-row select:hover {
  border: 1.5px solid #5470c6;
  box-shadow: 0 0.2em 0.6em rgba(84, 112, 198, 0.10);
  background: #f4f7fd;
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

// :global(.view-area) {
//   padding: 0 !important;
//   background-color: #f7f8fa !important; /* 필요시 배경도 덮어쓰기 */
// }
</style>