<template>
  <div class="customer-search-fields">
    <!-- 첫 번째 행: 고객명, 연락처, 고객 유형, 등록일(시작), 등록일(끝) -->
    <div class="row">
      <div class="field">
        <label>고객명</label>
        <input v-model="filters.name" placeholder="고객명을 입력하세요" />
      </div>
      <div class="field">
        <label>연락처</label>
        <input v-model="filters.phone" placeholder="연락처를 입력하세요" />
      </div>
      <div class="field">
        <label>고객 유형</label>
        <select v-model="filters.type">
          <option value="">전체</option>
          <option value="CUSTOMER">고객</option>
          <option value="PROSPECT">리드</option>
        </select>
      </div>
      <div class="field">
        <label>고객 등록일(시작)</label>
        <input type="date" v-model="filters.registerAtFrom" />
      </div>
      <div class="field">
        <label>고객 등록일(끝)</label>
        <input type="date" v-model="filters.registerAtTo" />
      </div>
    </div>
    <!-- 두 번째 행: 생년월일(시작), 생년월일(끝) -->
    <div class="row" v-if="expanded">
      <div class="field">
        <label>생년월일(시작)</label>
        <input type="date" v-model="filters.birthdateFrom" />
      </div>
      <div class="field">
        <label>생년월일(끝)</label>
        <input type="date" v-model="filters.birthdateTo" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ filters: Object, expanded: Boolean });
</script>

<style scoped>
.customer-search-fields {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-width: 0;
  overflow: hidden;
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

.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
  white-space: nowrap;
}

input,
select {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
input:focus,
select:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.1);
}
@media (max-width: 1200px) {
  .row {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .customer-search-fields {
    padding: 12px 16px;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .field label {
    font-size: 12px;
  }
  input,
  select {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
