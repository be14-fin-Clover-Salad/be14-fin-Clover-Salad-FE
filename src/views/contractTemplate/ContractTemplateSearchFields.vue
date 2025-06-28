<template>
  <div class="template-search-fields">
    <div class="row">
      <!-- 양식명 -->
      <div class="field">
        <label>양식명</label>
        <input v-model="filters.name" type="text" placeholder="예: 표준양식" />
      </div>
      <!-- 버전 -->
      <div class="field">
        <label>버전</label>
        <input v-model="filters.version" type="text" placeholder="예: v1.0" />
      </div>
      <!-- 등록일 범위 -->
      <div class="field range-field">
        <label>등록일</label>
        <div class="range-inputs">
          <input v-model="filters.createdAtStart" type="date" />
          <span class="tilde">~</span>
          <input v-model="filters.createdAtEnd" type="date" />
        </div>
      </div>
      <!-- 비고 -->
      <div class="field">
        <label>비고</label>
        <input v-model="filters.description" type="text" placeholder="예: 메모 내용" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ filters: Object })
</script>

<style scoped>
.template-search-fields {
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
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

/* 등록일 범위 필드 너비를 두 칸으로 확장 */
.range-field {
  grid-column: span 2;
}

/* 범위 입력 스타일 */
.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tilde {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

/* 반응형 */
@media (max-width: 1400px) {
  .row { grid-template-columns: repeat(6, 1fr); }
}
@media (max-width: 1200px) {
  .row { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 992px) {
  .row { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 768px) {
  .template-search-fields { padding: 12px 16px; }
  .row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .field label { font-size: 12px; }
  .field input, .field select { font-size: 12px; padding: 3px 6px; }
}
@media (max-width: 576px) {
  .row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .template-search-fields { padding: 8px 12px; }
  .row { grid-template-columns: 1fr; gap: 6px; }
  .field label { font-size: 11px; }
  .field input, .field select { font-size: 11px; padding: 2px 4px; }
  .range-inputs { flex-direction: column; gap: 2px; }
  .tilde { display: none; }
}
</style>