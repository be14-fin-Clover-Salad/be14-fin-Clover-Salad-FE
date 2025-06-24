<template>
  <div class="dashboard-page">
    <!-- 1) Gauge Cards with Over-Percentage Overlay -->
    <div class="icon-stats-row">
      <div class="icon-card" v-for="(s,i) in gaugeStats" :key="i">
        <div class="gauge-wrapper">
          <v-chart :option="s.gaugeOption" autoresize style="width:80px; height:80px;" />
          <div v-if="s.percent > 1" class="gauge-over">
            +{{ ((s.percent - 1) * 100).toFixed(0) }}%
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
        <h4 class="card-title">총 렌탈료</h4>
        <p class="card-category">계약 전체 렌탈료</p>
      </div>
      <div class="card-body">
        <v-chart :option="performanceOption" autoresize style="height:260px;" />
      </div>
    </div>

    <!-- 3) Three Stat Cards -->
    <div class="stats-row">
      <div class="card stat-card" v-for="(s,i) in stats" :key="i">
        <div class="card-header">
          <p class="card-category">{{ s.title }}</p>
          <h3 class="card-title">{{ s.value }}<small>{{ s.suffix }}</small></h3>
        </div>
        <div class="card-body padded-chart">
          <v-chart v-if="s.chart" :option="s.chart" autoresize style="height:140px;" />
        </div>
      </div>
    </div>

    <!-- 4+5) Two half-width charts: status & monthly sales -->
    <div class="half-row">
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">렌탈 상품 카테고리</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="statusOption" autoresize style="height:260px;" />
        </div>
      </div>
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">{{ monthLabels[1] }} 매출 비교</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="monthOption" autoresize style="height:260px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import * as echarts from 'echarts'

// 1) Gauge Cards Data
const gaugeStats = [
  { title:'렌탈 상품 수',    value:'150',    subtitle:'전체 건수',        percent:1.2, color:'#f5365c' },
  { title:'렌탈 유지율', value:'70%',     subtitle:'계약 무효, 만료 제외',      percent:0.6, color:'#5e72e4' },
  { title:'신규 고객수',     value:'4',  subtitle:'본인 기준', percent:0.9, color:'#11cdef' },
  { title:'고객 만족도',    value:'80%',       subtitle:'상담 별점', percent:1.05, color:'#fb6340' }
]
gaugeStats.forEach(s => {
  s.gaugeOption = reactive({
    series: [{
      type: 'gauge',
      radius: '100%',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 1,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 8,
          color: [
            [Math.min(s.percent,1), s.color],
            [1, '#eee']
          ]
        }
      },
      pointer: { show: false },
      detail: { show: false },
      axisTick:    { show: false },
      splitLine:   { show: false },
      axisLabel:   { show: false },
      data: [{ value: Math.min(s.percent,1) }]
    }]
  })
})

