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

      <!-- 상세 조회 -->
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
            <label>담당 영업사원</label>
            <div class="value">{{ contract.employeeName || '알 수 없음' }}</div>
          </div>
        </div>
        <div class="row">
          <div class="field full">
            <label>총 렌탈 금액</label>
            <div class="value">{{ formatAmount(contract.amount) }} 원</div>
          </div>
        </div>
      </div>

      <!-- 계약서 탭 : 좌측 정보 / 우측 썸네일&다운로드 -->
      <div v-else-if="tab === 'file'" class="tab-content file-detail-row">
        <!-- 좌측 정보 -->
        <div class="file-info-panel">
          <div>
            <label>계약서 *</label>
            <div class="value">{{ contract.renameFile || '-' }}</div>
            <small>계약 관리 등록시 해당 계약의 계약서 PDF가 존재해야 합니다</small>
          </div>
          <div>
            <label>고객 명 *</label>
            <div class="value">{{ contract.customerName || '-' }}</div>
          </div>
          <div>
            <label>고객 주소 *</label>
            <div class="value">{{ contract.customerAddress || '-' }}</div>
          </div>
          <div>
            <label>고객 연락처 *</label>
            <div class="value">{{ contract.customerPhone || '-' }}</div>
          </div>
        </div>
        <!-- 우측 썸네일/다운로드 -->
        <div class="file-thumbnail-panel">
          <div v-if="thumbnailSrc">
            <img :src="thumbnailSrc" alt="계약서 미리보기" class="contract-thumbnail" @click="showPreview = true"
              style="cursor: pointer;" />
            <div style="margin-top: 16px;">
              <a :href="fileSrc" target="_blank" rel="noopener" download class="download-link">
                PDF 다운로드
              </a>
            </div>
          </div>
          <p v-else class="desc">미리보기 이미지를 불러올 수 없습니다.</p>
        </div>
        <!-- 클릭 시 전체 확대 미리보기 팝업 -->
        <div v-if="showPreview" class="img-modal" @click.self="showPreview = false">
          <img :src="thumbnailSrc" alt="계약서 전체 미리보기" class="img-modal-img" />
          <a :href="fileSrc" target="_blank" rel="noopener" download class="download-link" style="margin-top:16px;">
            PDF 다운로드
          </a>
        </div>
      </div>

      <!-- 렌탈 상품 내역 -->
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

      <!-- 결재 내역 -->
      <div v-else-if="tab === 'approval'" class="tab-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>결재 제목</th>
              <th>결재 내용</th>
              <th>결재 상태</th>
              <th>요청 담당자</th>
              <th>승인 담당자</th>
              <th>요청일시</th>
              <th>승인일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in contract.approvalList" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ item.content }}</td>
              <td>{{ item.state }}</td>
              <td>{{ item.reqName || '-' }}</td>
              <td>{{ item.aprvName || '-' }}</td>
              <td>{{ formatDateTime(item.reqDate) || '-' }}</td>
              <td>{{ formatDateTime(item.aprvDate) || '-' }}</td>
            </tr>
            <tr v-if="!contract.approvalList || contract.approvalList.length === 0">
              <td colspan="7" style="text-align: center;">결재 정보가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- 결재 요청 모달 -->
      <ContractApprovalRequestModal v-if="showApprovalModal" :isOpen="showApprovalModal" :contractId="props.contractId"
        :contractCode="props.contractCode" :contractState="contractState" :approvalState="currentApprovalState" @close="showApprovalModal = false" />
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
const emit = defineEmits(['close'])

const contract = ref({ productList: [] })
const tab = ref('info')
const showApprovalModal = ref(false)
const showPreview = ref(false)

// 현재 결재 상태 계산 (가장 최근 결재의 상태)
const currentApprovalState = computed(() => {
  if (!contract.value.approvalList || contract.value.approvalList.length === 0) {
    return '결재전'  // 결재 내역이 없으면 '결재전' 반환
  }
  // 가장 최근 결재의 상태 반환
  return contract.value.approvalList[contract.value.approvalList.length - 1]?.state || '결재전'
})

// 계약 상태 추론 (API 응답에서 상태를 찾거나 기본값 사용)
const contractState = computed(() => {
  // API 응답에서 가능한 상태 필드들을 확인
  const possibleStatusFields = ['status', 'contractStatus', 'state', 'contractState']
  
  for (const field of possibleStatusFields) {
    if (contract.value[field]) {
      return contract.value[field]
    }
  }
  
  // 상태 필드가 없으면 결재 내역을 기반으로 추론
  if (!contract.value.approvalList || contract.value.approvalList.length === 0) {
    return '결재전'
  }
  
  const latestApproval = contract.value.approvalList[contract.value.approvalList.length - 1]
  if (latestApproval?.state === '반려') {
    return '반려'
  } else if (latestApproval?.state === '승인') {
    return '계약중'
  } else if (latestApproval?.state === '요청') {
    return '결재중'
  }
  
  return '결재전'
})

// S3 BASE URL
const S3_BASE = 'https://saladerp-bucket.s3.ap-northeast-2.amazonaws.com/'

// 썸네일/파일 URL 조합 (키만 있으면 S3 BASE를 붙임)
const thumbnailSrc = computed(() => {
  const path = contract.value.thumbnailUrl
  return path ? (path.startsWith('http') ? path : S3_BASE + path) : ''
})
const fileSrc = computed(() => {
  const path = contract.value.fileUrl
  return path ? (path.startsWith('http') ? path : S3_BASE + path) : ''
})

function formatAmount(val) {
  return val?.toLocaleString() || '0'
}

function formatDateTime(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleString()
}

onMounted(async () => {
  const res = await api.get(`/api/query/contract/${props.contractId}/info`)
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

.file-detail-row {
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: flex-start;
}

.file-info-panel {
  flex: 1 1 300px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.file-info-panel label {
  font-weight: bold;
  margin-bottom: 4px;
}

.file-info-panel .value {
  background: #f5f5f5;
  padding: 7px 8px;
  border-radius: 6px;
  margin-top: 3px;
  font-size: 15px;
}

.file-info-panel small {
  color: #888;
  font-size: 12px;
  margin-top: 2px;
}

.file-thumbnail-panel {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contract-thumbnail {
  width: 350px;
  height: auto;
  border: 3px solid #b71c1c;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
  cursor: pointer;
}

.contract-thumbnail:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
}

.download-link {
  color: #fff;
  background: #b71c1c;
  padding: 8px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
}

.download-link:hover {
  background: #c62828;
}

/* 팝업 이미지 모달 */
.img-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.56);
  z-index: 1200;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.img-modal-img {
  width: 600px;
  max-width: 90vw;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
  border: 4px solid #b71c1c;
}

@media (max-width: 900px) {
  .file-detail-row {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .file-thumbnail-panel {
    margin-top: 18px;
  }

  .img-modal-img {
    width: 96vw;
  }
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

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  display: inline-block;
  min-width: 50px;
}

.status-badge-pending {
  background-color: #ffd700;
  color: #333;
}

.status-badge-approved {
  background-color: #4caf50;
  color: #fff;
}

.status-badge-rejected {
  background-color: #f44336;
  color: #fff;
}

.status-badge-default {
  background-color: #9e9e9e;
  color: #fff;
}
</style>
