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
          <v-chart :option="s.option" autoresize style="width:80px;height:80px;" />
          <div v-if="s.percent>1" class="gauge-over">+{{ ((s.percent-1)*100).toFixed(0) }}%</div>
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
      <div class="card-header">
        <h4 class="card-title">{{ mainTitle }}</h4>
        <p class="card-category">계약 전체 렌탈료</p>
      </div>
      <div class="card-body">
        <v-chart :option="mainOption" autoresize style="height:260px;" />
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
          <v-chart :option="s.option" autoresize style="height:120px;" />
        </div>
      </div>
    </div>

    <!-- ── 4+5) 두 개의 반반 차트 ── -->
    <div class="half-row">
      <!-- 상품 상태 비율 -->
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">렌탈 상품 카테고리</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="statusOption" autoresize style="height:260px;" />
        </div>
      </div>
      <!-- 전/현재/다음 비교 -->
      <div class="card half-card">
        <div class="card-header">
          <h4 class="card-title">{{ compareTitle }}</h4>
        </div>
        <div class="card-body padded-chart">
          <v-chart :option="compareOption" autoresize style="height:260px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'

// ———— 필터 상태 ————
const thisYear = new Date().getFullYear()
const yearList = Array.from({length:thisYear-2019},(_,i)=>2025-i)
const filterYear  = ref(thisYear)
const filterType  = ref('month')     // 'month' | 'quarter' | 'year'
const filterValue = ref(1)           

// ———— 더미 데이터 ————
// 1) 게이지용 통계: { product, productPct, retentionPct, newCust, satPct }
const statsDummy = {
  month: {
    1:{ product:150, productPct:0.95, retentionPct:0.7, newCust:4, satPct:0.8 },
    2:{ product:180, productPct:1.1,  retentionPct:0.65,newCust:9, satPct:0.75 },
    // ... 3~12월도 채워두세요
  },
  quarter: {
    1:{ product:500, productPct:1.2, retentionPct:0.68, newCust:12, satPct:0.85 },
    2:{ product:480, productPct:1.1, retentionPct:0.72, newCust:10, satPct:0.88 },
    3:{ product:520, productPct:1.3, retentionPct:0.7,  newCust:14, satPct:0.9 },
    4:{ product:510, productPct:1.25,retentionPct:0.69,newCust:13, satPct:0.87 }
  },
  year: {
    2025:{ product:2000, productPct:1.0, retentionPct:0.7, newCust:48, satPct:0.8 },
    2024:{ product:1850, productPct:0.93,retentionPct:0.68,newCust:42, satPct:0.78 }
  }
}

// 2) 메인 라인 차트 (연도별 월매출)
const monthlySales = {
 1:2732, 2:3113, 3:2458, 4:2848,
 5:2649, 6:2191, 7:2794, 8:2700,
 9:2609,10:2270,11:2297,12:3395
}

// 3) 미니 차트: 주차별 매출
const weeklySales = {
  1:[150,160,155,158],
  2:[160,170,165,162],
  // ...월별 배열
}

// 4) 분기별 합계
const quarterSales = [ (2732+3113+2458), /*Q1*/
                       (2649+2191+2794), /*Q2*/
                       (2700+2609+2270), /*Q3*/
                       (2297+3395+1000) /*Q4 더미*/ ]

// 5) 상품 상태 비율
const rawStatus = [
  {name:'전자레인지', value:20},{name:'TV', value:15},
  {name:'에어컨', value:25},{name:'냉장고', value:10},
  {name:'세탁기', value:20},{name:'기타', value:10}
]

