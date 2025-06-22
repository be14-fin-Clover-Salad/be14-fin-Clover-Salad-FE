<template>
  <div class="sales-search-fields">
    <!-- 첫 번째 행 - 항상 보임 -->
    <div class="row">
      <div class="field">
        <label>부서명</label>
        <input v-model="filters.department" placeholder="예: 영업부" type="text" />
      </div>
      <div class="field">
        <label>직원명</label>
        <input v-model="filters.employeeName" placeholder="예: 김영업" type="text" />
      </div>
      <div class="field">
        <label>계약 코드</label>
        <input v-model="filters.contractCode" placeholder="예: C-20240101" type="text" />
      </div>
      <div class="field">
        <label></label>
        <div></div>
      </div>
    </div>
    
    <!-- 두 번째 행 - expanded가 true일 때만 보임 -->
    <template v-if="expanded">
      <div class="row">
        <div class="field">
          <label>매출 날짜 (시작)</label>
          <input v-model="filters.startDate" type="date" />
        </div>
        <div class="field">
          <label>매출 날짜 (종료)</label>
          <input v-model="filters.endDate" type="date" />
        </div>
        <div class="field">
          <label>최소 금액</label>
          <input v-model="filters.minAmount" placeholder="예: 1000000" type="number" />
        </div>
        <div class="field">
          <label>최대 금액</label>
          <input v-model="filters.maxAmount" placeholder="예: 10000000" type="number" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: Object,
  expanded: { type: Boolean, default: false }
})

const allFields = [
  { label: '부서명', key: 'department', placeholder: '예: 영업부' },
  { label: '직원명', key: 'employeeName', placeholder: '예: 김영업' },
  { label: '계약 코드', key: 'contractCode', placeholder: '예: C-20240101' },
  { label: '매출 날짜 (시작)', key: 'startDate', type: 'date' },
  { label: '매출 날짜 (종료)', key: 'endDate', type: 'date' },
  { label: '최소 금액', key: 'minAmount', placeholder: '예: 1000000', type: 'number' },
  { label: '최대 금액', key: 'maxAmount', placeholder: '예: 10000000', type: 'number' }
]
</script>

<style scoped>
.sales-search-fields {
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}

.row:last-child {
  grid-template-columns: repeat(4, 1fr);
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
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  vertical-align: middle;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
}

.field input:focus {
  outline: none;
  border-color: #007bff;
}
</style> 