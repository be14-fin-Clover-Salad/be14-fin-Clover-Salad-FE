<template>
  <section>
    <!-- 검색 필터 -->
    <SearchFilterShell
      :initial="searchForm"
      :expanded="isExpanded"
      @search="handleSearch"
      @reset="handleReset"
      @toggle-expand="isExpanded = !isExpanded"
    >
      <template #fields="{ filters, expanded }">
        <ContractSearchFields :filters="filters" :expanded="expanded" />
      </template>
    </SearchFilterShell>

    <!-- 계약 목록 테이블 -->
    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="rows"
        :isLoading="isLoading"
        :selectedCode="selectedRowCode"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
      />
    </div>

    <!-- 버튼 영역 -->
    <div class="action-buttons">
      <button class="register-btn" @click="showUploadModal = true">등록</button>
      <button class="replace-btn" @click="openReplaceModal" :disabled="!selectedContract">재업로드</button>
    </div>

    <!-- 모달 컴포넌트들 -->
    <ContractUploadModal
      :isOpen="showUploadModal"
      @close="showUploadModal = false"
      @upload-success="handleUploadSuccess"
    />
    <ContractUploadSuccessModal
      :isOpen="showSuccessModal"
      @confirm="goToDetailView"
      @close="showSuccessModal = false"
    />
    <ContractDetailModal
      v-if="selectedContract"
      :key="selectedContract?.id"    
      :isOpen="showDetailModal"
      :contractId="selectedContract.id"
      :contractCode="selectedContract.code"
      :contractStatus="selectedContract.status"
      @close="() => { showDetailModal = false; selectedContract = null }"
    />
    <ContractReplaceModal
      :isOpen="showReplaceModal"
      :contract="selectedContract"
      @close="handleReplaceModalClose"
      @replace-success="handleReplaceSuccess"
    />
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ContractSearchFields from '@/components/contract/ContractSearchFields.vue'
import ContractUploadModal from '@/views/contract/ContractUploadModal.vue'
import ContractUploadSuccessModal from '@/components/contract/ContractUploadSuccessModal.vue'
import ContractDetailModal from '@/components/contract/ContractDetailModal.vue'
import ContractReplaceModal from '@/views/contract/ContractReplaceModal.vue'

// 검색 폼 상태
const searchForm = reactive({
  code: '', minAmount: '', maxAmount: '',
  status: '', customerName: '', employeeName: '',
  startDateStart: '', startDateEnd: '',
  endDateStart: '', endDateEnd: '',
  paymentDayStart: '', paymentDayEnd: '',
  bankName: '', createdAtStart: '', createdAtEnd: '',
  depositOwner: '', relationship: '', productName: ''
})

// 테이블 및 모달 상태
const rows = reactive([])
const isLoading = ref(false)
const showUploadModal = ref(false)
const showSuccessModal = ref(false)
const showDetailModal = ref(false)
const showReplaceModal = ref(false)
const selectedContract = ref(null)
const selectedRowCode = ref(null)
const isExpanded = ref(false)

// 라우트에서 contractCode 파라미터 처리
const route = useRoute()
onMounted(async () => {
  const contractCode = route.query.contractCode
  if (contractCode) {
    await handleSearch({ code: contractCode })
    const target = rows.find(c => c.code === contractCode)
    if (target) {
      selectedContract.value = target
      selectedRowCode.value   = target.id
      showDetailModal.value    = true
    }
  }
})

// 계약 검색 함수
async function handleSearch(data) {
  const token = useAuthStore().accessToken
  try {
    isLoading.value = true
    const res = await api.post('/api/query/contract/search', data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    // 포맷된 필드를 추가하여 rows 갱신
    const formatted = res.data.map(r => ({
      ...r,
      amountFormatted: formatNumber(r.amount),
      createdAtFormatted: formatDateTime(r.createdAt)
    }))
    rows.splice(0, rows.length, ...formatted)
    selectedContract.value = null
    selectedRowCode.value  = null
    showDetailModal.value   = false
    showReplaceModal.value  = false
  } finally {
    isLoading.value = false
  }
}

// 검색 필터 초기화
function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

// 등록 성공 후 상세정보 조회
async function handleUploadSuccess(contractData) {
  showUploadModal.value = false
  const token = useAuthStore().accessToken
  try {
    const res = await api.get(
      `/api/query/contract/${contractData.contractId}/info`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    )
    selectedContract.value = res.data
    showSuccessModal.value = true
  } catch {
    alert('계약 상세 조회 실패')
  }
}

// "확인" 클릭 시 상세 모달 열기
function goToDetailView() {
  showSuccessModal.value = false
  handleSearch({ ...searchForm }).then(() => {
    showDetailModal.value = true
  })
}

// 테이블 행 클릭
function handleRowClick(contract) {
  selectedRowCode.value  = contract.id
  selectedContract.value = contract
}
function handleRowDblClick(contract) {
  selectedContract.value = contract
  showDetailModal.value  = true
}

// 재업로드 모달 제어
function openReplaceModal() {
  if (!selectedContract.value) return
  showReplaceModal.value = true
}
function handleReplaceModalClose() {
  showReplaceModal.value = false
}


// 재업로드 성공 후 상세정보 재조회
async function handleReplaceSuccess(updatedContract) {
  showReplaceModal.value = false
  const token = useAuthStore().accessToken
  try {
    const res = await api.get(
      `/api/query/contract/${updatedContract.contractId}/info`,
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    )
    selectedContract.value = res.data
    showDetailModal.value   = true
  } catch {
    alert('재업로드 후 상세 조회 실패')
  }
}

// 테이블 칼럼 정의
const columns = [
  { label: '계약 번호', key: 'code', width: '120px' },
  { label: '렌탈 비용 (원/월)', key: 'amountFormatted', width: '120px' },
  { label: '계약 상태', key: 'status', width: '100px' },
  { label: '고객 명', key: 'customerName', width: '130px' },
  { label: '담당 영업사원', key: 'employeeName', width: '130px' },
  { label: '계약 시작일', key: 'startDate', width: '120px' },
  { label: '계약 만료일', key: 'endDate', width: '120px' },
  { label: '납입 일자 (일)', key: 'paymentDay', width: '100px' },
  { label: '등록일', key: 'createdAtFormatted', width: '160px' },
  { label: '상품 명', key: 'productNames', width: '200px' },
  { label: '비고', key: 'etc', width: '150px' }
]

// 날짜/시간 포맷 함수
function formatDateTime(val) {
  if (!val) return ''
  return new Date(val).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}

// 숫자 포맷 함수
function formatNumber(val) {
  if (val == null) return ''
  return Number(val).toLocaleString('ko-KR')
}
</script>

<style scoped>
section { padding: 20px; }
.table-wrapper { margin-top: 24px; overflow-x: auto; }
.action-buttons { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
.register-btn, .replace-btn {
  background-color: #6c87c1; color: white; border: none;
  border-radius: 6px; padding: 8px 16px; font-size: 14px; cursor: pointer;
}
.replace-btn:disabled { background-color: #ccc; cursor: not-allowed; }
</style>