// ———— Computed: 1) 게이지 카드 ————
const gaugeStats = computed(() => {
  const st = statsDummy[filterType.value][filterValue.value] 
           || statsDummy[filterType.value][1]
  return [
    {
      title:'렌탈 상품 수',
      display: st.product,
      subtitle:'전체 건수',
      percent: st.productPct,
      color:'#f5365c',
      option: {
        series:[{
          type:'gauge', startAngle:90, endAngle:-270,
          min:0, max:1,
          splitNumber:5,
          axisLine:{
            lineStyle:{
              width:8,
              color:[[Math.min(st.productPct,1), '#f5365c'],[1,'#eee']]
            }
          },
          pointer:{show:false},
          detail:{show:false},
          axisTick:   {show:false},
          splitLine:  {show:false},
          axisLabel:  {show:false},
          data:[{value:Math.min(st.productPct,1)}]
        }]
      }
    },
    {
      title:'렌탈 유지율',
      display: `${(st.retentionPct*100).toFixed(0)}%`,
      subtitle:'계약 무효·만료 제외',
      percent: st.retentionPct,
      color:'#5e72e4',
      option:{
        series:[{
          type:'gauge', startAngle:90, endAngle:-270,
          min:0, max:1, splitNumber:5,
          axisLine:{ lineStyle:{
            width:8,
            color:[[st.retentionPct,'#5e72e4'],[1,'#eee']]
          }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},
          data:[{value:st.retentionPct}]
        }]
      }
    },
    {
      title:'신규 고객수',
      display: st.newCust,
      subtitle:'본인 기준',
      percent: st.newCust>0?1:0,
      color:'#11cdef',
      option:{
        series:[{ type:'gauge',
          startAngle:90,endAngle:-270,min:0,max:1,splitNumber:5,
          axisLine:{ lineStyle:{
            width:8,
            color:[[1,'#11cdef'],[1,'#eee']]
          }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},
          data:[{value:1}]
        }]
      }
    },
    {
      title:'고객 만족도',
      display:`${(st.satPct*100).toFixed(0)}%`,
      subtitle:'상담 별점',
      percent: st.satPct,
      color:'#fb6340',
      option:{
        series:[{ type:'gauge',
          startAngle:90,endAngle:-270,min:0,max:1,splitNumber:5,
          axisLine:{ lineStyle:{
            width:8,
            color:[[st.satPct,'#fb6340'],[1,'#eee']]
          }},
          pointer:{show:false}, detail:{show:false},
          axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},
          data:[{value:st.satPct}]
        }]
      }
    }
  ]
})

// ———— Computed: 2) 메인 라인 차트 ————
const mainTitle = computed(() => {
  if(filterType.value==='month')   return `${filterYear.value}년 ${filterValue.value}월 매출`
  if(filterType.value==='quarter') return `${filterYear.value}년 ${filterValue.value}분기 매출`
  return `${filterYear.value}년 전체 매출`
})
const mainOption = computed(() => {
  let xData, yData
  if(filterType.value==='month'){
    // 해당 월 주단위가 너무 많으니 월별 합계로 대체
    xData = Object.keys(monthlySales).map(m=>`${m}월`)
    yData = Object.values(monthlySales)
  }
  else if(filterType.value==='quarter'){
    xData = ['1분기','2분기','3분기','4분기']
    yData = quarterSales
  }
  else {
    xData = yearList.slice(0,5).reverse().map(y=>`${y}년`)
    // 연도별 합계: dummy로 월합계 총합
    yData = xData.map((_,i)=>monthlySales[1]+monthlySales[2]+monthlySales[3])
  }
  return {
    grid:{top:'10%',left:'5%',right:'5%',bottom:'10%',containLabel:true},
    tooltip:{trigger:'axis'},
    xAxis:{
      type:'category', data:xData,
      axisLine:{lineStyle:{color:'#e9ecef'}},
      axisLabel:{color:'#9fa9b1'},axisTick:{show:false}
    },
    yAxis:{
      type:'value',
      splitLine:{lineStyle:{color:'#e9ecef'}},
      axisLine:{show:false},
      axisLabel:{color:'#9fa9b1'}
    },
    series:[{
      type:'line', smooth:true,
      data:yData,
      symbol:'circle', symbolSize:6,
      lineStyle:{width:2,color:'#55ce63'},
      areaStyle:{
        color:new echarts.graphic.LinearGradient(0,0,0,1,[
          {offset:0,color:'rgba(85,206,99,0.4)'},
          {offset:1,color:'rgba(255,255,255,0.1)'}
        ])
      }
    }]
  }
})

