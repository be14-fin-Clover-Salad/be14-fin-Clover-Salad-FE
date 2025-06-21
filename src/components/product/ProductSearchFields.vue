<template>
  <div class="product-search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ filters: Object })

const row = [
  { label: '상품 코드', key: 'productCode', placeholder: 'P0001' },
  { label: '카테고리', key: 'category', placeholder: '청소기' },
  { label: '상품명', key: 'name', placeholder: '청소기 1호' },
  { label: '모델명', key: 'serialNumber', placeholder: 'SN20240001' },
  { label: '제조사', key: 'company', placeholder: '삼성' },
  { label: '원가(시작)', key: 'originCostStart', placeholder: '150000', type: 'number' },
  { label: '원가(끝)', key: 'originCostEnd', placeholder: '200000', type: 'number' },
  { label: '월 렌탈료(시작)', key: 'rentalCostStart', placeholder: '13000', type: 'number' },
  { label: '월 렌탈료(끝)', key: 'rentalCostEnd', placeholder: '18000', type: 'number' }
]
</script>

<style scoped>
.product-search-fields {
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
  /* 반응형 처리를 위한 최소 너비 설정 */
  min-width: 0;
  overflow: hidden;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 10px;
  /* 반응형 그리드 설정 */
}

.field {
  display: flex;
  flex-direction: column;
  /* 필드가 줄어들지 않도록 최소 너비 설정 */
  min-width: 0;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
  /* 라벨 텍스트가 줄어들지 않도록 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  /* 입력 필드가 부모를 넘어가지 않도록 */
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

/* 반응형 미디어 쿼리 */
@media (max-width: 1200px) {
  .row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-search-fields {
    padding: 12px 16px;
  }
  
  .row {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .field label {
    font-size: 12px;
  }
  
  .field input {
    font-size: 12px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  .product-search-fields {
    padding: 8px 12px;
  }
  
  .row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .field label {
    font-size: 11px;
  }
  
  .field input {
    font-size: 11px;
    padding: 2px 4px;
  }
}
</style>
