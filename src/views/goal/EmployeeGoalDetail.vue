<template>
  <section>
    <div class="section-header">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 23%">
        <h2 class="section-title">실적 목표 조회</h2>
        <span>사번: </span>
        <input :value="route.params.gotEmployeeCode" type="number" :min="1901" :max="2100" readonly style="width: 23%;" />
        <input :value="targetYear" type="number" :min="1901" :max="2100" readonly style="width: 13%;" />
        <span>년</span>
      </div>
      <div class="section-actions">
        <button class="button primary" @click="updateGoal" >수정</button>
        <button class="button danger" @click="showEmployeeGoalDeleteModal = true" >삭제</button>
      </div>
    </div>

    <table class="goal-table">
      <thead>
      <tr>
        <th>항목＼월</th>
        <th v-for="month in 12" :key="month">{{ month }}월</th>
        <th>총합</th>
        <th>평균</th>
        <th>기준</th>
      </tr>
      </thead>
      <tbody v-if="visibleItems.length">
      <tr v-for="(item, i) in visibleItems" :key="i" >
        <td>{{ item.label }}</td>

        <!-- 월별 입력 -->
        <td
          v-for="month in 12"
          :key="month"
          :class="{ 'under-threshold': isUnderThreshold(item, month) }"
        >
          <input
            type="number"
            :value="getGoalValue(item.key, month)"
            class="goal-input"
            readonly
          />
        </td>

        <!-- 총합 -->
        <td :class="{ 'under-total': isUnderTotal(item) }">
          {{
            ['rentalProductCount', 'newCustomerCount', 'totalRentalAmount'].includes(item.key)
              ? getTotal(item.key)
              : '-'
          }}
        </td>

        <!-- 평균 -->
        <td :class="{ 'under-total': isUnderAverage(item) }">
          {{
            item.key === 'rentalRetentionCount'
              ? getRatio(item.key, item.pairKey).toFixed(1) + '%'
              : item.key === 'customerFeedbackScore'
                ? (getFeedbackScoreAverage().toFixed(1))
                : '-'
          }}
        </td>

        <!-- 기준 -->
        <td>
          {{
            item.key === 'totalRentalCount' || item.key === 'customerFeedbackCount'
              ? '-'
              : item.key === 'customerFeedbackScore'
                ? (standards.customerFeedbackScore != null
                    ? (standards.customerFeedbackScore / 10).toFixed(1)
                    : '-')
                : item.isRatio
                  ? standards[item.standardKey] != null
                    ? standards[item.standardKey] + '%'
                    : '-'
                  : standards[item.key] != null
                    ? standards[item.key]
                    : '-'
          }}
        </td>
      </tr>
      </tbody>
    </table>

    <EmployeeGoalDeleteModal
      :isOpen="showEmployeeGoalDeleteModal"
      :targetYear="targetYear"
      @close="showEmployeeGoalDeleteModal = false"
      @confirm="deleteGoal(goalData)"
    />
  </section>
</template>

