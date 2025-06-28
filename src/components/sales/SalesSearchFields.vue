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
        <div class="field date-range-field">
          <label>매출 날짜</label>
          <div class="date-inputs">
            <input v-model="filters.startDate" type="date" placeholder="시작일" />
            <span class="date-separator">~</span>
            <input v-model="filters.endDate" type="date" placeholder="종료일" />
          </div>
        </div>
        <div class="field date-range-field">
          <label>매출 금액</label>
          <div class="date-inputs">
            <input 
              v-model="formattedMinAmount" 
              placeholder="최소 금액" 
              type="text"
              @input="handleMinAmountInput"
            />
            <span class="date-separator">~</span>
            <input 
              v-model="formattedMaxAmount" 
              placeholder="최대 금액" 
              type="text"
              @input="handleMaxAmountInput"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: Object,
  expanded: { type: Boolean, default: false }
})

// 숫자 포맷팅 함수
function formatNumber(value) {
  if (!value) return ''
  // 숫자가 아닌 문자 제거
  const numericValue = value.toString().replace(/[^0-9]/g, '')
  if (!numericValue) return ''
  // 세 자리마다 콤마 추가
  return parseInt(numericValue).toLocaleString('ko-KR')
}

// 포맷된 숫자를 실제 숫자로 변환
function parseFormattedNumber(value) {
  if (!value) return null
  const numericValue = value.toString().replace(/[^0-9]/g, '')
  return numericValue ? parseInt(numericValue) : null
}

// 최소 금액 입력 핸들러
function handleMinAmountInput(event) {
  const inputValue = event.target.value
  const numericValue = parseFormattedNumber(inputValue)
  
  // 실제 값 업데이트
  props.filters.minAmount = numericValue
}

// 최대 금액 입력 핸들러
function handleMaxAmountInput(event) {
  const inputValue = event.target.value
  const numericValue = parseFormattedNumber(inputValue)
  
  // 실제 값 업데이트
  props.filters.maxAmount = numericValue
}

// 포맷된 금액 표시용 computed
const formattedMinAmount = computed({
  get: () => formatNumber(props.filters.minAmount),
  set: (value) => {
    props.filters.minAmount = parseFormattedNumber(value)
  }
})

const formattedMaxAmount = computed({
  get: () => formatNumber(props.filters.maxAmount),
  set: (value) => {
    props.filters.maxAmount = parseFormattedNumber(value)
  }
})
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
  gap: 20px;
  margin-bottom: 10px;
}

.date-range-field {
  grid-column: span 2;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 5px;
  align-items: center;
}

.date-separator {
  text-align: center;
  font-weight: 600;
  color: #666;
  font-size: 14px;
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
  min-width: 0;
}

.field input:focus {
  outline: none;
  border-color: #ccc;
}
</style> 