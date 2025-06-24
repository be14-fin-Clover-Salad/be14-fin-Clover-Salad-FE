<template>
  <div class="dashboard-page">
    <!-- ── 필터 ── -->
    <div class="filter-row">
      <select v-model="filterYear">
        <option v-for="y in yearList" :key="y" :value="y">{{ y }}년</option>
      </select>
      <select v-model="filterType">
        <option value="month">월별</option>
        <option value="quarter">분기별</option>
        <option value="year">연별</option>
      </select>
      <select v-if="filterType==='month'" v-model="filterValue">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
      </select>
      <select v-else-if="filterType==='quarter'" v-model="filterValue">
        <option v-for="q in 4" :key="q" :value="q">{{ q }}분기</option>
      </select>
    </div>

    <!-- ── 1) 게이지 카드 ── -->
    <div class="icon-stats-row">
      <div class="icon-card" v-for="(s,i) in gaugeStats" :key="i">
        <div class="gauge-wrapper">
          <v-chart :option="s.option" autoresize style="width:80px;height:80px;"/>
          <div v-if="s.percent>1" class="gauge-over">
            +{{ ((s.percent-1)*100).toFixed(0) }}%
          </div>
        </div>
        <div class="icon-content">
          <p class="icon-title">{{ s.title }}</p>
          <h3 class="icon-value">{{ s.display }}</h3>
          <small class="icon-subtitle">{{ s.subtitle }}</small>
        </div>
      </div>
    </div>

    <!-- ── 2) 메인 라인 차트 ── -->
    <div class="card main-chart">
      <div class="card-header with-gauge">
        <div class="title-block">
          <h4 class="card-title">{{ mainTitle }}</h4>
          <p class="card-category">계약 전체 렌탈료</p>
        </div>
        <div class="total-gauge">
          <v-chart :option="totalGaugeOption" autoresize style="width:50px;height:50px;"/>
          <div class="total-label">
            <p>총 매출</p>
            <h3>{{ totalSales }}</h3>
          </div>
        </div>
      </div>
      <div class="card-body">
        <v-chart :option="mainOption" autoresize style="height:260px;"/>
      </div>
    </div>

    <!-- ── 3) 미니 통계 차트 ── -->
    <div class="stats-row">
      <div class="card stat-card" v-for="(s,i) in miniStats" :key="i">
        <div class="card-header">
          <p class="card-category">{{ s.title }}</p>
          <h3 class="card-title">{{ s.display }}</h3>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="s.option" autoresize style="height:120px;"/>
        </div>
      </div>
    </div>

    <!-- ── 4+5) 반반 차트 ── -->
    <div class="half-row">
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">렌탈 상품 카테고리</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="statusOption" autoresize style="height:260px;"/>
        </div>
      </div>
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">{{ compareTitle }}</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="compareOption" autoresize style="height:260px;"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as echarts from 'echarts'

// ── 필터 상태 ──
const thisYear    = new Date().getFullYear()
const yearList    = Array.from({ length: thisYear - 2019 + 1 }, (_, i) => thisYear - i)
const filterYear  = ref(thisYear)
const filterType  = ref('month')  // 'month' | 'quarter' | 'year'
const filterValue = ref(1)
watch(filterType, () => { filterValue.value = 1 })

