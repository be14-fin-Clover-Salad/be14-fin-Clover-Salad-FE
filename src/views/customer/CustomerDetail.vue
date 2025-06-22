<template>
  <div class="customer-detail">
    <!-- 기본 정보 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">기본 정보 <span class="required">*</span></h2>
        <div class="section-actions">
          <button class="button primary">수정</button>
          <button class="button danger">삭제</button>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-item">
          <label>고객명</label>
          <input type="text" v-model="form.name" />
        </div>
        <div class="form-item">
          <label>생년월일</label>
          <input type="date" v-model="form.birth" />
        </div>
        <div class="form-item">
          <label>연락처</label>
          <input type="text" v-model="form.phone" />
        </div>
        <div class="form-item">
          <label>이메일</label>
          <input type="email" v-model="form.email" />
        </div>
        <div class="form-item full-width">
          <label>주소</label>
          <input type="text" v-model="form.address" />
        </div>
        <div class="form-item">
          <label>구분</label>
          <select v-model="form.type">
            <option>고객</option>
            <option>리드</option>
          </select>
        </div>
        <div class="form-item">
          <label>고객 등록일</label>
          <input
            type="date"
            v-model="form.createdAt"
            readonly
            class="readonly"
          />
        </div>
        <div class="form-item full-width">
          <label>비고</label>
          <textarea rows="3" v-model="form.note" />
        </div>
      </div>
    </div>

    <!-- 계약 내역 -->
    <div class="section">
      <h2 class="section-title">계약 내역 ↗</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>계약 상태</th>
            <th>계약 시작일</th>
            <th>계약 만료일</th>
            <th>계약 금액</th>
            <th>은행명</th>
            <th>계좌 번호</th>
            <th>납부일</th>
            <th>예금주</th>
            <th>본점/지점</th>
            <th>담당 직원</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(contract, idx) in contracts" :key="idx">
            <td>{{ contract.status }}</td>
            <td>{{ contract.startDate }}</td>
            <td>{{ contract.endDate }}</td>
            <td>{{ contract.amount }}</td>
            <td>{{ contract.bank }}</td>
            <td>{{ contract.account }}</td>
            <td>{{ contract.payDay }}</td>
            <td>{{ contract.holder }}</td>
            <td>{{ contract.branch }}</td>
            <td>{{ contract.staff }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 상담 내역 -->
    <div class="section">
      <h2 class="section-title">상담 내역 ↗</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>일자</th>
            <th>상담 직원</th>
            <th>내용</th>
            <th>만족도</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(consult, idx) in consults" :key="idx">
            <td>{{ consult.date }}</td>
            <td>{{ consult.staff }}</td>
            <td>{{ consult.content }}</td>
            <td>{{ consult.score }}</td>
            <td>{{ consult.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  name: "강수지",
  birth: "1993-10-06",
  phone: "010-3867-9572",
  email: "ksd5007@gmail.com",
  address: "서울시 송파구 보성로87 상미빌딩 3층 강영회",
  type: "고객",
  createdAt: "2024-12-30",
  note: "*직원\n*계약은 주의 필요함",
});

const contracts = [
  {
    status: "계약 중",
    startDate: "2024.12.30",
    endDate: "2025.6.30",
    amount: "17,424,000",
    bank: "신한",
    account: "110-0000-000000",
    payDay: "25일",
    holder: "강수지",
    branch: "본점",
    staff: "김광승",
  },
];

const consults = [
  {
    date: "2025.05.01",
    staff: "강백현 대리",
    content: "보증기 필터 교체 관련",
    score: "5.0",
    note: "-",
  },
  {
    date: "2025.05.03",
    staff: "김영경 과장",
    content: "에어컨 연결 문의",
    score: "4.8",
    note: "-",
  },
];
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
</style>
