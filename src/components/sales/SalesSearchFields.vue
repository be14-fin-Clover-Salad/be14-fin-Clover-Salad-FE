<template>
  <div class="sales-search-fields">
    <!-- 모든 필드를 1행에 배치 -->
    <div class="row">
      <div class="field" v-for="(item, index) in allFields" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input
          v-model="filters[item.key]"
          :placeholder="item.placeholder"
          :type="item.type || 'text'"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: Object
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
  background-color: #f8fdf2;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 50px;
  flex: 1;
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
</style> 