<template>
  <section>
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <ContractSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="rows"
        :isLoading="isLoading"
        @row-click="handleRowClick"
        @register-click="showUploadModal = true"
      />
    </div>

    <!-- 등록 모달 -->
    <ContractUploadModal
      :isOpen="showUploadModal"
      @close="showUploadModal = false"
      @upload-success="handleUploadSuccess"
    />

    <!-- 업로드 성공 안내 모달 -->
    <ContractUploadSuccessModal
      :isOpen="showSuccessModal"
      @confirm="goToDetailView"
      @close="showSuccessModal = false"
    />

    <!-- 상세보기 모달 -->
    <ContractDetailModal
      :isOpen="showDetailModal"
      :contract="selectedContract"
      @close="showDetailModal = false"
    />
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ContractSearchFields from '@/components/contract/ContractSearchFields.vue'
import ContractUploadModal from '@/views/contract/ContractUploadModal.vue'
import ContractUploadSuccessModal from '@/components/contract/ContractUploadSuccessModal.vue'
import ContractDetailModal from '@/components/contract/ContractDetailModal.vue'

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
const selectedContract = ref(null)

async function handleSearch(data) {
  const authStore = useAuthStore()
  const token = authStore.accessToken
  try {
    isLoading.value = true
    const response = await api.post('/api/query/contract/search', data, {
      headers: {
        Authorization: `Bearer ${token}`
      },
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

function handleUploadSuccess(contractData) {
  selectedContract.value = contractData
  showUploadModal.value = false
  showSuccessModal.value = true
}

function goToDetailView() {
  showSuccessModal.value = false
  handleSearch({ ...searchForm })
  showDetailModal.value = true
}

function handleRowClick(contract) {
  selectedContract.value = contract
  showDetailModal.value = true
}

const columns = [
  { label: '계약 번호', key: 'code', width: '120px' },
  { label: '렌탈 비용', key: 'amount', width: '100px' },
  { label: '계약 상태', key: 'status', width: '100px' },
  { label: '고객 명', key: 'customerName', width: '130px' },
  { label: '담당 영업사원', key: 'employeeName', width: '130px' },
  { label: '계약 시작일', key: 'startDate', width: '120px' },
  { label: '계약 만료일', key: 'endDate', width: '120px' },
  { label: '납입 일자', key: 'paymentDay', width: '100px' },
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
</style>