// ———— Computed: 3) 미니 통계 차트 ————
const miniStats = computed(() => {
  // 총 출하 = 메인 차트 yData 평균
  const mainY = mainOption.value.series[0].data
  const avg = Math.round(mainY.reduce((a,b)=>a+b,0)/mainY.length)
  const total = mainY.reduce((a,b)=>a+b,0)
  const retention = statsDummy[filterType.value][filterValue.value]?.retentionPct || 0
  const customers = statsDummy[filterType.value][filterValue.value]?.newCust || 0

  const miniX = (()=>{ // x 축 레이블
    if(filterType.value==='month'){
      return Array.from({length:4},(_,i)=>`${i+1}주차`)
    } else if(filterType.value==='quarter'){
      return ['1월','2월','3월']
    } else {
      return yearList.slice(0,5).reverse().map(y=>`${y}년`)
    }
  })()
  const miniY = (()=>{ // y 데이터
    if(filterType.value==='month'){
      return weeklySales[filterValue.value] || [0,0,0,0]
    } else if(filterType.value==='quarter'){
      return quarterSales
    } else {
      return Array(5).fill(total/5)
    }
  })()
  const miniOpt = {
    grid:{left:'10%',right:'10%',top:'10%',bottom:'15%',containLabel:true},
    xAxis:{
      type:'category', data:miniX,
      axisLine:{lineStyle:{color:'#e9ecef'}},axisTick:{show:false},axisLabel:{color:'#9fa9b1'}
    },
    yAxis:{
      type:'value',
      splitLine:{lineStyle:{color:'#e9ecef'}},
      axisLine:{lineStyle:{color:'#e9ecef'}},axisLabel:{color:'#9fa9b1'}
    },
    series:[{
      type:'line', smooth:true,
      data:miniY,
      symbol:'none',
      lineStyle:{width:2,color:'#5e72e4'},
      areaStyle:{color:'rgba(94,114,228,0.1)'}
    }]
  }

  return [
    { title:'총 출하', display: total, option: miniOpt },
    { title:'유지율', display:`${(retention*100).toFixed(0)}%`, option: miniOpt },
    { title:'고객수', display: customers,    option: miniOpt }
  ]
})

// ———— Computed: 4) 상품 상태 비율 ————
const statusOption = computed(() => {
  const sum = rawStatus.reduce((s,o)=>s+o.value,0)
  const data = rawStatus.map(o=>({name:o.name, value:+((o.value/sum*100).toFixed(1))}))
  return {
    tooltip:{formatter:'{b}: {c}%'},
    grid:{top:'10%',left:'20%',right:'10%',bottom:'10%',containLabel:true},
    xAxis:{
      type:'value', max:100,
      axisLine:{show:false},splitLine:{lineStyle:{color:'#f0f0f0'}},
      axisLabel:{formatter:'{value}%'}
    },
    yAxis:{
      type:'category', data:data.map(d=>d.name),
      axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#525f7f'}
    },
    series:[{
      type:'bar', data:data.map(d=>d.value),
      barCategoryGap:'50%',
      itemStyle:{color:'#5e72e4',borderRadius:[0,8,8,0]},
      label:{show:true,position:'right',formatter:'{c}%'}
    }]
  }
})

