<template>
  <div class="search-fields">
    <!-- 첫 번째 행 (항상 표시) -->
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'"/>
      </div>
    </div>

    <!-- 나머지 행들 (expanded일 때만 표시) -->
    <div class="row" v-if="expanded">
      <div
        class="field range-field"
        v-for="(f, index) in row2"
        :key="index"
      >
        <label>{{ f.label }}</label>
        <div class="range-inputs">
          <input
            :value="formatNumber(filters[f.startKey])"
            @input="onAmountInput(f.startKey, $event.target.value)"
            :placeholder="f.startPlaceholder || ''"
            type="text"
          />
          <span class="tilde">~</span>
          <input
            :value="formatNumber(filters[f.endKey])"
            @input="onAmountInput(f.endKey, $event.target.value)"
            :placeholder="f.endPlaceholder || ''"
            type="text"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  filters: Object,
  expanded: { type: Boolean, default: false }
})

const filters = props.filters;

const allFields = [
  { label: '상품 코드', key: 'productCode', placeholder: '상품 코드' },
  { label: '카테고리', key: 'category', placeholder: '카테고리' },
  { label: '상품명', key: 'name', placeholder: '상품명' },
  { label: '모델명', key: 'serialNumber', placeholder: '모델명' },
  { label: '제조사', key: 'company', placeholder: '제조사' },
  {
    label: '원가',
    startKey: 'minOriginCost',
    startPlaceholder: '원가(시작)',
    endKey: 'maxOriginCost',
    endPlaceholder: '원가(끝)',
    type: 'number'
  },
  {
    label: '월 렌탈료',
    startKey: 'minRentalCost',
    startPlaceholder: '월 렌탈료(시작)',
    endKey: 'maxRentalCost',
    endPlaceholder: '월 렌탈료(끝)',
    type: 'number'
  }
]

// 첫 번째 행 (5개 필드)
const row1 = allFields.slice(0, 5)
// 나머지 행들 (4개 필드)
const row2 = allFields.slice(5)

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
.search-fields {
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
  grid-template-columns: repeat(5, 1fr);
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
  .search-fields {
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
  .search-fields {
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
