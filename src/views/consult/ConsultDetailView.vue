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
        <div class="section section-consult-content">
          <div class="consult-title-row">
            <h2 class="section-title">상담 내용</h2>
            <div class="consult-meta-group">
              <span class="consult-meta-pill">
                <b>상담자:</b>&nbsp;{{
                  form.employeeLevelLabel === "관리자" ||
                  form.employeeLevelLabel === "admin" ||
                  form.employeeLevelLabel === "Admin"
                    ? "관리자"
                    : form.employeeName +
                      (form.employeeLevelLabel
                        ? " " + form.employeeLevelLabel
                        : "")
                }}
              </span>
              <span class="consult-meta-pill">
                <b>상담 일시:</b>&nbsp;{{ formatDateTime(form.consultAt) }}
              </span>
            </div>
          </div>
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
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? "수정 중..." : "수정" }}
          </button>
          <button
            type="button"
            class="delete-btn"
            @click="handleDelete"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "삭제 중..." : "삭제" }}
          </button>
          <button type="button" class="cancel-btn" @click="handleCancel">
            취소
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getConsultById, updateConsult, deleteConsult } from "@/api/consult.js";
import { getMyCustomerById } from "@/api/customer.js";
import { useAuthStore } from "@/stores/auth";
// import { getConsultDetail, updateConsult } from "@/api/consult.js";
// 실제 API 함수로 교체 필요

const isAdmin = computed(() => {
  const label = authStore.userInfo?.levelLabel;
  return label === "관리자" || label === "admin" || label === "Admin";
});

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
  employeeName: "",
  employeeLevelLabel: "",
  consultAt: "",
});

onMounted(() => {
  watch(
    () => authStore.userInfo,
    async (userInfo) => {
      if (!userInfo) return;
      errorMessage.value = "";
      const consultId = route.params.id;
      // levelLabel이 '관리자', 'admin', 'Admin' 모두 허용
      const isAdmin = ["관리자", "admin", "Admin"].includes(
        userInfo.levelLabel
      );
      try {
        const { data: consult } = await getConsultById(consultId, isAdmin);
        if (!isAdmin && String(consult.employeeId) !== String(userInfo.id)) {
          errorMessage.value = "상담 내역에 접근할 권한이 없습니다.";
          setTimeout(() => router.back(), 1500);
          return;
        }

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
          employeeName: consult.employeeName || "",
          employeeLevelLabel: consult.employeeLevelLabel || "",
          consultAt: consult.consultAt || "",
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
    },
    { immediate: true }
  );
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

const handleDelete = async () => {
  if (!confirm("정말로 이 상담 내역을 삭제하시겠습니까?")) return;
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    const consultId = route.params.id;
    await deleteConsult(consultId);
    alert("상담 내역이 삭제되었습니다.");
    router.push("/consult");
  } catch (e) {
    errorMessage.value = "삭제 중 오류가 발생했습니다.";
  } finally {
    isSubmitting.value = false;
  }
};

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
  const ddd = weekNames[date.getDay()];
  return `${yyyy}-${MM}-${dd}(${ddd}) ${HH}:${mm}`;
}
</script>

<style scoped>
.consult-detail-view {
  padding: 24px;
}
.form-container {
  gap: 24px;
}
.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
.consult-employee-info {
  font-size: 15px;
  color: #666;
  font-weight: 500;
  margin-left: auto;
  display: flex;
  align-items: center;
}
.consult-meta-group {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: 12px;
}
.consult-meta-pill {
  background: #fafafa;
  border: 1.5px solid #ededed;
  border-radius: 20px;
  padding: 4px 16px;
  font-size: 17px;
  color: #222;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.consult-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-right: 12px;
}
.consult-meta-group {
  display: flex;
  gap: 8px;
  align-items: center;
}
.consult-meta-pill {
  background: #fafafa;
  border: 1.5px solid #ededed;
  border-radius: 20px;
  padding: 4px 16px;
  font-size: 16px;
  color: #222;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.delete-btn {
  background-color: #e57373;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.consult-detail-view .section {
  margin-bottom: 24px;
}
</style>
