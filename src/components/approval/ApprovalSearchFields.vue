<template>
  <div class="approval-search-fields">
    <div class="row">
      <div class="field" v-for="(item, index) in row1" :key="index">
        <label :for="item.key">{{ item.label }}</label>
        <component 
          :is="item.type === 'select' ? 'select' : 'input'" 
          v-model="filters[item.key]" 
          :placeholder="item.placeholder" 
          :type="item.type === 'select' ? undefined : (item.type || 'text')"
        >
          <option v-if="item.type === 'select'" value="">전체</option>
          <option v-if="item.type === 'select'" v-for="option in item.options" :key="option" :value="option">
            {{ option }}
          </option>
        </component>
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
  { label: '결재 코드', key: 'approvalCode', placeholder: '예: S001250100001' },
  { label: '결재 제목', key: 'title', placeholder: '예: 출퇴근 근태 관리 시스템' },
  { label: '결재 내용', key: 'content', placeholder: '예: 월정액 1년 계약서' },
  { 
    label: '결재 상태', 
    key: 'status', 
    type: 'select',
    options: ['요청', '승인', '반려']
  },
  { label: '계약 코드', key: 'contractCode', placeholder: '예: A-2501-0001' }
]

const row2 = [
  { label: '결재 요청일 (시작)', key: 'requestDateStart', type: 'date' },
  { label: '결재 요청일 (종료)', key: 'requestDateEnd', type: 'date' },
  { label: '결재 일자 (시작)', key: 'approvalDateStart', type: 'date' },
  { label: '결재 일자 (종료)', key: 'approvalDateEnd', type: 'date' },
  { label: '요청 담당자', key: 'requester', placeholder: '예: 강원미' },
  { label: '결재 담당자', key: 'approver', placeholder: '예: 감리팀' },
  { label: '결재 코멘트', key: 'comment', placeholder: '예: 계약서 내용 미흡' }
]
</script>

<style scoped>
.approval-search-fields {
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

.row:last-child {
  grid-template-columns: repeat(7, 1fr);
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
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #007bff;
}
</style> 