<script setup>
import EmployeeGoalDeleteModal from '@/components/goal/EmployeeGoalDeleteModal.vue'
import { ref, reactive, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from "@/api/auth.js";
import { useAuthStore } from "@/stores/auth.js";

const showEmployeeGoalDeleteModal = ref(false);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const targetYear = computed(() => route.params.gotTargetYear);
const level = ref(null);
const existDefaultGoal = ref(false);
const goalData = ref(null);

const items = [
  { label: '렌탈 상품 수', key: 'rentalProductCount' },
  {
    label: '렌탈 유지 수',
    key: 'rentalRetentionCount',
    pairKey: 'totalRentalCount',
    standardKey: 'rentalRetentionRate',
    isRatio: true
  },
  { label: '총 렌탈 수', key: 'totalRentalCount' }, // 화면에는 중복 표시 방지
  { label: '신규 고객 수', key: 'newCustomerCount' },
  { label: '총 렌탈료', key: 'totalRentalAmount' },
  {
    label: '고객 만족도 총합',
    key: 'customerFeedbackScore',
    pairKey: 'customerFeedbackCount',
    standardKey: 'customerFeedbackScore',
    isAverageScore: true
  },
  { label: '고객 만족도 수', key: 'customerFeedbackCount' },
]

const goals = reactive({})

async function initGoals() {
  const response = await api.get(`/api/goal/change/${route.params.gotEmployeeCode}/${targetYear.value}`)
  console.log('get goals', response.data);
  goalData.value = response.data;
  // 초기화
  for (const item of items) {
    goals[item.key] = {};
    for (let month = 1; month <= 12; month++) {
      goals[item.key][month] = 0;
    }
  }

  // response → goals에 매핑
  for (const goal of response.data) {
    const month = Number(goal.targetDate % 100); // 예: 202502 → 2월

    for (const item of items) {
      if (goal[item.key] != null) {
        // 문자열이면 숫자로 변환
        let value = goal[item.key];

        if (item.key === 'customerFeedbackScore') {
          value = Number(value) / 10; // 백분율 저장 → 실수로 변환
        } else {
          value = Number(value);
        }

        goals[item.key][month] = value;
      }
    }
  }
}

initGoals();

const visibleItems = computed(() => {
  return items.filter(item => !item.hidden && goals[item.key] != null);
});

const standards = ref({
  rentalProductCount: 0,     // 총 연간 렌탈 상품 수
  rentalRetentionRate: 0,    // 연 평균 유지율 (%)
  newCustomerCount: 0,       // 신규 고객 수
  totalRentalAmount: 0,      // 총 렌탈료 (원)
  customerFeedbackScore: 0   // 평균 만족도 점수
})

watch(targetYear, async (newYear) => {
  if (!newYear || String(newYear).length !== 4) return;
  try {
    level.value = authStore.userInfo?.levelLabel;
    console.log('현재 로그인한 사원의 직급: ', level.value);
    const response = await api.get(`/api/goal/default/${newYear}/${level.value}`);
    console.log('response.data: ', response.data);
    standards.value = {
      rentalProductCount: 0,
      rentalRetentionRate: 0,
      newCustomerCount: 0,
      totalRentalAmount: 0,
      customerFeedbackScore: 0,
      ...response.data
    };
    console.log('standards.value: ', standards.value);
    if (!response.data) {
      console.log('기준 목표 없음');
      existDefaultGoal.value = false;
    } else {
      existDefaultGoal.value = true;
    }
  } catch (error) {
    console.error('기준 목표 불러오기 실패: ', error);
  } finally {
    console.log('goals:', goals)
    console.log('standards:', standards.value)
    console.log('visibleItems:', visibleItems.value)
  }
}, { immediate: true });

const getTotal = (key) => {
  if (!key) return 0;
  const target = goals[key];
  return target ? Object.values(target).reduce((sum, val) => sum + (Number(val) || 0), 0) : 0;
}

const getRatio = (key, pairKey) => {
  if (!key || !pairKey) return 0;
  const numerator = getTotal(key);
  const denominator = getTotal(pairKey);
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

const getMonthlyRatio = (key, pairKey, month) => {
  const numerator = goals[key]?.[month] ?? 0;
  const denominator = goals[pairKey]?.[month] ?? 0;
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

const isUnderThreshold = (item, month) => {
  if (!standards.value) return false;

  // 기준 없음 항목은 상위 항목 기준으로 강조
  if (item.key === 'totalRentalCount') {
    const ratio = getMonthlyRatio('rentalRetentionCount', 'totalRentalCount', month);
    return ratio < standards.value.rentalRetentionRate * 0.7;
  }

  if (item.key === 'customerFeedbackCount') {
    const numerator = goals['customerFeedbackScore']?.[month] ?? 0;
    const denominator = goals['customerFeedbackCount']?.[month] ?? 0;
    const avg = denominator ? numerator / denominator : 0;
    return avg < standards.value.customerFeedbackScore * 0.1 * 0.7;
  }

  if (item.key === 'rentalRetentionCount') {
    const ratio = getMonthlyRatio(item.key, item.pairKey, month);
    return ratio < standards.value[item.standardKey] * 0.7;
  }

  if (item.key === 'customerFeedbackScore') {
    const numerator = goals['customerFeedbackScore']?.[month] ?? 0;
    const denominator = goals['customerFeedbackCount']?.[month] ?? 0;
    const avg = denominator ? numerator / denominator : 0;
    return avg < (standards.value.customerFeedbackScore / 10) * 0.7;
  }

  // 기본 항목들: 기준/12 * 0.7 → 반올림
  if (standards.value[item.key] != null) {
    const monthlyThreshold = Math.round((standards.value[item.key] * 0.7) / 12);
    return goals[item.key][month] < monthlyThreshold;
  }

  return false;
};

const isUnderTotal = (item) => {
  if (item.key === 'totalRentalCount') {
    return getRatio('rentalRetentionCount', 'totalRentalCount') < standards.value.rentalRetentionRate * 0.7;
  }
  if (item.key === 'customerFeedbackCount') {
    return getFeedbackScoreAverage() < (standards.value.customerFeedbackScore / 10) * 0.7;
  }
  if (item.key === 'rentalRetentionCount') {
    return getRatio(item.key, item.pairKey) < standards.value[item.standardKey] * 0.7;
  }
  if (item.key === 'customerFeedbackScore') {
    return getFeedbackScoreAverage() < (standards.value.customerFeedbackScore / 10) * 0.7;
  }
  return getTotal(item.key) < standards.value[item.key];
};

const isUnderAverage = (item) => {
  return isUnderTotal(item); // 평균 강조 조건도 동일 기준 사용
};

function getFeedbackScoreAverage() {
  const totalScore = getTotal('customerFeedbackScore');
  const count = getTotal('customerFeedbackCount');
  return count ? totalScore / count : 0;
}

function getGoalValue(key, month) {
  return goals[key]?.[month] ?? 0;
}

function updateGoal() {
  router.push(`/goal/update/${route.params.gotEmployeeCode}/${route.params.gotTargetYear}`);
}

async function deleteGoal(goalData) {
  const token = useAuthStore().accessToken;

  console.log(goalData);
  try {
    const response = await api.delete(`/api/goal/delete`, {
      data: goalData,
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error('상품 삭제 실패:', error);
  } finally {
    await router.push('/goal/employee');
  }
}
</script>

<style scoped>
/* 공통 섹션 박스 */
section {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.03);
}

/* 섹션 제목 및 버튼 영역 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

/* 버튼들 */
.section-actions {
  display: flex;
  gap: 8px;
}

.section-actions .button {
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

.section-actions .button.primary {
  background-color: #a6ce39;
}

.section-actions .button.primary:hover {
  background-color: #94b933;
}

.section-actions .button.danger {
  background-color: #e53935;
}

.section-actions .button.danger:hover {
  background-color: #c62828;
  color: #fbe9e7;
}

.section-actions .button:disabled {
  cursor: not-allowed;
}

.goal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.goal-table th,
.goal-table td {
  border: 1px solid #ddd;
  padding: 6px 8px;
  text-align: center;
}

.goal-input {
  width: 70px;
  text-align: right;
}

/* 기준 미달 강조 */
.under-threshold input {
  background-color: #ffecec;
}

.under-total {
  background-color: #ffcfcf;
}
</style>
