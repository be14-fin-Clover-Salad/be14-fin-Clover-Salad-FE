<template>
  <div class="customer-detail">
    <!-- 기본 정보 -->
    <div class="section" v-if="customer">
      <div class="section-header">
        <h2 class="section-title">기본 정보 <span class="required">*</span></h2>
        <div class="section-actions">
          <button class="button primary" @click="handleUpdate">수정</button>
          <button class="button danger" @click="handleDelete">삭제</button>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-item">
          <label>고객명</label>
          <input type="text" v-model="customer.name" />
        </div>
        <div class="form-item">
          <label>생년월일</label>
          <input type="date" v-model="customer.birthdate" />
        </div>
        <div class="form-item">
          <label>연락처</label>
          <input type="text" v-model="customer.phone" />
        </div>
        <div class="form-item">
          <label>이메일</label>
          <input type="email" v-model="customer.email" />
        </div>
        <div class="form-item full-width">
          <label>주소</label>
          <input type="text" v-model="customer.address" />
        </div>
        <div class="form-item">
          <label>구분</label>
          <select v-model="customer.type">
            <option value="CUSTOMER">고객</option>
            <option value="PROSPECT">리드</option>
          </select>
        </div>
        <div class="form-item">
          <label>고객 등록일</label>
          <input
            type="date"
            :value="formattedRegisterAt"
            readonly
            class="readonly"
          />
        </div>
        <div class="form-item full-width">
          <label>비고</label>
          <textarea rows="3" v-model="customer.etc" />
        </div>
      </div>
    </div>
    <div v-else class="loading-message">고객 정보를 불러오는 중입니다...</div>

    <!-- 상담 내역 -->
    <div class="section">
      <h2 class="section-title">상담 내역 ↗</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>상담일</th>
            <th>상담 직원</th>
            <th>내용</th>
            <th>만족도</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="consults.length === 0">
            <td colspan="5">상담 내역이 없습니다.</td>
          </tr>
          <tr
            v-for="consult in consults"
            :key="consult.id"
            @click="openConsultModal(consult)"
            class="clickable-row"
          >
            <td>{{ consult.consultAt }}</td>
            <td>{{ consult.employeeName }}</td>
            <td>{{ consult.content }}</td>
            <td>{{ consult.feedbackScore }}</td>
            <td>{{ consult.etc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 상담 상세 모달 -->
    <ConsultDetailModal
      :show="showConsultDetailModal"
      :consult="selectedConsult"
      @close="closeConsultModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getMyCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerConsults,
} from "@/api/customer.js";
import ConsultDetailModal from "@/components/consult/ConsultDetailModal.vue";

const route = useRoute();
const router = useRouter();

const customer = ref(null);
const consults = ref([]);
const showConsultDetailModal = ref(false);
const selectedConsult = ref(null);

const customerId = Number(route.params.id);

const openConsultModal = (consult) => {
  selectedConsult.value = consult;
  showConsultDetailModal.value = true;
};

const closeConsultModal = () => {
  showConsultDetailModal.value = false;
  selectedConsult.value = null;
};

const formattedRegisterAt = computed(() => {
  if (!customer.value?.registerAt) return "";
  return customer.value.registerAt.split("T")[0];
});

onMounted(async () => {
  const state = history.state;
  if (state && state.customerData) {
    console.log("History state에서 고객 데이터 로드:", state.customerData);
    customer.value = state.customerData;
  } else {
    console.log("API를 통해 고객 데이터 로드:", customerId);
    customer.value = await getMyCustomerById(customerId);
  }

  // 계약 및 상담 내역 조회
  if (customer.value) {
    try {
      consults.value = await getCustomerConsults(customer.value.id);
    } catch (error) {
      console.error("상담 내역 조회 중 에러 발생:", error);
    }
  }
});

const handleUpdate = async () => {
  if (!customer.value) return;
  try {
    await updateCustomer(customer.value.id, customer.value);
    alert("고객 정보가 수정되었습니다.");
  } catch (error) {
    alert("고객 정보 수정에 실패했습니다.");
  }
};

const handleDelete = async () => {
  if (!customer.value) return;
  if (confirm("정말로 이 고객 정보를 삭제하시겠습니까?")) {
    try {
      await deleteCustomer(customer.value.id);
      alert("고객 정보가 삭제되었습니다.");
      router.push("/customer");
    } catch (error) {
      alert("고객 정보 삭제에 실패했습니다.");
    }
  }
};
</script>

<style scoped>
.customer-detail {
  padding: 24px;
  font-size: 14px;
  color: #222;
}

/* 공통 섹션 박스 */
.section {
  background-color: #fff;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.03);
}

/* 섹션 제목 및 버튼 영역 */
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

/* 버튼들 */
.section-actions {
  display: flex;
  gap: 8px;
}

.section-actions .button {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  border: none;
  color: #fff;
  user-select: none;
  outline: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.section-actions .button.primary {
  background-color: #a6ce39;
}

.section-actions .button.primary:hover {
  background-color: #94b933;
}

.section-actions .button.danger {
  background-color: #e53935;
}

.section-actions .button.danger:hover {
  background-color: #c62828;
  color: #fbe9e7;
}

/* 입력 영역 그리드 */
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

.form-item input[readonly] {
  background-color: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.full-width {
  grid-column: span 4;
}

/* 테이블 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 16px;
}

.data-table th {
  background-color: #f0f7e4;
  font-weight: 600;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  color: #222;
}

.data-table td {
  border-bottom: 1px solid #eee;
  padding: 10px;
  text-align: center;
  color: #333;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f9f9f9;
}

.loading-message {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 16px;
}
</style>
