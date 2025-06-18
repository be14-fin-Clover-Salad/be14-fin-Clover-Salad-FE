<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <p class="upload-instruction">양식 업로드가 완료되었습니다!</p>
      <div class="button-wrap">
        <button class="confirm-button" @click="$emit('confirm')">상세보기</button>
        <button class="cancel-button" @click="emitClose">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'confirm'])
const emitClose = () => emit('close')
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; border-radius: 10px; padding: 40px; width: 360px; text-align: center; }
.upload-instruction { font-weight: bold; font-size: 16px; margin-bottom: 20px; }
.button-wrap { display: flex; justify-content: center; gap: 12px; }
.confirm-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}
.confirm-button { background-color: #4791ff; color: white; }
.confirm-button:hover { background-color: #317ae0; }
.cancel-button { background-color: #eee; color: #333; }
.cancel-button:hover { background-color: #ddd; }
</style>