// ———— Computed: 5) 전/현재/다음 비교 바 차트 ————
const compareTitle = computed(() => {
  if(filterType.value==='month')   return `${filterYear.value}년 ${filterValue.value}월 전월·월·다음월`
  if(filterType.value==='quarter') return `${filterYear.value}년 ${filterValue.value}분기 전분기·분기·다음분기`
  return `${filterYear.value}년 전년·연·다음년`
})
const compareLabels = computed(() => {
  if(filterType.value==='month'){
    return [`${filterValue.value-1}월`,`${filterValue.value}월`,`${filterValue.value+1}월`]
  }
  if(filterType.value==='quarter'){
    return [`${filterValue.value-1}분기`,`${filterValue.value}분기`,`${filterValue.value+1}분기`]
  }
  return [`${filterYear.value-1}년`,`${filterYear.value}년`,`${filterYear.value+1}년`]
})
const compareData = computed(() => {
  if(filterType.value==='month'){
    return [
      monthlySales[filterValue.value-1]||0,
      monthlySales[filterValue.value],
      monthlySales[filterValue.value+1]||0
    ]
  }
  if(filterType.value==='quarter'){
    return [
      quarterSales[filterValue.value-2]||0,
      quarterSales[filterValue.value-1]||0,
      quarterSales[filterValue.value]||0
    ]
  }
  // 연도별 더미: 월합으로 대신
  const self = monthlySales[1]+monthlySales[2]+monthlySales[3]
  return [self,self,self]
})
const compareOption = computed(() => ({
  grid:{top:'10%',left:'10%',right:'10%',bottom:'15%',containLabel:true},
  xAxis:{
    type:'category', data:compareLabels.value,
    axisLine:{lineStyle:{color:'#e9ecef'}},axisTick:{show:false},axisLabel:{color:'#9fa9b1'}
  },
  yAxis:{
    type:'value',
    splitLine:{lineStyle:{color:'#e9ecef'}},
    axisLine:{show:false},axisLabel:{color:'#9fa9b1'}
  },
  series:[{
    type:'bar', data:compareData.value, barWidth:'40%',
    itemStyle:{
      color:(p)=>['#ff7f7f','#ffe066','#a3e635'][p.dataIndex],
      borderRadius:[8,8,0,0]
    },
    label:{show:true,position:'top',color:'#333'}
  }]
}))
</script>

<style scoped>
.dashboard-page {
  padding:24px;
  background:#f4f5f7;
  min-height:100vh;
  box-sizing:border-box;
}
.filter-row {
  display:flex; gap:1rem; margin-bottom:1rem;
}
.filter-row select {
  padding:.5rem; border:1px solid #ccc; border-radius:.25rem;
  background:#fff; font-size:1rem;
}

/* 1) 게이지 카드 */
.icon-stats-row{ display:flex; gap:1rem; margin-bottom:24px; }
.icon-card{
  flex:1; background:#fff; border-radius:.75rem;
  box-shadow:0 1px 4px rgba(0,0,0,0.1);
  display:flex; align-items:center; padding:1rem;
}
.gauge-wrapper{ position:relative; width:80px; height:80px; margin-right:1rem; }
.gauge-over{
  position:absolute; top:50%; left:50%;
  transform:translate(-50%,-50%);
  font-size:.75rem; font-weight:bold; color:red;
}
.icon-content .icon-title{ margin:0; font-size:.875rem; color:#8898aa; }
.icon-content .icon-value{ margin:.25rem 0; font-size:1.25rem; font-weight:600; }
.icon-content .icon-subtitle{ font-size:.75rem; color:#adb5bd; }

/* 카드 공통 */
.card{ background:#fff; border-radius:.75rem; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:24px; }
.card-header{ padding:1rem; border-bottom:1px solid #e9ecef; }
.card-title{ font-size:1.25rem; font-weight:600; margin:0; }
.card-category{ font-size:.875rem; color:#8898aa; margin:0; }
.card-body{ padding:.5rem 1rem; }

/* 2) 메인 차트 */
.main-chart .card-body{ padding:0; }

/* 3) Stats row */
.stats-row{ display:flex; gap:1rem; }
.stat-card{ flex:1; }
.padded-chart{ padding-top:1rem; padding-bottom:1rem; }

/* 4+5) Half row */
.half-row{ display:flex; gap:1rem; }
.half-card{ flex:1; }
</style>
