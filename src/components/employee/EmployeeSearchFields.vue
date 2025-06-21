<template>
  <div class="employee-search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="item.key">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
    <div class="row">
      <div class="field" v-for="(item, index) in row2" :key="item.key">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ filters: Object })

const row1 = [
  { label: '사번', key: 'code', placeholder: '예: 202401001' },
  { label: '이름', key: 'name', placeholder: '예: 홍길동' },
  { label: '연락처', key: 'phone', placeholder: '예: 010-1234-5678' },
  { label: '이메일', key: 'email', placeholder: '예: hong@email.com' },
  { label: '직급', key: 'level', placeholder: '예: 사원' }
]

const row2 = [
  { label: '입사일 (시작)', key: 'hireDateFrom', type: 'date' },
  { label: '입사일 (종료)', key: 'hireDateTo', type: 'date' },
  { label: '근무지', key: 'workPlace', placeholder: '예: 서울본사' },
  { label: '부서명', key: 'departmentName', placeholder: '예: 영업1팀' }
]
</script>

<style scoped>
.employee-search-fields {
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
}
</style> 