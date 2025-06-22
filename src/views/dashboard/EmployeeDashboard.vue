<template>
  <div>
    <!-- 필터 및 갱신 버튼 -->
    <div style="display:flex;flex-direction:row;align-items:center;gap:12px">
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
      <span class="period-label">{{ periodLabel }}</span>
      <button class="button primary" @click="onClickRefresh" :disabled="loading">
        {{ loading ? '갱신 중...' : '갱신' }}
      </button>
    </div>

    <p v-if="errorMsg" style="color: red; margin-top: 10px;">{{ errorMsg }}</p>

    <!-- 실적 그래프 카드: 5가지 항목 고정 -->
    <div class="performance-card-group">
      <MonthQuarterEmployeePerformanceCard
        v-for="item in currentPerformance"
        :key="item.name"
        :title="item.name"
        :actual="item.actual"
        :target="item.target"
        :achieved="item.achieved"
      />
    </div>

    <!-- 실적 달성 여부 테이블 -->
    <table class="goal-table" v-if="Object.keys(monthlyPerformance).length">
      <thead>
      <tr>
        <th>항목</th>
        <th v-for="month in 12" :key="month">{{ month }}월</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(values, key) in monthlyPerformance" :key="key">
        <td>{{ goalLabels[key] }}</td>
        <td v-for="(value, i) in values" :key="i">
          {{ value === null ? '-' : value ? 'O' : 'X' }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import MonthQuarterEmployeePerformanceCard from "@/components/dashboard/employee/MonthQuarterEmployeePerformanceCard.vue";
import { computed, onMounted, ref, watch } from 'vue';
import api from '@/api/auth';
import { useAuthStore } from "@/stores/auth.js";

const thisYear = new Date().getFullYear();
const yearRange = Array.from({ length: thisYear - 2010 + 1 }, (_, i) => 2010 + i).reverse();

const filterYear = ref(thisYear);
const filterPeriodType = ref('month');
const filterPeriodValue = ref(1);
const currentPerformance = ref([]);
const authStore = useAuthStore();
const userId = ref(authStore.userInfo?.id);
const employeeCode = ref(null);
const hasEmployeeCode = computed(() => !!employeeCode.value);

const loading = ref(false);
const errorMsg = ref('');

const monthlyPerformance = ref({
  rentalProductCount: Array(12).fill(null),
  rentalRetentionCount: Array(12).fill(null),
  totalRentalCount: Array(12).fill(null),
  newCustomerCount: Array(12).fill(null),
  customerFeedbackScore: Array(12).fill(null),
});

const goalLabels = {
  rentalProductCount: '렌탈 상품 수',
  rentalRetentionCount: '렌탈 유지 수',
  totalRentalCount: '총 렌탈 건수',
  newCustomerCount: '신규 고객 수',
  customerFeedbackScore: '고객 만족도'
};

onMounted(async () => {
  try {
    const response = await api.get(`/employee/detail?employeeId=${userId.value}`);
    employeeCode.value = Number(response.data.code) || undefined;
  } catch (e) {
    console.error('사원 상세 조회 실패:', e);
    errorMsg.value = '사원 정보를 불러오는데 실패했습니다.';
  }
});

watch(filterPeriodType, (val) => {
  if (val === 'month') filterPeriodValue.value = 1;
  else if (val === 'quarter') filterPeriodValue.value = 1;
  else filterPeriodValue.value = 0;
});

watch([hasEmployeeCode, filterYear, filterPeriodType, filterPeriodValue], async ([ready]) => {
  if (!ready) return;
  errorMsg.value = '';
  loading.value = true;
  try {
    await fetchEmployeePerformance();
    await fetchAnnualPerformanceData(filterYear.value);
  } catch (e) {
    console.error('데이터 조회 오류:', e);
    errorMsg.value = '실적 데이터를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
}, { immediate: true });

/**
 * 선택된 기간의 실적과 목표 데이터를 조회해 currentPerformance 세팅
 */
async function fetchEmployeePerformance() {
  if (!employeeCode.value) return;

  let dateRange;
  const year = filterYear.value;
  const type = filterPeriodType.value;
  const value = filterPeriodValue.value;

  if (type === 'month') {
    dateRange = [year * 100 + value];
  } else if (type === 'quarter') {
    const endMonth = value * 3;
    dateRange = [year * 100 + endMonth - 2, year * 100 + endMonth - 1, year * 100 + endMonth];
  } else {
    dateRange = Array.from({ length: 12 }, (_, i) => year * 100 + i + 1);
  }

  const startDate = Math.min(...dateRange);
  const endDate = Math.max(...dateRange);
  const targetYear = Math.floor(startDate / 100);

  try {
    const perfRes = await api.get(`/api/performance/employee/${employeeCode.value}`, {
      params: { startDate, endDate }
    });

    const goalRes = await api.get(`/api/goal/employee`, {
      params: { employeeCode: employeeCode.value, targetYear }
    });

    const performanceList = perfRes.data ?? [];
    const goalList = goalRes.data ?? [];
    console.log(performanceList);
    console.log(goalList);

    // 실적 누적
    const perfSummary = {
      rentalProductCount: 0,
      rentalRetentionCount: 0,
      totalRentalCount: 0,
      newCustomerCount: 0,
      customerFeedbackScore: 0,
      customerFeedbackCount: 0,
      totalRentalAmount: 0,
    };

    for (const dto of performanceList) {
      perfSummary.rentalProductCount += dto.rentalProductCount ?? 0;
      perfSummary.rentalRetentionCount += dto.rentalRetentionCount ?? 0;
      perfSummary.totalRentalCount += dto.totalRentalCount ?? 0;
      perfSummary.newCustomerCount += dto.newCustomerCount ?? 0;
      perfSummary.totalRentalAmount += dto.totalRentalAmount ?? 0;
      perfSummary.customerFeedbackScore += dto.customerFeedbackScore ?? 0;
      perfSummary.customerFeedbackCount += dto.customerFeedbackCount ?? 0;
    }

    // 목표 누적 (기간 필터링)
    const goalSummary = {
      rentalProductCount: 0,
      rentalRetentionCount: 0,
      totalRentalCount: 0,
      newCustomerCount: 0,
      customerFeedbackScore: 0,
      customerFeedbackCount: 0,
    };

    for (const goal of goalList) {
      if (!dateRange.includes(goal.targetDate)) continue;
      goalSummary.rentalProductCount += goal.rentalProductCount ?? 0;
      goalSummary.rentalRetentionCount += goal.rentalRetentionCount ?? 0;
      goalSummary.totalRentalCount += goal.totalRentalCount ?? 0;
      goalSummary.newCustomerCount += goal.newCustomerCount ?? 0;
      goalSummary.customerFeedbackScore += goal.customerFeedbackScore ?? 0;
      goalSummary.customerFeedbackCount += goal.customerFeedbackCount ?? 0;
    }

    currentPerformance.value = [
      {
        name: '렌탈 상품 수',
        key: 'rentalProductCount',
        actual: perfSummary.rentalProductCount,
        target: goalSummary.rentalProductCount,
        achieved: perfSummary.rentalProductCount >= goalSummary.rentalProductCount
      },
      {
        name: '렌탈 유지 수',
        key: 'rentalRetentionCount',
        actual: perfSummary.rentalRetentionCount,
        target: goalSummary.rentalRetentionCount,
        achieved: perfSummary.rentalRetentionCount >= goalSummary.rentalRetentionCount
      },
      {
        name: '총 렌탈 건수',
        key: 'totalRentalCount',
        actual: perfSummary.totalRentalCount,
        target: goalSummary.totalRentalCount,
        achieved: perfSummary.totalRentalCount >= goalSummary.totalRentalCount
      },
      {
        name: '신규 고객 수',
        key: 'newCustomerCount',
        actual: perfSummary.newCustomerCount,
        target: goalSummary.newCustomerCount,
        achieved: perfSummary.newCustomerCount >= goalSummary.newCustomerCount
      },
      {
        name: '고객 만족도',
        key: 'customerFeedbackScore',
        actual: {
          score: perfSummary.customerFeedbackScore,
          count: perfSummary.customerFeedbackCount
        },
        target: {
          score: goalSummary.customerFeedbackScore,
          count: goalSummary.customerFeedbackCount
        },
        achieved: false  // 컴포넌트 내에서 계산 처리
      },
    ];
  } catch (err) {
    console.error('fetchEmployeePerformance 오류:', err);
    throw err;
  }
}

/**
 * 연간 전체 데이터를 조회해 monthlyPerformance 세팅
 */
async function fetchAnnualPerformanceData(year) {
  if (!employeeCode.value) return;

  const yearRange = Array.from({ length: 12 }, (_, i) => year * 100 + i + 1);
  const startDate = Math.min(...yearRange);
  const endDate = Math.max(...yearRange);

  try {
    const [perfRes, goalRes] = await Promise.all([
      api.get(`/api/performance/employee/${employeeCode.value}`, {
        params: { startDate, endDate }
      }),
      api.get(`/api/goal/employee`, {
        params: { employeeCode: employeeCode.value, targetYear: year }
      })
    ]);

    const annualPerformanceList = perfRes.data ?? [];
    const annualGoalList = goalRes.data ?? [];

    updateMonthlyAchievement(annualPerformanceList, annualGoalList);
  } catch (e) {
    console.error('fetchAnnualPerformanceData 오류:', e);
    throw e;
  }
}

/**
 * 연간 실적 및 목표 리스트를 받아 월별 달성 여부를 계산 후
 * monthlyPerformance 객체를 업데이트
 */
function updateMonthlyAchievement(performanceList, goalList) {
  const initArray = () => Array(12).fill(null);
  const perfMap = new Map();
  const goalMap = new Map();

  for (const perf of performanceList) {
    const monthIndex = (perf.targetDate % 100) - 1; // 202501 → 1월 → index = 0
    perfMap.set(monthIndex, perf);
  }

  for (const goal of goalList) {
    const monthIndex = (goal.targetDate % 100) - 1;
    goalMap.set(monthIndex, goal);
  }

  const keys = ['rentalProductCount', 'rentalRetentionCount', 'totalRentalCount', 'newCustomerCount', 'customerFeedbackScore'];
  const result = {};

  for (const key of keys) {
    result[key] = initArray();
    for (let i = 0; i < 12; i++) {
      const perf = perfMap.get(i);
      const goal = goalMap.get(i);

      if (!perf || !goal) {
        result[key][i] = null;
        continue;
      }

      if (key === 'customerFeedbackScore') {
        const avgPerf = perf.customerFeedbackCount > 0 ? perf.customerFeedbackScore / perf.customerFeedbackCount : 0;
        const avgGoal = goal.customerFeedbackCount > 0 ? goal.customerFeedbackScore / goal.customerFeedbackCount : 0;
        result[key][i] = avgPerf >= avgGoal;
      } else {
        result[key][i] = (perf[key] ?? 0) >= (goal[key] ?? 0);
      }
    }
  }

  monthlyPerformance.value = result;
}

const periodLabel = computed(() => {
  if (filterPeriodType.value === 'month') return `${filterYear.value}년 ${filterPeriodValue.value}월`;
  if (filterPeriodType.value === 'quarter') return `${filterYear.value}년 ${filterPeriodValue.value}분기`;
  return `${filterYear.value}년`;
});

const onClickRefresh = async () => {
  if (!employeeCode.value) return;
  loading.value = true;
  errorMsg.value = '';

  let targetDates;

  if (filterPeriodType.value === 'month') {
    targetDates = [filterYear.value * 100 + filterPeriodValue.value];
  } else if (filterPeriodType.value === 'quarter') {
    const endMonth = filterPeriodValue.value * 3;
    targetDates = [endMonth - 2, endMonth - 1, endMonth]
      .map(m => filterYear.value * 100 + m);
  } else {
    // year
    targetDates = Array.from({ length: 12 }, (_, i) => filterYear.value * 100 + i + 1);
  }

  try {
    // 병렬 갱신 요청
    await Promise.all(targetDates.map(date =>
      api.put(`/api/performance/refresh/employee/${employeeCode.value}/${date}`)
    ));

    console.log('실적 갱신 성공');

    // 갱신 후 다시 데이터 조회
    await fetchEmployeePerformance();
    await fetchAnnualPerformanceData(filterYear.value);
  } catch (e) {
    console.error('갱신 오류:', e);
    errorMsg.value = '실적 갱신 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped lang="scss">
.goal-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  thead {
    background-color: #f5f5f5;
  }

  tbody tr:nth-child(even) {
    background-color: #fafafa;
  }
}

.period-label {
  font-size: 14px;
  margin-left: 10px;
  font-weight: 500;
}

.performance-card-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
}

.button {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  border: none;
  color: #fff;
  user-select: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.button.primary {
  background-color: #a6ce39;
}

.button.primary:hover {
  background-color: #94b933;
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
  flex: 1 1 auto;      /* 기본 flex-grow/shrink, flex-basis는 auto */
  min-width: 120px;    /* 최소 너비 지정 */
  max-width: 100%;
  appearance: none;
  border: 1.5px solid #e0e4ea;
  border-radius: 0.5em;
  padding: 0.7em 3.5em 0.7em 1em;  /* 오른쪽 padding 충분히 줌 */
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  background: #f8fafd
    url('data:image/svg+xml;utf8,<svg fill="%2399a" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 8.293a1 1 0 011.414 0L10 9.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"/></svg>') no-repeat right 1em center;
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
</style>
