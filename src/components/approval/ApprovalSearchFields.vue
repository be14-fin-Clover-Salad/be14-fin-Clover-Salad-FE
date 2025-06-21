<template>
  <div class="approval-search-fields">
    <div class="row">
      <div class="field">
        <label>결재 코드</label>
        <input v-model="filters.approvalCode" placeholder="예: S001250100001" type="text" />
      </div>
      <div class="field">
        <label>결재 제목</label>
        <input v-model="filters.title" placeholder="예: 출퇴근 근태 관리 시스템" type="text" />
      </div>
      <div class="field">
        <label>결재 내용</label>
        <input v-model="filters.content" placeholder="예: 월정액 1년 계약서" type="text" />
      </div>
      <div class="field">
        <label>결재 상태</label>
        <select v-model="filters.status">
          <option value="">전체</option>
          <option value="요청">요청</option>
          <option value="승인">승인</option>
          <option value="반려">반려</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>결재 요청일 (시작)</label>
        <input v-model="filters.requestDateStart" type="date" />
      </div>
      <div class="field">
        <label>결재 요청일 (종료)</label>
        <input v-model="filters.requestDateEnd" type="date" />
      </div>
      <div class="field">
        <label>결재 일자 (시작)</label>
        <input v-model="filters.approvalDateStart" type="date" />
      </div>
      <div class="field">
        <label>결재 일자 (종료)</label>
        <input v-model="filters.approvalDateEnd" type="date" />
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>요청 담당자</label>
        <input v-model="filters.requester" placeholder="예: 강원미" type="text" />
      </div>
      <div class="field">
        <label>결재 담당자</label>
        <input v-model="filters.approver" placeholder="예: 감리팀" type="text" />
      </div>
      <div class="field">
        <label>결재 코멘트</label>
        <input v-model="filters.comment" placeholder="예: 계약서 내용 미흡" type="text" />
      </div>
      <div class="field">
        <label>계약 코드</label>
        <input v-model="filters.contractCode" placeholder="예: A-2501-0001" type="text" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ filters: Object })
</script>

<style scoped>
.approval-search-fields {
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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