// ── 더미 데이터 (모든 월/분기/연도에 기본값 제공) ──
const statsDummy = {
  month: {
    1: { product:150, productPct:0.95, retentionPct:0.70, newCust:4, satPct:0.80 },
    2: { product:180, productPct:1.10, retentionPct:0.65, newCust:9, satPct:0.75 },
    3: { product:170, productPct:1.05, retentionPct:0.67, newCust:6, satPct:0.82 },
    4: { product:200, productPct:1.15, retentionPct:0.66, newCust:7, satPct:0.79 },
    5: { product:160, productPct:0.90, retentionPct:0.64, newCust:5, satPct:0.77 },
    6: { product:140, productPct:0.85, retentionPct:0.62, newCust:4, satPct:0.74 },
    7: { product:180, productPct:1.12, retentionPct:0.69, newCust:8, satPct:0.83 },
    8: { product:175, productPct:1.08, retentionPct:0.68, newCust:7, satPct:0.80 },
    9: { product:165, productPct:1.02, retentionPct:0.65, newCust:6, satPct:0.78 },
    10:{ product:155, productPct:0.98, retentionPct:0.63, newCust:5, satPct:0.76 },
    11:{ product:185, productPct:1.18, retentionPct:0.70, newCust:10,satPct:0.85 },
    12:{ product:190, productPct:1.20, retentionPct:0.71, newCust:11,satPct:0.86 }
  },
  quarter: {
    1: { product:500, productPct:1.20, retentionPct:0.68, newCust:12, satPct:0.85 },
    2: { product:480, productPct:1.10, retentionPct:0.72, newCust:10, satPct:0.88 },
    3: { product:520, productPct:1.30, retentionPct:0.70, newCust:14, satPct:0.90 },
    4: { product:510, productPct:1.25, retentionPct:0.69, newCust:13, satPct:0.87 }
  },
  year: {
    [thisYear]:   { product:2000, productPct:1.00, retentionPct:0.70, newCust:48, satPct:0.80 },
    [thisYear-1]: { product:1850, productPct:0.93, retentionPct:0.68, newCust:42, satPct:0.78 }
  }
}

const monthlySales = { 1:2732,2:3113,3:2458,4:2848,5:2649,6:2191,7:2794,8:2700,9:2609,10:2270,11:2297,12:3395 }
const weeklySales  = {
  1:[150,160,155,158],  2:[160,170,165,162],
  3:[155,158,160,157],  4:[158,160,162,159],
  5:[150,152,151,153],  6:[148,149,150,151],
  7:[155,157,156,158],  8:[160,162,161,163],
  9:[158,159,157,160], 10:[155,156,154,157],
 11:[162,164,163,165], 12:[170,172,171,173]
}
const quarterSales = [
  monthlySales[1]+monthlySales[2]+monthlySales[3],
  monthlySales[4]+monthlySales[5]+monthlySales[6],
  monthlySales[7]+monthlySales[8]+monthlySales[9],
  monthlySales[10]+monthlySales[11]+monthlySales[12]
]

// 카테고리 더미(rawStatus)
const rawStatusData = [
  { name:'전자레인지', value:20 },
  { name:'TV',        value:15 },
  { name:'에어컨',     value:25 },
  { name:'냉장고',     value:10 },
  { name:'세탁기',     value:20 },
  { name:'기타',       value:10 }
]
const statusDummy = {
  month: Object.fromEntries(yearList.map((_,i)=>[i+1, rawStatusData])),
  quarter: {1:rawStatusData,2:rawStatusData,3:rawStatusData,4:rawStatusData},
  year: { [thisYear]:rawStatusData, [thisYear-1]:rawStatusData }
}

