<template>
  <div class="dashboard-page">
    <!-- 0) Period Switch -->
    <div class="period-switch">
      <button
        v-for="opt in periodOptions"
        :key="opt.value"
        @click="setPeriod(opt.value)"
        :class="{ active: period === opt.value }"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 1) Gauge Cards -->
    <div class="icon-stats-row">
      <div class="icon-card" v-for="(s, i) in gaugeStats" :key="i">
        <div class="gauge-wrapper">
          <v-chart
            :option="s.gaugeOption"
            autoresize
            style="width:80px; height:80px;"
          />
          <div v-if="s.currentPercent > 1" class="gauge-over">
            +{{ ((s.currentPercent - 1) * 100).toFixed(0) }}%
          </div>
        </div>
        <div class="icon-content">
          <p class="icon-title">{{ s.title }}</p>
          <h3 class="icon-value">{{ s.value }}</h3>
          <small class="icon-subtitle">{{ s.subtitle }}</small>
        </div>
      </div>
    </div>

    <!-- 2) Performance Line Chart -->
    <div class="card performance-chart">
      <div class="card-header">
        <div class="header-left">
          <h4 class="card-title">총 렌탈료</h4>
          <p class="card-category">계약 전체 렌탈료</p>
        </div>
      </div>
      <div class="card-body">
        <v-chart
          :option="performanceOption"
          autoresize
          style="height:260px;"
        />
      </div>
    </div>

    <!-- 3) Three Stat Cards -->
    <div class="stats-row">
      <div class="card stat-card" v-for="(s, i) in stats" :key="i">
        <div class="card-header">
          <p class="card-category">{{ s.title }}</p>
          <h3 class="card-title">
            {{ s.value }}<small>{{ s.suffix }}</small>
          </h3>
        </div>
        <div class="card-body padded-chart">
          <v-chart
            v-if="s.chart"
            :option="s.chart"
            autoresize
            style="height:140px;"
          />
        </div>
      </div>
    </div>

    <!-- 4+5) Half-width Charts -->
    <div class="half-row">
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">렌탈 상품 카테고리</h4>
        </div>
        <div class="card-body padded-chart status-container">
          <v-chart
            :option="statusOption"
            autoresize
            style="height:260px;"
          />
        </div>
      </div>
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">{{ periodLabel }} 매출 비교</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart
            :option="monthOption"
            autoresize
            style="height:260px;"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'

// 0) Period Switch
const periodOptions = [
  { label: '월별', value: 'month' },
  { label: '분기별', value: 'quarter' },
  { label: '연별', value: 'year' }
]
const period = ref('month')
const periodLabel = ref('월별')
function setPeriod(v) {
  period.value = v
  periodLabel.value = periodOptions.find(o => o.value === v).label
}

// 1) Gauge Cards
const gaugeStats = [
  {
    title: '렌탈 상품 수',
    value: '150',
    subtitle: '전체 건수',
    percentMap: { month: 1.2, quarter: 1.1, year: 1.05 },
    color: '#f5365c',
    currentPercent: 0
  },
  {
    title: '렌탈 유지율',
    value: '70%',
    subtitle: '계약 무효, 만료 제외',
    percentMap: { month: 0.6, quarter: 0.75, year: 0.8 },
    color: '#5e72e4',
    currentPercent: 0
  },
  {
    title: '신규 고객수',
    value: '4',
    subtitle: '본인 기준',
    percentMap: { month: 0.9, quarter: 1.0, year: 1.2 },
    color: '#11cdef',
    currentPercent: 0
  },
  {
    title: '고객 만족도',
    value: '80%',
    subtitle: '상담 별점',
    percentMap: { month: 1.05, quarter: 1.02, year: 1.0 },
    color: '#fb6340',
    currentPercent: 0
  }
]
gaugeStats.forEach(s => {
  s.gaugeOption = reactive({
    series: [
      {
        type: 'gauge',
        radius: '100%',
        startAngle: 90,
        endAngle: -270,
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: { lineStyle: { width: 8, color: [[0, '#eee'], [1, '#eee']] }},
        pointer: { show: false },
        detail: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        data: [{ value: 0 }]
      }
    ]
  })
})
watch(period, () => {
  gaugeStats.forEach(s => {
    const p = Math.min(s.percentMap[period.value] || 0, 1)
    s.currentPercent = s.percentMap[period.value] || 0
    const ser = s.gaugeOption.series[0]
    ser.data[0].value = p
    ser.axisLine.lineStyle.color = [[p, s.color], [1, '#eee']]
  })
}, { immediate: true })

