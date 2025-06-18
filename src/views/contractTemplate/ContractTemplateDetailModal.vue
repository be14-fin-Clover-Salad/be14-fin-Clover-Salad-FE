<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 class="modal-title">양식 상세</h2>
      <div class="detail-box">
        <p><strong>양식명:</strong> {{ template.name }}</p>
        <p><strong>버전:</strong> {{ template.version }}</p>
        <p><strong>등록일:</strong> {{ template.createdAt }}</p>
        <p><strong>비고:</strong> {{ template.note || '-' }}</p>
      </div>
      <button class="submit-button" @click="emitClose">닫기</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean, template: Object })
const emit = defineEmits(['close'])
const emitClose = () => emit('close')
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; border-radius: 10px; padding: 40px; width: 400px; }
.detail-box { margin-bottom: 20px; }
.modal-title { margin-bottom: 20px; font-size: 18px; font-weight: bold; }
.submit-button {
  background-color: #4791ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-button:hover {
  background-color: #317ae0;
}
</style>