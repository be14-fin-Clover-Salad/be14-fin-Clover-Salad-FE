<template>
  <div class="contract-search-fields">
    <!-- 기본 노출 -->
    <div class="row">
      <div
        class="field"
        v-for="(item, index) in row1"
        :key="index"
        :class="{ 'range-field': item.key === 'rentalAmountRange' }"
      >
        <label :for="item.key">{{ item.label }}</label>

        <!-- 렌탈 비용은 range 처리 (천 단위 구분자 포맷) -->
        <div v-if="item.key === 'rentalAmountRange'" class="range-inputs">
          <input
            :value="formatNumber(filters.minAmount)"
            @input="onAmountInput('minAmount', $event.target.value)"
            placeholder="최소 금액"
            type="text"
          />
          <span class="tilde">~</span>
          <input
            :value="formatNumber(filters.maxAmount)"
            @input="onAmountInput('maxAmount', $event.target.value)"
            placeholder="최대 금액"
            type="text"
          />
        </div>

        <!-- 계약 상태는 select -->
        <div v-else-if="item.key === 'status'" class="select-wrapper">
          <select v-model="filters[item.key]">
            <option value="">전체</option>
            <option value="결재전">결재 전</option>
            <option value="반려">반려됨</option>
            <option value="결재중">결재 중</option>
            <option value="계약중">계약 중</option>
            <option value="계약만료">계약 만료</option>
            <option value="중도해지">중도 해지</option>
            <option value="계약무효">계약 무효</option>
          </select>
        </div>

        <!-- 일반 입력 필드 -->
        <input
          v-else
          v-model="filters[item.key]"
          :placeholder="item.placeholder"
          :type="item.type || 'text'"
        />
      </div>
    </div>

    <!-- 확장 노출: 시작/종료 범위 필드 -->
    <div class="row" v-if="expanded">
      <div
        class="field range-field"
        v-for="(f, index) in rangeFields"
        :key="index"
      >
        <label>{{ f.label }}</label>
        <div class="range-inputs">
          <input
            v-model="filters[f.startKey]"
            :type="f.type || 'text'"
            :placeholder="f.placeholderStart || ''"
          />
          <span class="tilde">~</span>
          <input
            v-model="filters[f.endKey]"
            :type="f.type || 'text'"
            :placeholder="f.placeholderEnd || ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  filters: Object,
  expanded: Boolean
});
// 편의용 변수
const filters = props.filters;

// 필드 정의
const row1 = [
  { label: '계약 번호',     key: 'code',               placeholder: '예: C-YYmm-1234' },
  { label: '렌탈 비용',     key: 'rentalAmountRange' },
  { label: '계약 상태',     key: 'status' },
  { label: '고객 명',       key: 'customerName',       placeholder: '예: 고성연' },
  { label: '담당 영업사원', key: 'employeeName',       placeholder: '예: 홍길동' },
  { label: '상품 명',       key: 'productName',        placeholder: '예: TV 외 3개' }
];
const rangeFields = [
  { label: '계약 시작일', startKey: 'startDateStart', endKey: 'startDateEnd', type: 'date' },
  { label: '계약 만료일', startKey: 'endDateStart',   endKey: 'endDateEnd',   type: 'date' },
  { label: '납입 일자',   startKey: 'paymentDayStart', endKey: 'paymentDayEnd', placeholderStart: '예: 1', placeholderEnd: '예: 31' },
  { label: '등록일',      startKey: 'createdAtStart',  endKey: 'createdAtEnd',  type: 'date' }
];

// 천 단위 구분자 포맷 함수
function formatNumber(val) {
  if (val == null || val === '') return '';
  const num = String(val).replace(/[^0-9]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// 입력 값 파싱 후 필터에 저장
function onAmountInput(key, val) {
  const numeric = val.replace(/[^0-9]/g, '');
  filters[key] = numeric;
}
</script>

<style scoped>
.contract-search-fields {
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
  min-width: 0;
  overflow: hidden;
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
.select-wrapper { position: relative; }
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
.select-wrapper select { padding-right: 24px; }
.range-inputs { display: flex; align-items: center; gap: 4px; }
.range-inputs input { flex: 1; min-width: 0; }
.tilde { font-size: 12px; color: #666; flex-shrink: 0; }

@media (max-width: 1400px) { .row { grid-template-columns: repeat(6, 1fr); } }
@media (max-width: 1200px) { .row { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 992px)  { .row { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 768px)  {
  .contract-search-fields { padding: 12px 16px; }
  .row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .field label { font-size: 12px; }
  .field input, .field select { font-size: 12px; padding: 3px 6px; }
}
@media (max-width: 576px) { .row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  {
  .contract-search-fields { padding: 8px 12px; }
  .row { grid-template-columns: 1fr; gap: 6px; }
  .field label { font-size: 11px; }
  .field input, .field select { font-size: 11px; padding: 2px 4px; }
  .range-inputs { flex-direction: column; gap: 2px; }
  .tilde { display: none; }
}
</style>
