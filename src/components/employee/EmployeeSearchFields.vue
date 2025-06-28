<template>
  <div class="employee-search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="item.key">
        <label :for="item.key">{{ item.label }}</label>
        <select v-if="item.type === 'select'" v-model="filters[item.key]" :id="item.key">
          <option value="">전체</option>
          <option v-for="option in item.options" :key="option" :value="option">{{ option }}</option>
        </select>
        <input v-else v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
    <div class="row" v-if="expanded">
      <div class="field" v-for="(item, index) in row2" :key="item.key">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
    <div class="row" v-if="expanded">
      <div class="field" v-for="(item, index) in row3" :key="item.key">
        <label :for="item.key">{{ item.label }}</label>
        <input v-model="filters[item.key]" :placeholder="item.placeholder" :type="item.type || 'text'" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ 
  filters: Object,
  expanded: { type: Boolean, default: true }
})

const row1 = [
  { label: '사번', key: 'code', placeholder: '예: 202401001' },
  { label: '이름', key: 'name', placeholder: '예: 홍길동' },
  { label: '직급', key: 'level', type: 'select', options: ['사원', '주임', '대리', '과장', '팀원'] },
  { label: '부서명', key: 'departmentName', placeholder: '예: 영업1팀' }
]

const row2 = [
  { label: '연락처', key: 'phone', placeholder: '예: 010-1234-5678' },
  { label: '이메일', key: 'email', placeholder: '예: hong@email.com' },
  { label: '입사일 (시작)', key: 'hireDateFrom', type: 'date' },
  { label: '입사일 (종료)', key: 'hireDateTo', type: 'date' }
]

const row3 = [
  { label: '근무지', key: 'workPlace', placeholder: '예: 서울본사' }
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
  gap: 12px;
  margin-bottom: 10px;
}
.row:nth-child(1) {
  grid-template-columns: repeat(4, 1fr);
}
.row:nth-child(2) {
  grid-template-columns: repeat(4, 1fr);
}
.row:nth-child(3) {
  grid-template-columns: repeat(1, 1fr);
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
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}
</style> 