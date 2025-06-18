<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 v-if="isValid" class="modal-title">상품을 등록하시겠습니까?</h2>
      <h2 v-else class="modal-title">필수 항목을 채워주시기 바랍니다.</h2>
      <div class="upload-box">
        <label class="upload-label">
          <span v-if="isValid" class="upload-button" @click="emitClose">취소</span>
          <span v-if="isValid" class="upload-button" @click="emitConfirm">확인</span>
          <span v-else class="upload-button" @click="emitClose">닫기</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({ isOpen: Boolean, isValid: Boolean });
  const emit = defineEmits(['close', 'confirm'])

  const emitClose = () => emit('close')
  const emitConfirm = () => emit('confirm')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 40px;
  width: 400px;
}

.modal-title {
  text-align: center;
}

.upload-box {
  padding: 20px 20px;
  text-align: center;
  border-radius: 8px;
}

.upload-label {
  display: inline-block;
  margin-top: 16px;
}

.upload-button {
  border: 1px solid #4791ff;
  padding: 6px 14px;
  border-radius: 4px;
  color: #4791ff;
  cursor: pointer;
  transition: 0.2s;
}

.upload-button:hover {
  background-color: #e6f0ff;
}
</style>
