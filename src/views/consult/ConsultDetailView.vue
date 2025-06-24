<template>
  <div class="consult-detail-view">
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">상담 상세</h2>
          </div>
          <div class="form-grid">
            <div class="form-item">
              <label>고객명</label>
              <input
                type="text"
                v-model="form.customerName"
                readonly
                class="readonly"
              />
            </div>
            <div class="form-item">
              <label>생년월일</label>
              <input
                type="date"
                v-model="form.customerBirthdate"
                readonly
                class="readonly"
              />
            </div>
            <div class="form-item">
              <label>연락처</label>
              <input
                type="text"
                v-model="form.customerPhone"
                readonly
                class="readonly"
              />
            </div>
            <div class="form-item">
              <label>이메일</label>
              <input type="email" v-model="form.customerEmail" />
            </div>
            <div class="form-item full-width">
              <label>주소</label>
              <input type="text" v-model="form.customerAddress" />
            </div>
            <div class="form-item">
              <label>구분</label>
              <select v-model="form.customerType" disabled class="readonly">
                <option value="CUSTOMER">고객</option>
                <option value="PROSPECT">리드</option>
              </select>
            </div>
            <div class="form-item">
              <label>고객 등록일</label>
              <input
                type="date"
                v-model="form.customerRegisterAt"
                readonly
                class="readonly"
              />
            </div>
            <div class="form-item full-width">
              <label>비고</label>
              <textarea rows="3" v-model="form.customerEtc" />
            </div>
          </div>
        </div>
        <div class="section">
          <h2 class="section-title">상담 내용</h2>
          <div class="form-group">
            <textarea
              id="content"
              v-model="form.content"
              rows="6"
              placeholder="상담 내용을 입력하세요"
              required
            ></textarea>
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
            {{ isSubmitting ? "수정 중..." : "수정" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getConsultById } from "@/api/consult.js";
import { getMyCustomerById } from "@/api/customer.js";
import { useAuthStore } from "@/stores/auth";
import { updateConsult } from "@/api/consult.js";
// import { getConsultDetail, updateConsult } from "@/api/consult.js";
// 실제 API 함수로 교체 필요

const router = useRouter();
const route = useRoute();
const isSubmitting = ref(false);
const errorMessage = ref("");
const authStore = useAuthStore();

const form = reactive({
  customerName: "",
  customerBirthdate: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerType: "PROSPECT",
  customerRegisterAt: "",
  customerEtc: "",
  content: "",
  customerId: null,
});

onMounted(async () => {
  const consultId = route.params.id;
  const isAdmin = authStore.userInfo?.levelLabel === "관리자";
  try {
    const { data: consult } = await getConsultById(consultId, isAdmin);
    Object.assign(form, {
      content: consult.content || "",
      customerName: consult.customerName || "",
      customerId: consult.customerId || null,
      customerBirthdate: consult.customerBirthdate || "",
      customerPhone: consult.customerPhone || "",
      customerEmail: consult.customerEmail || "",
      customerAddress: consult.customerAddress || "",
      customerType: consult.customerType || "PROSPECT",
      customerRegisterAt: consult.customerRegisterAt || "",
      customerEtc: consult.etc || "",
    });
    // 고객 상세 정보 추가 조회
    if (consult.customerId) {
      try {
        const customer = await getMyCustomerById(consult.customerId);
        Object.assign(form, {
          customerBirthdate: customer.birthdate || "",
          customerPhone: customer.phone || "",
          customerEmail: customer.email || "",
          customerAddress: customer.address || "",
          customerType: customer.type || "PROSPECT",
          customerRegisterAt: customer.registerAt || "",
          customerEtc: customer.etc || "",
        });
      } catch (e) {
        // 고객 정보 조회 실패 시 무시
      }
    }
  } catch (e) {
    errorMessage.value = "상담 상세 정보를 불러오지 못했습니다.";
  }
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    const consultId = route.params.id;
    const isAdmin = authStore.userInfo?.levelLabel === "관리자";
    await updateConsult(consultId, form, isAdmin);
    alert("상담 정보가 저장되었습니다.");
    router.push("/consult");
  } catch (e) {
    errorMessage.value = "저장 중 오류가 발생했습니다.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.consult-detail-view {
  padding: 24px;
}
.form-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #eee;
}
.section {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.03);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.required {
  color: #d32f2f;
  margin-left: 6px;
  font-size: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;
}
.form-item {
  display: flex;
  flex-direction: column;
}
.form-item label {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
  color: #444;
}
.form-item input,
.form-item select,
.form-item textarea {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}
.form-item input[readonly],
.form-item select.readonly {
  background-color: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}
.full-width {
  grid-column: span 4;
}
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
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
