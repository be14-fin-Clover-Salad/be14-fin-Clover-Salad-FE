<template>
  <div class="consult-register-view">
    <div class="page-header">
      <h2>상담 등록</h2>
      <p class="page-description">새로운 상담 내역을 등록합니다.</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <h3>고객 정보</h3>
        <div class="section">
          <div class="form-group">
            <label for="customerName">고객명</label>
            <input
              id="customerName"
              v-model="form.customerName"
              type="text"
              placeholder="고객명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label for="customerBirthdate">생년월일</label>
            <input
              id="customerBirthdate"
              v-model="form.customerBirthdate"
              type="date"
            />
          </div>
          <div class="form-group">
            <label for="customerPhone">연락처</label>
            <input
              id="customerPhone"
              v-model="form.customerPhone"
              type="tel"
              placeholder="010-1234-5678"
            />
          </div>
        </div>

        <h3>상담 정보</h3>
        <div class="section">
          <div class="form-group">
            <label for="content">상담 내용</label>
            <textarea
              id="content"
              v-model="form.content"
              rows="6"
              placeholder="상담 내용을 입력하세요"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label for="etc">비고</label>
            <input
              id="etc"
              v-model="form.etc"
              type="text"
              placeholder="기타 특이사항을 입력하세요"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="handleCancel">
            취소
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? "등록 중..." : "등록" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { createConsult } from "@/api/consult.js";

const router = useRouter();

const form = reactive({
  customerName: "",
  customerBirthdate: "",
  customerPhone: "",
  content: "",
  etc: "",
});

const isSubmitting = ref(false);
const errorMessage = ref("");

const handleSubmit = async () => {
  if (!form.content) {
    errorMessage.value = "상담 내용은 필수 항목입니다.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    await createConsult(form);
    // 등록 성공 후 상담 목록 페이지로 이동
    router.push("/consult");
  } catch (error) {
    console.error("상담 등록 실패:", error);
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = `상담 등록에 실패했습니다: ${error.response.data.message}`;
    } else {
      errorMessage.value =
        "상담 등록 중 오류가 발생했습니다. 입력 내용을 확인해주세요.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  // 이전 페이지 (상담 목록)으로 이동
  router.push("/consult");
};
</script>

<style scoped>
.consult-register-view {
  padding: 24px;
}
.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}
.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}
.form-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #eee;
}
h3 {
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.section {
  margin-bottom: 24px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.1);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.submit-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.submit-btn {
  background-color: #86b649;
  color: white;
}
.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  border: 1px solid #ffcdd2;
  font-size: 14px;
}
</style>
