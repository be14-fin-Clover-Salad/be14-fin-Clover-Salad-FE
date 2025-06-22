<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>상담 상세 정보</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="consult" class="consult-detail">
          <div class="detail-row">
            <div class="detail-label">상담 ID</div>
            <div class="detail-value">{{ consult.id }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">상담일시</div>
            <div class="detail-value">{{ formatDate(consult.consultAt) }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">상담 내용</div>
            <div class="detail-value content-text">
              {{ consult.content || "-" }}
            </div>
          </div>

          <div class.detail-row>
            <div class="detail-label">피드백 점수</div>
            <div class="detail-value">
              <span v-if="consult.feedbackScore" class="feedback-score">
                {{ consult.feedbackScore.toFixed(1) }} / 5.0
              </span>
              <span v-else class="no-score">평가 없음</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">비고</div>
            <div class="detail-value">{{ consult.etc || "-" }}</div>
          </div>
        </div>
        <div v-else class="loading">
          <div class="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  consult: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR");
  } catch (error) {
    return dateString;
  }
};
</script>

<style scoped>
/* 여기에 기존 모달 스타일을 그대로 유지합니다. */
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
}
.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  color: #333;
}
.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}
.consult-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.detail-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}
.detail-label {
  width: 120px;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}
.detail-value {
  flex: 1;
  color: #666;
}
.content-text {
  white-space: pre-wrap;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}
.feedback-score {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.no-score {
  color: #999;
  font-style: italic;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
}
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}
.btn-secondary:hover {
  background-color: #e8e8e8;
}
.loading {
  text-align: center;
  padding: 40px 0;
}
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #a6ce39;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