// 2) Performance Line Chart
const perfRaw = [100,78,90,76,88,65,80,70,95,85,110,105]
const performanceOption = {
  grid:{ top:'10%', left:'5%', right:'5%', bottom:'10%', containLabel:true },
  tooltip:{ trigger:'axis' },
  xAxis:{
    type:'category',
    data:['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    axisLine:{ lineStyle:{ color:'#e9ecef' } },
    axisLabel:{ color:'#9fa9b1' },
    axisTick:{ show:false }
  },
  yAxis:{
    type:'value',
    splitLine:{ lineStyle:{ color:'#e9ecef' } },
    axisLine:{ show:false },
    axisLabel:{ color:'#9fa9b1' }
  },
  series:[{
    data:perfRaw,
    type:'line', smooth:true,
    symbol:'circle', symbolSize:6,
    lineStyle:{ width:2, color:'#55ce63'},
    areaStyle:{
      color:new echarts.graphic.LinearGradient(0,0,0,1,[
        { offset:0, color:'rgba(85,206,99,0.4)' },
        { offset:1, color:'rgba(255,255,255,0.1)' }
      ])
    }
  }]
}

// 3) Three Stat Cards
const stats = [
  {
    title:'렌탈 상품 수', value:'150', suffix:'',
    chart:{ ...performanceOption, grid:{ top:'20%', left:'10%', right:'10%', bottom:'5%', containLabel:true }}
  },
  {
    title:'렌탈 유지율', value:'70', suffix:'%',
    chart:{
      ...performanceOption,
      grid:{ top:'20%', left:'10%', right:'10%', bottom:'5%', containLabel:true },
      xAxis:{ ...performanceOption.xAxis, data:['USA','GER','AUS','UK','RO','BR'] },
      series:[{ ...performanceOption.series[0], type:'bar', barWidth:'40%', itemStyle:{ color:'#5a8dee' }}]
    }
  },
  {
    title:'신규 고객수', value:'4', suffix:'',
    chart:{
      ...performanceOption,
      grid:{ top:'20%', left:'10%', right:'10%', bottom:'5%', containLabel:true },
      xAxis:{ ...performanceOption.xAxis, data:['JUL','AUG','SEP','OCT','NOV'] },
      series:[{ 
        ...performanceOption.series[0],
        lineStyle:{ color:'#ff5757' },
        areaStyle:{
          color:new echarts.graphic.LinearGradient(0,0,0,1,[
            { offset:0, color:'rgba(255,87,87,0.3)' },
            { offset:1, color:'rgba(255,255,255,0.1)' }
          ])
        }
      }]
    }
  }
]

// 4) Status Bar Chart
const productStatus = [
  { name:'전자레인지', value:20 },{ name:'TV', value:15 },
  { name:'에어컨', value:25 },{ name:'냉장고', value:10 },
  { name:'세탁기', value:20 },{ name:'기타', value:10 }
]
const sum = productStatus.reduce((s,o)=>s+o.value,0)
const statusData = productStatus.map(o=>({ name:o.name, percent:+(o.value/sum*100).toFixed(1) }))
const statusOption = {
  tooltip:{ formatter:'{b}: {c}%' },
  grid:{ top:'10%', left:'20%', right:'10%', bottom:'10%', containLabel:true },
  xAxis:{ type:'value', max:100, axisLine:{ show:false }, splitLine:{ lineStyle:{ color:'#f0f0f0' }}, axisLabel:{ formatter:'{value}%'}},
  yAxis:{ type:'category', data:statusData.map(d=>d.name), axisLine:{ show:false }, axisTick:{ show:false }, axisLabel:{ color:'#525f7f'}},
  series:[{
    type:'bar',
    data:statusData.map(d=>d.percent),
    barCategoryGap:'50%',
    itemStyle:{ color:'#5e72e4', borderRadius:[0,8,8,0] },
    label:{ show:true, position:'right', formatter:'{c}%'}
  }]
}

// 5) Monthly Sales Bar Chart
const monthLabels = ['3월','4월','5월']
const monthSales = [15,10,6]
const monthOption = {
  grid:{ top:'10%', left:'20%', right:'20%', bottom:'15%', containLabel:true },
  xAxis:{ type:'category', data:monthLabels, axisLine:{ lineStyle:{ color:'#e9ecef' }}, axisTick:{ show:false}, axisLabel:{ color:'#525f7f'} },
  yAxis:{ type:'value', axisLine:{ show:false}, splitLine:{ lineStyle:{ color:'#f0f0f0'}}, axisLabel:{ color:'#525f7f'} },
  series:[{
    type:'bar',
    data:monthSales,
    barWidth:'40%',
    itemStyle:{
      color:(p)=>['#ff7f7f','#ffe066','#a3e635'][p.dataIndex],
      borderRadius:[8,8,0,0]
    },
    label:{ show:true, position:'top', color:'#333'}
  }]
}
const monthLabelsRef = ref(monthLabels)
</script>

<style scoped>
.dashboard-page {
  padding:24px;
  background:#f4f5f7;
  min-height:100vh;
  box-sizing:border-box;
}

/* Gauge Cards */
.icon-stats-row{ display:flex; gap:1rem; margin-bottom:24px; }
.icon-card{ flex:1; background:#fff; border-radius:.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); display:flex; align-items:center; padding:1rem; }
.gauge-wrapper{ position:relative; width:80px; height:80px; margin-right:1rem; }
.gauge-over{
  position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%);
  font-size:.75rem; font-weight:bold; color:#f5365c;
}
.icon-content .icon-title{ margin:0; font-size:.875rem; color:#8898aa; }
.icon-content .icon-value{ margin:.25rem 0; font-size:1.25rem; font-weight:600; }
.icon-content .icon-subtitle{ font-size:.75rem; color:#adb5bd; }

/* Cards & Charts */
.card{ background:#fff; border-radius:.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:24px; }
.card-header{ padding:1rem; border-bottom:1px solid #e9ecef; }
.card-title{ font-size:1.25rem; font-weight:600; margin:0; }
.card-category{ font-size:.875rem; color:#8898aa; margin:0; }
.card-body{ padding:0.5rem 1rem; }

/* Padding for chart cards */
.padded-chart{ padding-top:1rem; padding-bottom:1rem; }

/* Stats row */
.stats-row{ display:flex; gap:1rem; }
.stat-card{ flex:1; }

/* Half-row */
.half-row{ display:flex; gap:1rem; margin-top:24px; }
.half-card{ flex:1; }
</style>
