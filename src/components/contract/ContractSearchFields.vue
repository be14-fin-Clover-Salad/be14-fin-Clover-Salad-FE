<template>
  <div class="contract-search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
    <div class="row">
      <div class="field" v-for="(item, index) in row2" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ filters: Object })

const row1 = [
  { label: '계약 번호', key: 'code', placeholder: '예: C-20240601' },
  { label: '계약서', key: 'file', placeholder: '예: 고성연–렌탈–계약서.pdf' },
  { label: '렌탈 비용 (최소)', key: 'minAmount', placeholder: '예: 30000' },
  { label: '렌탈 비용 (최대)', key: 'maxAmount', placeholder: '예: 100000' },
  { label: '계약 상태', key: 'status', placeholder: '예: 계약 중' },
  { label: '고객 명', key: 'customerName', placeholder: '예: 고성연' },
  { label: '담당 영업사원', key: 'employeeName', placeholder: '예: 홍길동' },
]

const row2 = [
  { label: '계약 시작일', key: 'startDateStart', type: 'date' },
  { label: '계약 만료일', key: 'endDateEnd', type: 'date' },
  { label: '납입 일자 (시작)', key: 'paymentDayStart', placeholder: '예: 1' },
  { label: '납입 일자 (종료)', key: 'paymentDayEnd', placeholder: '예: 31' },
  { label: '은행명', key: 'bankName', placeholder: '예: 국민' },
  { label: '등록 시간', key: 'createdAtStart', type: 'date' },
  { label: '예금주', key: 'depositOwner', placeholder: '예: 김성민' },
  { label: '예금주와의 관계', key: 'relationship', placeholder: '예: 부모' },
  { label: '상품 명', key: 'productName', placeholder: '예: TV 외 3개' },
  { label: '비고', key: 'etc', placeholder: '예: 장기 렌탈 고객' }
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

.field input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
