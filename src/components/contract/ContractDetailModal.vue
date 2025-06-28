<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="title">{{ contract.customerName }}–렌탈 계약</h2>
        <div class="button-group">
          <!-- 인쇄 버튼은 사용하지 않음 -->
          <!-- <button class="btn">인쇄</button> -->
          <!-- 결재 요청 버튼: 결재전 또는 반려 상태일 때만 활성화 -->
          <button
            class="btn primary"
            @click="onRequestApproval"
            :disabled="!canRequestApproval"
          >
            결재 요청
          </button>
          <!-- 등록 버튼은 사용하지 않음 -->
          <!-- <button class="btn" primary>등록</button> -->
        </div>
      </div>

      <!-- 탭 헤더 -->
      <div class="tab-header">
        <span
          class="tab"
          :class="{ active: tab === 'info' }"
          @click="tab = 'info'"
        >
          상세 조회
        </span>
        <span
          class="tab"
          :class="{ active: tab === 'file' }"
          @click="tab = 'file'"
        >
          계약서
        </span>
        <span
          class="tab"
          :class="{ active: tab === 'product' }"
          @click="tab = 'product'"
        >
          렌탈 상품 내역
        </span>
        <span
          class="tab"
          :class="{ active: tab === 'approval' }"
          @click="tab = 'approval'"
        >
          결재 내역
        </span>
      </div>

      <!-- 상세 조회 탭 -->
      <div v-if="tab === 'info'" class="tab-content">
        <div class="row">
          <div class="field">
            <label>계약서 *</label>
            <div class="value">{{ displayFileName }}</div>
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

      <!-- 계약서 탭 -->
      <div v-else-if="tab === 'file'" class="tab-content file-detail-row">
        <div class="file-info-panel">
          <div>
            <label>계약서 *</label>
            <div class="value">{{ displayFileName || '-' }}</div>
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
        <div class="file-thumbnail-panel">
          <div v-if="thumbnailSrc">
            <img
              :src="thumbnailSrc"
              alt="계약서 미리보기"
              class="contract-thumbnail"
              @click="showPreview = true"
            />
            <div style="margin-top: 16px;">
              <a
                :href="fileSrc"
                target="_blank"
                rel="noopener"
                download
                class="download-link"
              >
                PDF 다운로드
              </a>
            </div>
          </div>
          <p v-else class="desc">미리보기 이미지를 불러올 수 없습니다.</p>
        </div>
        <div v-if="showPreview" class="img-modal" @click.self="showPreview = false">
          <img
            :src="thumbnailSrc"
            alt="계약서 전체 미리보기"
            class="img-modal-img"
          />
          <a
            :href="fileSrc"
            target="_blank"
            rel="noopener"
            download
            class="download-link"
            style="margin-top:16px;"
          >
            PDF 다운로드
          </a>
        </div>
      </div>

      <!-- 렌탈 상품 내역 탭 -->
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
              <td>{{ formatAmount(p.rentalCost * p.quantity) }} 원</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 결재 내역 탭 -->
      <div v-else-if="tab === 'approval'" class="tab-content">
        <div class="approval-nav-button" style="text-align: right; margin-bottom: 12px;">
          <button class="btn" @click="goToApprovalPage">
            결재 페이지로 이동하기
          </button>
        </div>
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
            <tr
              v-for="item in contract.approvalList"
              :key="item.id"
              @dblclick="openApprovalDetail(item)"
              style="cursor: pointer;"
            >
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
      <ContractApprovalRequestModal
        v-if="showApprovalModal"
        :isOpen="showApprovalModal"
        :contractId="props.contractId"
        :contractCode="props.contractCode"
        :contractState="contractState"
        :approvalState="currentApprovalState"
        @close="showApprovalModal = false"
      />

      <!-- 결재 상세 모달 (더블클릭으로 열림) -->
      <ApprovalDetailModal
        v-if="showApprovalDetailModal"
        :isOpen="showApprovalDetailModal"
        :approval="selectedApproval"
        @close="showApprovalDetailModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/auth'
import ContractApprovalRequestModal from '@/views/contract/ContractApprovalRequestModal.vue'
import ApprovalDetailModal from '@/components/approval/ApprovalDetailModal.vue'

const props = defineProps({
  contractId: Number,
  contractCode: String,
  contractStatus: String,
  isOpen: Boolean
})
const emit = defineEmits(['close'])

const router = useRouter()

const contract = ref({ productList: [], approvalList: [] })
const tab = ref('info')
const showApprovalModal = ref(false)
const showPreview = ref(false)

// 새로 추가된 상태
const showApprovalDetailModal = ref(false)
const selectedApproval = ref(null)

// UUID 접두 제거 후 파일명 표시
const displayFileName = computed(() => {
  const name = contract.value.renameFile || ''
  const idx = name.indexOf('_')
  return idx > -1 ? name.substring(idx + 1) : name
})

// approvalList 기반: 가장 최근 결재 상태
const currentApprovalState = computed(() => {
  if (!contract.value.approvalList || contract.value.approvalList.length === 0)
    return '결재전'
  return contract.value.approvalList[contract.value.approvalList.length - 1]?.state || '결재전'
})

// 계약 상태 추론: props.contractStatus 우선, 없으면 approvalList 로
const contractState = computed(() => {
  const possible = ['status', 'contractStatus', 'state', 'contractState']
  for (const f of possible) {
    if (contract.value[f]) return contract.value[f]
  }
  if (!contract.value.approvalList || contract.value.approvalList.length === 0)
    return '결재전'
  const latest = contract.value.approvalList[contract.value.approvalList.length - 1]
  if (latest?.state === '반려') return '반려'
  if (latest?.state === '승인') return '계약중'
  if (latest?.state === '요청') return '결재중'
  return '결재전'
})

// 결재 요청 가능 여부: '결재전' 또는 '반려' 일 때만 true
const canRequestApproval = computed(() => {
  return ['결재전', '반려'].includes(contractState.value)
})

// 버튼 클릭 시 결재 요청 모달 오픈 (허용 상태가 아니면 무시)
function onRequestApproval() {
  if (!canRequestApproval.value) return
  showApprovalModal.value = true
}

// 결재 내역 더블클릭 시 결재 상세 모달 오픈
function openApprovalDetail(item) {
  selectedApproval.value = item
  showApprovalDetailModal.value = true
}

// 결재 관리 페이지로 이동
function goToApprovalPage() {
  router.push({ name: 'ApprovalManagement' })
}

// S3 경로 결합
const S3_BASE = 'https://saladerp-bucket.s3.ap-northeast-2.amazonaws.com/'
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
  return new Date(dateStr).toLocaleString()
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

.btn[disabled] {
  background: #eee;
  color: #999;
  cursor: not-allowed;
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

.approval-nav-button .btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
}
.approval-nav-button .btn:hover {
  background: #1558b0;
}

@media (max-width:900px) {
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
</style>
