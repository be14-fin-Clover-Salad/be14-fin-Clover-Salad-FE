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
  { label: '원가(시작)', key: 'originCostStart', placeholder: '150000' },
  { label: '원가(끝)', key: 'originCostEnd', placeholder: '200000' },
  { label: '월 렌탈료(시작)', key: 'rentalCostStart', placeholder: '13000' },
  { label: '월 렌탈료(끝)', key: 'rentalCostEnd', placeholder: '18000' }
]
</script>

<style scoped>
.product-search-fields {
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
</style>
