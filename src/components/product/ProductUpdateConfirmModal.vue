<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">상품 수정 확인</h3>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <p>상품 정보를 수정하시겠습니까?</p>
        <div class="warning-text">
          <p>⚠️ 수정된 내용이 저장됩니다.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">취소</button>
        <button class="btn-primary" @click="confirmUpdate">수정</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'confirm']);

function closeModal() {
  emit('close');
}

function confirmUpdate() {
  emit('confirm');
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }
  }
}

.modal-body {
  padding: 24px;
  
  p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #495057;
    line-height: 1.5;
  }

  .warning-text {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 12px;
    
    p {
      margin: 0;
      color: #856404;
      font-size: 13px;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.btn-primary {
  padding: 8px 16px;
  background: #4A6741;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #3D5635;
  }
}

.btn-secondary {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #5a6268;
  }
}
</style> 