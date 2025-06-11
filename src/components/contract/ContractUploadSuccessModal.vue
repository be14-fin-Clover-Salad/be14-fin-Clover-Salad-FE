<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <span class="check-icon">📖</span>
        <h2 class="title">등록 완료</h2>
        <p class="message">계약서 업로드가 완료되었습니다.<br />상세 정보를 확인하시겠습니까?</p>
      </div>
      <div class="modal-footer">
        <button class="primary-btn" @click="emit('confirm')">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['confirm', 'close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  font-family: 'Noto Sans KR', sans-serif;
}

.modal-header {
  text-align: center;
}

.check-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.message {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  margin-top: 24px;
  text-align: center;
}

.primary-btn {
  background-color: #556cd6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.primary-btn:hover {
  background-color: #3e4ab3;
}
</style>
