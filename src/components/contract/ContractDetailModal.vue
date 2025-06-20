<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2 class="title">{{ contract.customerName }}–렌탈 계약</h2>
        <div class="button-group">
          <button class="btn">인쇄</button>
          <button class="btn" @click="showApprovalModal = true">결재 요청</button>
          <button class="btn primary">등록</button>
        </div>
      </div>

      <div class="tab-header">
        <span class="tab" :class="{ active: tab === 'info' }" @click="tab = 'info'">상세 조회</span>
        <span class="tab" :class="{ active: tab === 'file' }" @click="tab = 'file'">계약서</span>
        <span class="tab" :class="{ active: tab === 'product' }" @click="tab = 'product'">렌탈 상품 내역</span>
        <span class="tab" :class="{ active: tab === 'approval' }" @click="tab = 'approval'">결재 내역</span>
      </div>

      <div v-if="tab === 'info'" class="tab-content">
        <div class="row">
          <div class="field">
            <label>계약서 *</label>
            <div class="value">{{ contract.renameFile }}</div>
          </div>
          <div class="field">
            <label>계약 번호</label>
            <div class="value">{{ contract.code }}</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <label>고객 명</label>
            <div class="value">{{ contract.customerName }}</div>
          </div>
          <div class="field">
            <label>계약 상태</label>
            <div class="value">{{ contract.status || '알 수 없음' }}</div>
          </div>
        </div>
        <div class="row">
          <div class="field full">
            <label>총 렌탈 금액</label>
            <div class="value">{{ formatAmount(contract.amount) }} 원</div>
          </div>
        </div>
      </div>

      <div v-else-if="tab === 'file'" class="tab-content">
        <img :src="pdfThumbnailUrl" alt="계약서 미리보기" style="max-width: 500px" />
      </div>

      <div v-else-if="tab === 'product'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>시리얼 넘버</th>
              <th>수량</th>
              <th>렌탈 비용</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in contract.productList" :key="i">
              <td>{{ p.productName || '-' }}</td>
              <td>{{ p.serialNumber || '-' }}</td>
              <td>{{ p.quantity || '-' }}</td>
              <td>{{ formatAmount(p.rentalCost) }} 원</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="tab === 'approval'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>결재 제목</th>
              <th>결재 내용</th>
              <th>결재 상태</th>
              <th>요청 담당자</th>
              <th>승인 담당자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="contract.aprvTitle || contract.aprvContent || contract.aprvState">
              <td>{{ contract.aprvTitle || '-' }}</td>
              <td>{{ contract.aprvContent || '-' }}</td>
              <td>{{ contract.aprvState || '-' }}</td>
              <td>{{ contract.reqId || '-' }}</td>
              <td>{{ contract.aprvId || '-' }}</td>
            </tr>
            <tr v-else>
              <td colspan="5" style="text-align: center;">결재 정보가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ContractApprovalRequestModal
        v-if="showApprovalModal"
        :isOpen="showApprovalModal"
        :contractId="props.contractId"
        :contractCode="props.contractCode"
        :contractState="props.contractStatus"
        @close="showApprovalModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api/auth'
import ContractApprovalRequestModal from '@/views/contract/ContractApprovalRequestModal.vue'

const props = defineProps({
  contractId: Number,
  contractCode: String,
  contractStatus: String,
  isOpen: Boolean
})

console.log('props.contractStatus:', props.contractStatus)

const emit = defineEmits(['close'])

const contract = ref({
  productList: []
})
const tab = ref('info')
const showApprovalModal = ref(false)

const pdfThumbnailUrl = computed(() =>
  contract.value.renameFile
    ? `https://saladerp-bucket.s3.ap-northeast-2.amazonaws.com/contract/thumbs/${contract.value.renameFile.replace(/\.[^/.]+$/, '.png')}`
    : ''
)

function formatAmount(val) {
  return val?.toLocaleString() || '0'
}

onMounted(async () => {
  const res = await api.get(`/api/query/contract/${props.contractId}/info`)
  console.log('contract data:', res.data)
  contract.value = res.data
})
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
  max-height: 90vh;
  overflow-y: auto;
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

.tab-content {
  margin-top: 16px;
}

.row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.field {
  flex: 1;
}

.field.full {
  flex: 1 1 100%;
}

label {
  font-weight: bold;
  margin-bottom: 6px;
  display: block;
}

.value {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 6px;
  margin-top: 4px;
  cursor: default;
  user-select: none;
}

.desc {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
</style>
