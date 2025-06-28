<template>
  <div class="employee-goal-search-fields">
    <!-- 기본 노출 -->
    <div class="row">
      <div
        class="field range-field"
        v-for="(item, index) in row1"
        :key="index"
      >
        <label :for="item.key">{{ item.label }}</label>
        <div class="range-inputs" v-if="item.key === 'date'">
          <input
            v-model="filters[item.startKey]"
            :type="item.type || 'text'"
            :placeholder="item.placeholderStart || ''"
          />
          <span class="tilde">~</span>
          <input
            v-model="filters[item.endKey]"
            :type="item.type || 'text'"
            :placeholder="item.placeholderEnd || ''"
          />
        </div>
        <!-- 일반 입력 필드 -->
        <div class="range-inputs" v-else>
          <input
            v-model="filters[item.key]"
            :type="item.type || 'text'"
            :readonly="(item.key === 'departmentName' && !isAdmin)"
          />
        </div>
      </div>
    </div>

    <!-- 확장 노출: 시작/종료 범위 필드 -->
    <div class="row" v-if="expanded">
      <div
        class="field range-field"
        v-for="(f, index) in row2"
        :key="index"
      >
        <label>{{ f.label }}</label>
        <div v-if="f.startKey === 'minTotalRentalAmount'" class="range-inputs">
          <input
            :value="formatNumber(filters.minTotalRentalAmount)"
            @input="onAmountInput('minTotalRentalAmount', $event.target.value)"
            :placeholder="f.startPlaceholder || ''"
            type="text"
          />
          <span class="tilde">~</span>
          <input
            :value="formatNumber(filters.maxTotalRentalAmount)"
            @input="onAmountInput('maxTotalRentalAmount', $event.target.value)"
            :placeholder="f.endPlaceholder || ''"
            type="text"
          />
        </div>
        <div v-else class="range-inputs">
          <input
            v-model="filters[f.startKey]"
            :type="f.type || 'text'"
            :placeholder="f.startPlaceholder || ''"
          />
          <span class="tilde">~</span>
          <input
            v-model="filters[f.endKey]"
            :type="f.type || 'text'"
            :placeholder="f.endPlaceholder || ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";

const props = defineProps({
  filters: Object,
  departmentName: String,
  isAdmin: Boolean,
  expanded: Boolean
})

// 편의용 변수
const filters = props.filters;

watch(() => props.departmentName, (value) => {
  props.filters.departmentName = value;
})

const row1 = [
  {
    label: '부서 이름',
    key: 'departmentName',
    placeholder: '부서명을 입력해주세요',
    type: 'string'
  },
  {
    label: '조회 기간',
    key: 'date',
    startKey: 'startDate',
    startPlaceholder: '2024-01',
    endKey: 'endDate',
    endPlaceholder: '2024-12',
    type: 'month'
  }
]
const row2 = [
  {
    label: '렌탈 상품 수',
    startKey: 'minRentalProductCount',
    startPlaceholder: '5',
    endKey: 'maxRentalProductCount',
    endPlaceholder: '10'
  },
  {
    label: '렌탈 유지율',
    startKey: 'minRentalRetentionRate',
    startPlaceholder: '60',
    endKey: 'maxRentalRetentionRate',
    endPlaceholder: '80'
  },
  {
    label: '신규 고객 수',
    startKey: 'minNewCustomerCount',
    startPlaceholder: '1',
    endKey: 'maxNewCustomerCount',
    endPlaceholder: '5'
  },
  {
    label: '총 렌탈료',
    startKey: 'minTotalRentalAmount',
    startPlaceholder: '1,000,000',
    endKey: 'maxTotalRentalAmount',
    endPlaceholder: '5,000,000'
  },
  {
    label: '고객 만족도',
    startKey: 'minCustomerFeedbackScore',
    startPlaceholder: '1.0',
    endKey: 'maxCustomerFeedbackScore',
    endPlaceholder: '5.0'
  }
];

// 천 단위 구분자 포맷 함수
function formatNumber(val) {
  if (val == null || val === '') return '';
  const num = String(val).replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 입력 값 파싱 후 필터에 저장
function onAmountInput(key, val) {
  filters[key] = val.replace(/[^0-9]/g, '');
}
</script>

<style scoped>
.employee-goal-search-fields {
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
}

.field input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.range-field input:read-only {
  background-color: #eee;
  pointer-events: none;
}

.row {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* range-field를 2열로 확장 */
.range-field {
  grid-column: span 2;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field input,
.field select {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  vertical-align: middle;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.select-wrapper select {
  padding-right: 24px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-inputs input {
  flex: 1;
  min-width: 0;
}

.tilde {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

@media (max-width: 1400px) {
  .row {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1200px) {
  .row {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 992px) {
  .row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .employee-goal-search-fields {
    padding: 12px 16px;
  }

  .row {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .field label {
    font-size: 12px;
  }

  .field input, .field select {
    font-size: 12px;
    padding: 3px 6px;
  }
}

@media (max-width: 576px) {
  .row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .employee-goal-search-fields {
    padding: 8px 12px;
  }

  .row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .field label {
    font-size: 11px;
  }

  .field input, .field select {
    font-size: 11px;
    padding: 2px 4px;
  }

  .range-inputs {
    flex-direction: column;
    gap: 2px;
  }

  .tilde {
    display: none;
  }
}
</style>