// ── 1) 게이지 카드 ──
const gaugeStats = computed(() => {
  const st = filterType.value==='year'
    ? statsDummy.year[filterYear.value]   ?? statsDummy.year[thisYear]
    : statsDummy[filterType.value][filterValue.value] ?? statsDummy[filterType.value][1]

  return [
    {
      title: '렌탈 상품 수',
      display: st.product,
      subtitle: '전체 건수',
      percent: st.productPct,
      option: {
        series:[{ type:'gauge', startAngle:90, endAngle:-270, min:0, max:1, splitNumber:5,
          axisLine:{ lineStyle:{ width:8, color:[[Math.min(st.productPct,1),'#f5365c'],[1,'#eee']] }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
          data:[{value:Math.min(st.productPct,1)}]
        }]
      }
    },
    {
      title: '렌탈 유지율',
      display: `${(st.retentionPct*100).toFixed(0)}%`,
      subtitle: '계약 무효·만료 제외',
      percent: st.retentionPct,
      option: {
        series:[{ type:'gauge', startAngle:90, endAngle:-270, min:0, max:1, splitNumber:5,
          axisLine:{ lineStyle:{ width:8, color:[[st.retentionPct,'#5e72e4'],[1,'#eee']] }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
          data:[{value:st.retentionPct}]
        }]
      }
    },
    {
      title: '신규 고객수',
      display: st.newCust,
      subtitle: '본인 기준',
      percent: st.newCust>0?1:0,
      option: {
        series:[{ type:'gauge', startAngle:90, endAngle:-270, min:0, max:1, splitNumber:5,
          axisLine:{ lineStyle:{ width:8, color:[[1,'#11cdef'],[1,'#eee']] }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
          data:[{value:1}]
        }]
      }
    },
    {
      title: '고객 만족도',
      display: `${(st.satPct*100).toFixed(0)}%`,
      subtitle: '상담 별점',
      percent: st.satPct,
      option: {
        series:[{ type:'gauge', startAngle:90, endAngle:-270, min:0, max:1, splitNumber:5,
          axisLine:{ lineStyle:{ width:8, color:[[st.satPct,'#fb6340'],[1,'#eee']] }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
          data:[{value:st.satPct}]
        }]
      }
    }
  ]
})

// ── 총 매출 게이지 ──
const totalSales = computed(() =>
  mainOption.value.series[0].data.reduce((a,b)=>a+b,0)
)
const totalGaugeOption = computed(() => ({
  series:[{ type:'gauge', startAngle:90, endAngle:-270, min:0, max:1, splitNumber:5,
    axisLine:{ lineStyle:{ width:6, color:[[1,'#11cdef'],[1,'#eee']] }},
    pointer:{show:false}, detail:{show:false},
    axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false},
    data:[{value:1}]
  }]
}))

// ── 2) 메인 라인 차트 ──
const mainTitle = computed(() => {
  if (filterType.value==='month')   return `${filterYear.value}년 ${filterValue.value}월 매출 (주차)`
  if (filterType.value==='quarter') return `${filterYear.value}년 ${filterValue.value}분기 매출`
  return `${filterYear.value}년 전체 매출`
})
const mainOption = computed(() => {
  let xData = [], yData = []
  if (filterType.value==='month') {
    xData = ['1주차','2주차','3주차','4주차']
    yData = weeklySales[filterValue.value] ?? [0,0,0,0]
  }
  else if (filterType.value==='quarter') {
    xData = ['1분기','2분기','3분기','4분기']
    yData = quarterSales
  }
  else {
    xData = yearList
    yData = xData.map(y=>
      (statsDummy.year[y] ?? statsDummy.year[thisYear]).product
    )
  }
  return {
    grid:{ top:'10%', left:'5%', right:'5%', bottom:'10%', containLabel:true },
    tooltip:{ trigger:'axis' },
    xAxis:{ type:'category', data:xData, axisLine:{lineStyle:{color:'#e9ecef'}}, axisLabel:{color:'#9fa9b1'}, axisTick:{show:false} },
    yAxis:{ type:'value', splitLine:{lineStyle:{color:'#e9ecef'}}, axisLine:{show:false}, axisLabel:{color:'#9fa9b1'} },
    series:[{
      type:'line', smooth:true, data:yData,
      symbol:'circle', symbolSize:6,
      lineStyle:{width:2,color:'#55ce63'},
      areaStyle:{ color:new echarts.graphic.LinearGradient(0,0,0,1,[
        {offset:0,color:'rgba(85,206,99,0.4)'},
        {offset:1,color:'rgba(255,255,255,0.1)'}
      ])}
    }]
  }
})

// ── 3) 미니 통계 차트 ──
const miniStats = computed(() => {
  const yVals = mainOption.value.series[0].data
  const total = yVals.reduce((a,b)=>a+b,0)
  const stYear = statsDummy.year[filterYear.value] ?? statsDummy.year[thisYear]
  const stOther = filterType.value==='year'
    ? stYear
    : statsDummy[filterType.value][filterValue.value] ?? statsDummy[filterType.value][1]

  const retention = stOther.retentionPct
  const customers = stOther.newCust

  const miniX = filterType.value==='month'
    ? ['1주차','2주차','3주차','4주차']
    : filterType.value==='quarter'
      ? ['1월','2월','3월']
      : yearList.map(y=>`${y}년`)
  const miniY = filterType.value==='month'
    ? (weeklySales[filterValue.value] ?? [0,0,0,0])
    : filterType.value==='quarter'
      ? quarterSales
      : yearList.map(y=>
        (statsDummy.year[y] ?? statsDummy.year[thisYear]).product
      )

  const opt = {
    grid:{ left:'10%', right:'10%', top:'10%', bottom:'15%', containLabel:true },
    xAxis:{ type:'category', data:miniX, axisLine:{lineStyle:{color:'#e9ecef'}}, axisTick:{show:false}, axisLabel:{color:'#9fa9b1'} },
    yAxis:{ type:'value', splitLine:{lineStyle:{color:'#e9ecef'}}, axisLine:{lineStyle:{color:'#e9ecef'}}, axisLabel:{color:'#9fa9b1'} },
    series:[{ type:'line', smooth:true, data:miniY, symbol:'none', lineStyle:{width:2,color:'#5e72e4'}, areaStyle:{color:'rgba(94,114,228,0.1)'} }]
  }

  return [
    { title:'총 출하', display: total, option: opt },
    { title:'유지율', display:`${(retention*100).toFixed(0)}%`, option: opt },
    { title:'고객수', display: customers, option: opt }
  ]
})

// ── 4) 상품 상태 비율 ──
const statusOption = computed(() => {
  const raw = filterType.value==='year'
    ? statusDummy.year[filterYear.value] ?? []
    : statusDummy[filterType.value][filterValue.value] ?? []
  const sum = raw.reduce((s,o)=>s+o.value,0)
  const data = raw.map(o=>({ name:o.name, value:+((o.value/sum*100).toFixed(1)) }))
  return {
    tooltip:{ formatter:'{b}: {c}%' },
    grid:{ top:'10%', left:'5%', right:'10%', bottom:'10%', containLabel:true },
    xAxis:{ type:'value', max:100, axisLine:{show:false}, splitLine:{lineStyle:{color:'#f0f0f0'}}, axisLabel:{formatter:'{value}%'} },
    yAxis:{ type:'category', data:data.map(d=>d.name), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{color:'#525f7f'} },
    series:[{
      type:'bar', data:data.map(d=>d.value), barCategoryGap:'50%',
      itemStyle:{ color:'#5e72e4', borderRadius:[0,8,8,0] },
      label:{ show:true, position:'right', formatter:'{c}%' }
    }]
  }
})

// ── 5) 전/현재/다음 비교 차트 ──
const compareTitle = computed(() => {
  if (filterType.value==='month')   return `${filterYear.value}년 ${filterValue.value}월 전월·월·다음월`
  if (filterType.value==='quarter') return `${filterYear.value}년 ${filterValue.value}분기 전분기·분기·다음분기`
  return `${filterYear.value}년 전년·연·다음년`
})
const compareOption = computed(() => {
  let raws = [], maxIdx = filterType.value==='quarter'?4:(filterType.value==='month'?12:thisYear)
  if (filterType.value==='month') {
    raws = [
      { idx:filterValue.value-1, label:`${filterValue.value-1}월`, val:monthlySales[filterValue.value-1] ?? 0 },
      { idx:filterValue.value,   label:`${filterValue.value}월`,   val:monthlySales[filterValue.value]   ?? 0 },
      { idx:filterValue.value+1, label:`${filterValue.value+1}월`, val:monthlySales[filterValue.value+1] ?? 0 }
    ]
  } else if (filterType.value==='quarter') {
    raws = [
      { idx:filterValue.value-1, label:`${filterValue.value-1}분기`, val:quarterSales[filterValue.value-2] ?? 0 },
      { idx:filterValue.value,   label:`${filterValue.value}분기`,   val:quarterSales[filterValue.value-1] ?? 0 },
      { idx:filterValue.value+1, label:`${filterValue.value+1}분기`, val:quarterSales[filterValue.value]   ?? 0 }
    ]
  } else {
    raws = [
      { idx:filterYear.value-1, label:`${filterYear.value-1}년`, val:(statsDummy.year[filterYear.value-1]?.product) ?? 0 },
      { idx:filterYear.value,   label:`${filterYear.value}년`,   val:(statsDummy.year[filterYear.value]?.product)   ?? 0 },
      { idx:filterYear.value+1, label:`${filterYear.value+1}년`, val:(statsDummy.year[filterYear.value+1]?.product) ?? 0 }
    ]
  }
  const filtered = raws.filter(r => r.idx >= (filterType.value==='year'?yearList[yearList.length-1]:1) && r.idx <= maxIdx)
  return {
    grid:{ top:'10%', left:'10%', right:'10%', bottom:'15%', containLabel:true },
    xAxis:{ type:'category', data:filtered.map(r=>r.label), axisLine:{lineStyle:{color:'#e9ecef'}}, axisTick:{show:false}, axisLabel:{color:'#9fa9b1'} },
    yAxis:{ type:'value', splitLine:{lineStyle:{color:'#e9ecef'}}, axisLine:{show:false}, axisLabel:{color:'#9fa9b1'} },
    series:[{
      type:'bar', data:filtered.map(r=>r.val), barWidth:'40%',
      itemStyle:{ color:(p)=>['#ff7f7f','#ffe066','#a3e635'][p.dataIndex], borderRadius:[8,8,0,0] },
      label:{ show:true, position:'top', color:'#333' }
    }]
  }
})
</script>

<style scoped>
.dashboard-page { padding:24px; background:#f4f5f7; min-height:100vh; box-sizing:border-box }
.filter-row { display:flex; gap:1rem; margin-bottom:1rem }
.filter-row select { padding:.5rem; border:1px solid #ccc; border-radius:.25rem; background:#fff; font-size:1rem }

.icon-stats-row { display:flex; gap:1rem; margin-bottom:24px }
.icon-card { flex:1; background:#fff; border-radius:.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); display:flex; align-items:center; padding:1rem }
.gauge-wrapper { position:relative; width:80px; height:80px; margin-right:1rem }
.gauge-over { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:.75rem; font-weight:bold; color:red }
.icon-content .icon-title { margin:0; font-size:.875rem; color:#8898aa }
.icon-content .icon-value { margin:.25rem 0; font-size:1.25rem; font-weight:600 }
.icon-content .icon-subtitle { font-size:.75rem; color:#adb5bd }

.card { background:#fff; border-radius:.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:24px }
.card-header { padding:1rem; border-bottom:1px solid #e9ecef }
.card-header.with-gauge { display:flex; justify-content:space-between; align-items:center }
.title-block { display:flex; flex-direction:column }
.total-gauge { display:flex; align-items:center }
.total-label { margin-left:.5rem; text-align:right }
.total-label p { margin:0; font-size:.75rem; color:#8898aa }
.total-label h3 { margin:0; font-size:1rem }

.card-title { font-size:1.25rem; font-weight:600; margin:0 }
.card-category { font-size:.875rem; color:#8898aa; margin:0 }
.card-body { padding:.5rem 1rem }
.main-chart .card-body { padding:0 }

.stats-row { display:flex; gap:1rem }
.stat-card { flex:1 }
.padded-chart { padding-top:1rem; padding-bottom:1rem }

.half-row { display:flex; gap:1rem }
.half-card { flex:1 }
</style>
