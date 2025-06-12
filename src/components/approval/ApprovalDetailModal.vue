<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="title">결재 상세 정보</h2>
        <button class="close-btn" @click="emit('close')">
          <span>×</span>
        </button>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>결재 코드:</label>
          <div class="input">{{ approval.code }}</div>
        </div>

        <div class="field status-field">
          <label>결재 상태:</label>
          <span class="status-badge" :class="getStatusClass(approval.state)">
            {{ approval.state }}
          </span>
        </div>

        <div class="field">
          <label>계약 코드:</label>
          <div class="input">{{ approval.contractCode }}</div>
        </div>

        <div class="field">
          <!-- 빈 공간 -->
        </div>

        <div class="field">
          <label>결재 요청 일시:</label>
          <div class="input">{{ approval.reqDate }}</div>
        </div>

        <div class="field">
          <label>결재 요청 담당자:</label>
          <div class="input">{{ approval.reqName }}</div>
        </div>

        <div class="field">
          <label>결재 승인 일시:</label>
          <div class="input">{{ approval.aprvDate || '-' }}</div>
        </div>

        <div class="field">
          <label>결재 승인 담당자:</label>
          <div class="input">{{ approval.aprvName }}</div>
        </div>

        <div class="field full">
          <label>결재 제목:</label>
          <div class="input">{{ approval.title }}</div>
        </div>

        <div class="field full">
          <label>결재 내용:</label>
          <div class="textarea-field">
            <textarea 
              :value="approval.content" 
              readonly 
              rows="8"
              class="content-textarea"
            ></textarea>
          </div>
        </div>

        <div class="field full">
          <label>결재 코멘트:</label>
          <div class="textarea-field">
            <textarea 
              :value="approval.comment || ''" 
              readonly 
              rows="6"
              class="comment-textarea"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  approval: Object
})

const emit = defineEmits(['close'])

// 상태에 따른 CSS 클래스 반환
const getStatusClass = (status) => {
  switch (status) {
    case '승인':
      return 'status-approved'
    case '요청':
      return 'status-pending'
    case '반려':
      return 'status-rejected'
    default:
      return ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Noto Sans KR', sans-serif;
}

.modal-box {
  width: 900px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 32px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: span 2;
}

.field.status-field {
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 12px;
  margin-right: 20px;
}

.field label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
}

.input {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  min-height: 20px;
}

.textarea-field {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
}

.content-textarea,
.comment-textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px;
  font-size: 14px;
  color: #333;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}

.content-textarea {
  min-height: 200px;
}

.comment-textarea {
  min-height: 150px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 60px;
}

.status-badge.status-approved {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.status-badge.status-pending {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.status-badge.status-rejected {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

@media (max-width: 1000px) {
  .modal-box {
    width: 95%;
    margin: 0 auto;
    padding: 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .field.full {
    grid-column: span 1;
  }
}
</style> 