// 2) Performance Line Chart
const rawData = {
  month: [100, 78, 90, 76, 88, 65, 80, 70, 95, 85, 110, 105],
  quarter: [260, 240, 280, 300],
  year: [1200]
}
const performanceOption = reactive({
  grid: { top: '10%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [], axisLine: { lineStyle: { color: '#e9ecef' } }, axisLabel: { color: '#9fa9b1' }, axisTick: { show: false } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#e9ecef' } }, axisLine: { show: false }, axisLabel: { color: '#9fa9b1' } },
  series: [{
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2, color: '#55ce63' },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(85,206,99,0.4)' },
        { offset: 1, color: 'rgba(255,255,255,0.1)' }
      ])
    },
    data: []
  }]
})
watch(period, val => {
  if (val === 'month') {
    performanceOption.xAxis.data = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
    performanceOption.series[0].data = rawData.month
  } else if (val === 'quarter') {
    performanceOption.xAxis.data = ['Q1','Q2','Q3','Q4']
    performanceOption.series[0].data = rawData.quarter
  } else {
    performanceOption.xAxis.data = ['Year']
    performanceOption.series[0].data = rawData.year
  }
}, { immediate: true })

// 3) Three Stat Cards
const stats = [
  {
    title: '렌탈 상품 수',
    value: period.value === 'year' ? '1,800' : period.value === 'quarter' ? '450' : '150',
    suffix: '',
    chart: performanceOption
  },
  {
    title: '렌탈 유지율',
    value: period.value === 'year' ? '75%' : period.value === 'quarter' ? '72%' : '70%',
    suffix: '',
    chart: performanceOption
  },
  {
    title: '신규 고객수',
    value: period.value === 'year' ? '18' : period.value === 'quarter' ? '6' : '4',
    suffix: '',
    chart: performanceOption
  }
]
watch(period, () => {
  stats[0].value = period.value === 'year' ? '1,800' : period.value === 'quarter' ? '450' : '150'
  stats[1].value = period.value === 'year' ? '75%' : period.value === 'quarter' ? '72%' : '70%'
  stats[2].value = period.value === 'year' ? '18' : period.value === 'quarter' ? '6' : '4'
})

// 4) Status Bar Chart
const productStatus = [
  { name: '기타', value: 10 },
  { name: '세탁기', value: 20 },
  { name: '냉장고', value: 10 },
  { name: '에어컨', value: 25 },
  { name: 'TV', value: 15 },
  { name: '전자레인지', value: 20 }
]
const sum = productStatus.reduce((s, o) => s + o.value, 0)
const statusOption = reactive({
  tooltip: { formatter: '{b}: {c}%' },
  grid: {
    top: '10%',
    left: 0,            // 그리드 시작을 카드 패딩 끝에서!
    right: '20%',
    bottom: '15%',
    containLabel: true  // 레이블 너비 자동 확보
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: 100,
    boundaryGap: [0, 0],
    axisLine: {
     show: true,                // ← x축 축선을 다시 보여주고
     lineStyle: { color: '#ccc' },
     onZero: true               // ← 0 위치에서 세로 기준선으로 그립니다
   },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
    axisLabel: { formatter: '{value}%' }
  },
  yAxis: {
    type: 'category',
    data: productStatus.map(d => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      inside: false,
      align: 'right',
      color: '#525f7f',
      fontSize: 12,
      margin: 8
    }
  },
  series: [{
    type: 'bar',
    data: productStatus.map(d => +(d.value / sum * 100).toFixed(1)),
    barWidth: '40%',
    itemStyle: { color: '#5e72e4', borderRadius: [0, 8, 8, 0] },
    label: { show: true, position: 'right', formatter: '{c}%', color: '#32325d' }
  }]
})

