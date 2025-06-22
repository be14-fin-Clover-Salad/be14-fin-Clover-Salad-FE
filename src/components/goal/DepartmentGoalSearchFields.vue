<template>
  <div class="search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input
          v-model="filters[item.key]"
          :placeholder="item.placeholder"
          :type="item.type || 'number'"
          :min="item.type === 'month' ? '1900-01' : undefined"
          :max="item.type === 'month' ? '2100-12' : undefined"
          :readonly="(item.key === 'departmentName' && !isAdmin)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";

const props = defineProps({
  filters: Object,
  departmentName: String,
  isAdmin: Boolean
})

watch(() => props.departmentName, (value) => {
  props.filters.departmentName = value;
})

const row = [
  { label: '부서 이름', key: 'departmentName', type: 'string' },
  { label: '조회 기간(시작)', key: 'startDate', placeholder: '2024-01', type: 'month' },
  { label: '조회 기간(끝)', key: 'endDate', placeholder: '2024-12', type: 'month' },
  { label: '렌탈 상품 수(시작)', key: 'minRentalProductCount', placeholder: '5' },
  { label: '렌탈 상품 수(끝)', key: 'maxRentalProductCount', placeholder: '10' },
  { label: '렌탈 유지율(시작)', key: 'minRentalRetentionRate', placeholder: '60' },
  { label: '렌탈 유지율(끝)', key: 'maxRentalRetentionRate', placeholder: '80' },
  { label: '신규 고객 수(시작)', key: 'minNewCustomerCount', placeholder: '1' },
  { label: '신규 고객 수(끝)', key: 'maxNewCustomerCount', placeholder: '5' },
  { label: '총 렌탈료(시작)', key: 'minTotalRentalAmount', placeholder: '1000000' },
  { label: '총 렌탈료(끝)', key: 'maxTotalRentalAmount', placeholder: '5000000' },
  { label: '고객 만족도(시작)', key: 'minCustomerFeedbackScore', placeholder: '1.0' },
  { label: '고객 만족도(끝)', key: 'maxCustomerFeedbackScore', placeholder: '5.0' }
]
</script>

<style scoped>
.search-fields {
  background-color: #f8fdf2;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 10px;
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

.field input:read-only {
  background-color: #eee;
  pointer-events: none;
}
</style>
