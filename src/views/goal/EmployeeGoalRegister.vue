<template>
  <section>
    <div class="section-header">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 15%">
        <h2 class="section-title">실적 목표 등록</h2>
        <input v-model="targetYear" type="number" :min="1901" :max="2100"/>
        <span>년</span>
      </div>
      <div class="section-actions">
        <button class="button primary" @click="fillDummyData">더미 데이터 입력</button>
        <button class="button primary" @click="onClickRegister" :disabled="!existDefaultGoal">등록</button>
        <button class="button danger" @click="showGoalRegisterCancelModal = true">취소</button>
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
            @input="updateGoalValue(item.key, month, $event.target.value)"
            class="goal-input"
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

    <GoalRegisterCancelModal
      :isOpen="showGoalRegisterCancelModal"
      :type="type"
      @close="showGoalRegisterCancelModal = false"
      @cancel="router.push('/goal/employee');"
    />
    <GoalRegisterConfirmModal
      :isOpen="showGoalRegisterConfirmModal"
      :type="type"
      :isValid="isValid"
      @close="showGoalRegisterConfirmModal = false"
      @confirm="registerGoal"
    />
  </section>
</template>

<script setup>
import GoalRegisterCancelModal from "@/components/goal/GoalRegisterCancelModal.vue";
import GoalRegisterConfirmModal from "@/components/goal/GoalRegisterConfirmModal.vue";
import { ref, reactive, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from "@/api/auth.js";
import { useAuthStore } from "@/stores/auth.js";

const router = useRouter();
const type = ref("등록");
const isLoading = ref(false);
const showGoalRegisterCancelModal = ref(false);
const showGoalRegisterConfirmModal = ref(false);
const isValid = ref(false);
const authStore = useAuthStore();
const targetYear = ref(new Date().getFullYear());
const level = ref(null);
const existDefaultGoal = ref(false);

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

function initGoals() {
  for (const item of items) {
    goals[item.key] = {};
    for (let month = 1; month <= 12; month++) {
      goals[item.key][month] = 0;
    }
  }
}

initGoals();

console.log('goals: ', goals);
console.log('goals[items[0].key]: ', goals[items[0].key]);

const visibleItems = computed(() => {
  return items.filter(item => !item.hidden && goals[item.key] != null);
});

console.log('goals[visibleItems.value[0].key]: ', goals[visibleItems.value[0].key]);
console.log('goals["rentalProductCount"]: ', goals['rentalProductCount']);
console.log('goals[items[0].key][1]: ', goals[items[0].key][1]);
console.log('visibleItems.value:', visibleItems.value)
console.log('visibleItems.value[0]:', visibleItems.value[0])
console.log('visibleItems.value[0].key:', visibleItems.value[0].key)
console.log('visibleItems.value.length:', visibleItems.value.length)

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
});

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

function onClickRegister() {
  let valid = true;

  for (const item of items) {
    if (!goals[item.key]) continue;

    const standard = item.isRatio
      ? standards.value[item.standardKey]
      : standards.value[item.key];

    // 기준이 없으면 검증 제외
    if (standard == null) continue;

    if (item.key === 'rentalRetentionCount') {
      const ratio = getRatio('rentalRetentionCount', 'totalRentalCount');
      if (ratio < standard) {
        valid = false;
        break;
      }
    } else if (item.key === 'customerFeedbackScore') {
      const avg = getFeedbackScoreAverage(); // 총합 / 수
      if (avg < standard / 10) {
        valid = false;
        break;
      }
    } else {
      const total = getTotal(item.key);
      if (total < standard) {
        valid = false;
        break;
      }
    }
  }

  isValid.value = valid;
  showGoalRegisterConfirmModal.value = true;
}

function getGoalValue(key, month) {
  return goals[key]?.[month] ?? 0;
}

function updateGoalValue(key, month, value) {
  const numValue = Number(value) || 0;

  if (key === 'customerFeedbackScore') {
    const count = goals['customerFeedbackCount']?.[month] ?? 0;
    goals[key][month] = Math.min(numValue, count * 5);
  } else if (key === 'customerFeedbackCount') {
    const score = goals['customerFeedbackScore']?.[month] ?? 0;
    const maxScore = numValue * 5;
    goals[key][month] = numValue;
    // 고객 만족도 총합이 새 count * 5를 넘으면 줄여줌
    if (score > maxScore) {
      goals['customerFeedbackScore'][month] = maxScore;
    }
  } else if (key === 'rentalRetentionCount') {
    const totalRental = goals['totalRentalCount']?.[month] ?? 0;
    goals[key][month] = Math.min(numValue, totalRental);
  } else {
    goals[key][month] = numValue;
  }
}

async function registerGoal() {
  try {
    isLoading.value = true;

    const goalList = [];

    for (let month = 1; month <= 12; month++) {
      const goal = {
        targetDate: Number(`${targetYear.value}${String(month).padStart(2, '0')}`)
      };

      for (const item of items) {
        if (item.hidden) continue;

        let value = goals[item.key][month];

        // 고객 만족도 점수는 문자열로 변환하여 *10 처리
        if (item.key === 'customerFeedbackScore') {
          value = String(Math.round((Number(value) || 0) * 10));
        } else {
          value = String(Number(value) || 0);
        }

        goal[item.key] = value;
      }

      goalList.push(goal);
    }

    console.log('전송 데이터:', goalList);

    const token = useAuthStore().accessToken;
    console.log("보낼 토큰:", token);

    const response = await api.post('/api/goal/register', goalList, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('등록 완료:', response);
  } catch (error) {
    console.error('실적 목표 등록 실패:', error);
  } finally {
    isLoading.value = false;
    await router.push('/goal/employee');
  }
}

// 등록 테스트용
function fillDummyData() {
  for (let month = 1; month <= 12; month++) {
    // 1) 먼저 의존하는 값들부터 채우기
    goals['totalRentalCount'][month] = 1;
    goals['customerFeedbackCount'][month] = 1;

    // 2) 의존하는 값에 따라 조정해야 하는 값 채우기
    goals['rentalRetentionCount'][month] = 1;
    goals['customerFeedbackScore'][month] = 5;

    // 3) 나머지 값들 채우기
    for (const item of items) {
      if (item.key === 'totalRentalCount'
       || item.key === 'customerFeedbackCount'
       || item.key === 'rentalRetentionCount'
       || item.key === 'customerFeedbackScore'
      ) {
        continue; // 이미 채움
      }
      switch (item.key) {
        case 'rentalProductCount':
          goals[item.key][month] = 1;
          break;
        case 'newCustomerCount':
          goals[item.key][month] = 1;
          break;
        case 'totalRentalAmount':
          goals[item.key][month] = 111110;
          break;
        default:
          goals[item.key][month] = 1;
      }
    }
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