// 5) Monthly Sales Bar Chart
const monthLabels = ['3월','4월','5월']
const monthSalesMap = {
  month: [15,10,6],
  quarter: [75,80,90,85],
  year: [360]
}
const monthOption = reactive({
  grid: { top: '10%', left: '3%', right: '5%', bottom: '15%', containLabel: true },
  xAxis: { type: 'category', data: [], boundaryGap: [0,0], axisLine: { lineStyle: { color: '#e9ecef' } }, axisTick: { show: false }, axisLabel: { color: '#525f7f' } },
  yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#525f7f' } },
  series: [{
    type: 'bar',
    data: [],
    barWidth: '40%',
    itemStyle: {
      color: (p) => ['#ff7f7f','#ffe066','#a3e635','#8dd3c7'][p.dataIndex],
      borderRadius: [8,8,0,0]
    },
    label: { show: true, position: 'top', color: '#333' }
  }]
})
watch(period, val => {
  if (val === 'month') {
    monthOption.xAxis.data = monthLabels
    monthOption.series[0].data = monthSalesMap.month
  } else if (val === 'quarter') {
    monthOption.xAxis.data = ['Q1','Q2','Q3','Q4']
    monthOption.series[0].data = monthSalesMap.quarter
  } else {
    monthOption.xAxis.data = ['Year']
    monthOption.series[0].data = monthSalesMap.year
  }
}, { immediate: true })
</script>

<style scoped>
.dashboard-page {
  padding:24px;
  background:#f4f5f7;
  min-height:100vh;
  box-sizing:border-box;
}

/* Period Switch */
.period-switch {
  text-align:right;
  margin-bottom:16px;
}
.period-switch button {
  margin-left:8px;
  padding:4px 12px;
  border:none;
  background:#e9ecef;
  border-radius:4px;
  cursor:pointer;
}
.period-switch button.active {
  background:#5e72e4;
  color:#fff;
}

/* Gauge Cards */
.icon-stats-row { display:flex; gap:16px; margin-bottom:24px; }
.icon-card {
  flex:1; background:#fff; border-radius:12px; padding:16px;
  display:flex; align-items:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);
}
.gauge-wrapper {
  position:relative; width:80px; height:80px; margin-right:16px;
}
.gauge-over {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  font-size:0.75rem; font-weight:600; color:#f5365c;
}
.icon-content .icon-title { margin:0; color:#8898aa; font-size:0.875rem; }
.icon-content .icon-value { margin:4px 0; font-size:1.25rem; font-weight:600; }
.icon-content .icon-subtitle { color:#adb5bd; font-size:0.75rem; }

/* Cards */
.card {
  background:#fff; border-radius:12px; margin-bottom:24px;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
}
.card-header { padding:16px; border-bottom:1px solid #f0f1f5; }
.header-left { display:flex; flex-direction:column; }
.card-title { margin:0; font-size:1.25rem; font-weight:600; }
.card-category { margin:4px 0 0; color:#8898aa; font-size:0.875rem; }
.card-body {
  padding:16px;
  overflow: visible; /* 레이블 잘림 방지 */
}

/* Stats Row */
.stats-row { display:flex; gap:16px; margin-bottom:24px; }
.stat-card { flex:1; }
.padded-chart { padding:16px; }

/* Half Row */
.half-row { display:flex; gap:16px; }
.half-card { flex:1; }
.status-container { overflow: visible; }
</style>
