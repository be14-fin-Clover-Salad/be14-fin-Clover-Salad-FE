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

    <!-- 테이블 -->
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

    <!-- 모달들 -->
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
      :isOpen="showDetailModal"
      :contractId="selectedContract?.id"
      :contractCode="selectedContract.code"
      :contractStatus="selectedContract.status"
      @close="showDetailModal = false"
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

const route = useRoute()

const searchForm = reactive({
  code: '', minAmount: '', maxAmount: '',
  status: '', customerName: '', employeeName: '',
  startDateStart: '', startDateEnd: '',
  endDateStart: '', endDateEnd: '',
  paymentDayStart: '', paymentDayEnd: '',
  bankName: '', createdAtStart: '', createdAtEnd: '',
  depositOwner: '', relationship: '', productName: ''
})

const rows = reactive([])
const isLoading = ref(false)
const showUploadModal = ref(false)
const showSuccessModal = ref(false)
const showDetailModal = ref(false)
const showReplaceModal = ref(false)
const selectedContract = ref(null)
const selectedRowCode = ref(null)
const isExpanded = ref(false)

// 페이지 로드 시 쿼리 파라미터 확인
onMounted(async () => {
  const contractCode = route.query.contractCode
  if (contractCode) {
    // 해당 계약 코드로 검색
    await handleSearch({ code: contractCode })
    
    // 검색 결과에서 해당 계약 찾기
    const targetContract = rows.find(contract => contract.code === contractCode)
    if (targetContract) {
      selectedContract.value = targetContract
      selectedRowCode.value = targetContract.id
      showDetailModal.value = true
    }
  }
})

async function handleSearch(data) {
  const authStore = useAuthStore()
  const token = authStore.accessToken
  try {
    isLoading.value = true
    const response = await api.post('/api/query/contract/search', data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    rows.splice(0, rows.length, ...response.data)
  } catch (error) {
    console.error('검색 실패:', error)
  } finally {
    isLoading.value = false
  }
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

async function handleUploadSuccess(contractData) {
  const contractId = contractData.contractId
  showUploadModal.value = false

  try {
    const token = useAuthStore().accessToken
    const response = await api.get(`/api/query/contract/${contractId}/info`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    selectedContract.value = response.data
    showSuccessModal.value = true
  } catch (error) {
    alert('계약 상세 조회 실패')
    console.error('계약 상세 조회 에러:', error)
  }
}

function goToDetailView() {
  showSuccessModal.value = false
  handleSearch({ ...searchForm })
  showDetailModal.value = true
}

function handleRowClick(contract) {
  selectedRowCode.value = contract.id
  selectedContract.value = contract
}

function handleRowDblClick(contract) {
  selectedContract.value = contract
  showDetailModal.value = true
  console.log('contract:', contract)
}

function openReplaceModal() {
  if (!selectedContract.value) return
  showReplaceModal.value = true
}

function handleReplaceModalClose() {
  showReplaceModal.value = false
}

function handleReplaceSuccess(updatedContract) {
  showReplaceModal.value = false
  selectedContract.value = updatedContract
  showSuccessModal.value = true
}

const columns = [
  { label: '계약 번호', key: 'code', width: '120px' },
  { label: '렌탈 비용 (원/월)', key: 'amount', width: '100px' },
  { label: '계약 상태', key: 'status', width: '100px' },
  { label: '고객 명', key: 'customerName', width: '130px' },
  { label: '담당 영업사원', key: 'employeeName', width: '130px' },
  { label: '계약 시작일', key: 'startDate', width: '120px' },
  { label: '계약 만료일', key: 'endDate', width: '120px' },
  { label: '납입 일자 (일)', key: 'paymentDay', width: '100px' },
  { label: '등록일', key: 'createdAt', width: '120px' },
  { label: '상품 명', key: 'productNames', width: '200px' },
  { label: '비고', key: 'etc', width: '150px' }
]
</script>

<style scoped>
section {
  padding: 20px;
}

.table-wrapper {
  margin-top: 24px;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.register-btn,
.replace-btn {
  background-color: #6c87c1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.replace-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
