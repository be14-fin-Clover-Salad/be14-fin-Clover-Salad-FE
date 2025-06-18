<template>
  <div class="contract-search-fields">
    <!-- 기본 노출 -->
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="index">
        <label :for="item.key">{{ item.label }}</label>

        <!-- 계약 상태만 select로 분기 -->
        <div v-if="item.key === 'status'" class="select-wrapper">
          <select v-model="filters[item.key]">
            <option value="">전체</option>
            <option value="결재전">결재 전</option>
            <option value="반려">반려됨</option>
            <option value="결재중">결재 중</option>
            <option value="계약만료">계약 만료</option>
            <option value="중도해지">중도 해지</option>
            <option value="계약무효">계약 무효</option>
          </select>
        </div>
        <input
          v-else
          v-model="filters[item.key]"
          :placeholder="item.placeholder"
          :type="item.type || 'text'"
        />
      </div>
    </div>

    <!-- 확장 노출 -->
    <div class="row" v-if="expanded">
      <div class="field" v-for="(item, index) in row2" :key="index">
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
  filters: Object,
  expanded: Boolean
})

const row1 = [
  { label: '계약 번호', key: 'code', placeholder: '예: C-YYmm-1234' },
  { label: '렌탈 비용 (최소)', key: 'minAmount', placeholder: '예: 30000' },
  { label: '렌탈 비용 (최대)', key: 'maxAmount', placeholder: '예: 100000' },
  { label: '계약 상태', key: 'status', placeholder: '예: 계약 중' },
  { label: '고객 명', key: 'customerName', placeholder: '예: 고성연' },
  { label: '담당 영업사원', key: 'employeeName', placeholder: '예: 홍길동' },
  { label: '상품 명', key: 'productName', placeholder: '예: TV 외 3개' }
]

const row2 = [
  { label: '계약 시작일 (시작)', key: 'startDateStart', type: 'date' },
  { label: '계약 시작일 (종료)', key: 'startDateEnd', type: 'date' },
  { label: '계약 만료일 (시작)', key: 'endDateStart', type: 'date' },
  { label: '계약 만료일 (종료)', key: 'endDateEnd', type: 'date' },
  { label: '납입 일자 (시작)', key: 'paymentDayStart', placeholder: '예: 1' },
  { label: '납입 일자 (종료)', key: 'paymentDayEnd', placeholder: '예: 31' },
  { label: '등록일 (시작)', key: 'createdAtStart', type: 'date' },
  { label: '등록일 (종료)', key: 'createdAtEnd', type: 'date' },
  { label: '은행명', key: 'bankName', placeholder: '예: 국민' },
  { label: '예금주', key: 'depositOwner', placeholder: '예: 김성민' },
  { label: '관계', key: 'relationship', placeholder: '예: 부모' }
]
</script>

<style scoped>
.contract-search-fields {
  background-color: #f8fdf2;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
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
}

.select-wrapper {
  position: relative;
}

.select-wrapper::after {
  content: '▾';
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #444;
  font-size: 12px;
}

.select-wrapper select {
  width: 100%;
  padding-right: 24px; /* space for arrow */
}
</style>
