<template>
  <section>
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <ContractSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <BaseDataTable :columns="columns" :rows="rows" />
    </div>
  </section>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ContractSearchFields from '@/components/contract/ContractSearchFields.vue'

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

async function handleSearch(data) {
  const authStore = useAuthStore()
  const token = authStore.accessToken

  try {
    const response = await axios.post('/api/query/contract/search', data, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })

    rows.splice(0, rows.length, ...response.data)
  } catch (error) {
    console.error('검색 실패:', error)
  }
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

const columns = [
  { label: '계약 번호', key: 'code' },
  { label: '렌탈 비용', key: 'amount' },
  { label: '계약 상태', key: 'status' },
  { label: '고객 명', key: 'customerName' },
  { label: '담당 영업사원', key: 'employeeName' },
  { label: '계약 시작일', key: 'startDate' },
  { label: '계약 만료일', key: 'endDate' },
  { label: '납입 일자', key: 'paymentDay' },
  { label: '등록일', key: 'createdAt' },
  { label: '상품 명', key: 'productNames' },
  { label: '비고', key: 'etc' }
]
</script>

<style scoped>
section {
  padding: 20px;
}

.table-wrapper {
  margin-top: 24px;
}
</style>
