<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">
            <span>상품 등록</span>
          </h2>
        </div>
        <button class="close-btn" @click="closeModal">
          ×
        </button>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <div v-if="isValid" class="confirm-content">
          <div class="confirm-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4A6741" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="confirm-message">
            <h3>상품 등록을 진행하시겠습니까?</h3>
          </div>
        </div>
        <div v-else class="error-content">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="error-message">
            <h3>필수 항목이 누락되었습니다</h3>
            <p>모든 필수 항목을 입력한 후 다시 시도해주세요.</p>
            <ul class="required-fields">
              <li>상품 코드</li>
              <li>상품명</li>
              <li>제조사</li>
              <li>카테고리</li>
              <li>모델명</li>
              <li>상품 이미지</li>
              <li>상품 원가</li>
              <li>렌탈료</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <div class="footer-info">
        </div>
        <div class="footer-actions">
          <button 
            v-if="isValid"
            class="btn-primary" 
            @click="emitConfirm"
          >
            등록
          </button>
          <button class="btn-secondary" @click="closeModal">
            {{ isValid ? '취소' : '닫기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({ 
    isOpen: Boolean, 
    isValid: Boolean 
  });
  const emit = defineEmits(['close', 'confirm'])

  const closeModal = () => emit('close')
  const emitConfirm = () => emit('confirm')
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 90vw;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #4A6741 0%, #8BA888 100%);
  color: white;

  .header-content {
    flex: 1;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .modal-info {
    font-size: 14px;
    opacity: 0.9;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

/* 모달 바디 */
.modal-body {
  flex: 1;
  padding: 32px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-content, .error-content {
  text-align: center;
  width: 100%;
}

.confirm-icon, .error-icon {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.confirm-message, .error-message {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #495057;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    color: #6c757d;
    margin: 0 0 16px 0;
    line-height: 1.5;
  }
}

.required-fields {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  text-align: left;
  display: inline-block;

  li {
    padding: 4px 0;
    font-size: 14px;
    color: #495057;
    position: relative;
    padding-left: 20px;

    &:before {
      content: "•";
      color: #dc3545;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
  }
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  .footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6c757d;

    .status-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .status-valid {
        color: #4A6741;
        font-weight: 500;
      }

      .status-invalid {
        color: #dc3545;
        font-weight: 500;
      }
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex: 1;
  }
}

/* 버튼 스타일 */
.btn-primary {
  padding: 10px 20px;
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
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-secondary {
  padding: 10px 20px;
  background: #8BA888;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7A9A77;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-container {
    width: 95vw;
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px 20px;

    .modal-title {
      font-size: 18px;
    }
  }

  .modal-body {
    padding: 24px 20px;
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
