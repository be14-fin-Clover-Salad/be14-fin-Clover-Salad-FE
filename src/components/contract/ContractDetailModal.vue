<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="title">{{ contract.customerName }}님 관련 계약 정보</h2>
        <div class="button-group">
          <button class="btn">인쇄</button>
          <button class="btn">수정</button>
          <button class="btn primary">등록</button>
        </div>
      </div>

      <div class="tab-header">
        <span class="tab active">상세 조회</span>
        <span class="tab">계약서</span>
        <span class="tab">렌탈 상품 내역</span>
        <span class="tab">결제 내역</span>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>계약서 *</label>
          <div class="input">파일 이름이 들어가면 될거 같습니다</div>
          <p class="hint">계약 관리 등록시 해당 계약서 PDF가 존재해야 합니다</p>
        </div>

        <div class="field">
          <label>계약 번호</label>
          <div class="input">{{ contract.code }}</div>
        </div>

        <div class="field">
          <label>고객 명</label>
          <div class="input">{{ contract.customerName }}</div>
        </div>

        <div class="field">
          <label>계약 담당자 *</label>
          <div class="input">{{ contract.employeeName }}</div>
          <p class="hint small">Quantity of item obtained after manufacturing / repacking from given quantities of raw materials</p>
        </div>

        <div class="field full">
          <label>총 렌탈 금액</label>
          <div class="input">{{ contract.amount }} 원</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  contract: Object
})
const emit = defineEmits(['close'])
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
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 22px;
  font-weight: 700;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 14px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
}

.btn.primary {
  background: #000;
  color: #fff;
}

.tab-header {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.tab {
  font-size: 15px;
  padding: 6px 4px;
  cursor: pointer;
  color: #999;
}

.tab.active {
  color: #333;
  font-weight: bold;
  border-bottom: 2px solid #1a73e8;
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

.field label {
  font-weight: 500;
  margin-bottom: 6px;
}

.input {
  background: #f8f8f8;
  border: 1px solid #ddd;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.hint.small {
  font-size: 11px;
}
</style>
