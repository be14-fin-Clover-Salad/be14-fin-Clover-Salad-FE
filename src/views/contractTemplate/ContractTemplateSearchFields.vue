<!-- ContractTemplateSearchFields.vue -->
<template>
  <div class="template-search-fields">
    <div class="row">
      <div class="field">
        <label>양식명</label>
        <input v-model="filters.name" type="text" placeholder="예: 표준양식" />
      </div>
      <div class="field">
        <label>버전</label>
        <input v-model="filters.version" type="text" placeholder="예: v1.0" />
      </div>
      <div class="field">
        <label>등록일 (시작)</label>
        <input v-model="filters.createdAtStart" type="date" />
      </div>
      <div class="field">
        <label>등록일 (종료)</label>
        <input v-model="filters.createdAtEnd" type="date" />
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
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
