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
import { reactive } from 'vue'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import ContractSearchFields from '@/components/contract/ContractSearchFields.vue'

const searchForm = reactive({
  code: '', createdAtStart: '', createdAtEnd: '',
  startDateStart: '', startDateEnd: '',
  status: '', bankName: '', paymentDayStart: '',
  depositOwner: '', relationship: '', employeeName: '',
  customerName: '', productName: ''
})

function handleSearch(data) {
  console.log('검색 조건:', data)
}

function handleReset() {
  console.log('검색 조건 초기화됨')
}

const columns = [
  { label: '계약 번호', key: 'contractCode' },
  { label: '계약서', key: 'contractFile' },
  { label: '렌탈 비용', key: 'rentalPrice' },
  { label: '계약 상태', key: 'contractState' },
  { label: '고객 명', key: 'customerName' },
  { label: '담당 영업사원', key: 'employeeName' },
  { label: '계약 시작일', key: 'startDate' },
  { label: '계약 만료일', key: 'endDate' },
  { label: '납입 일자', key: 'paymentDay' },
  { label: '등록 시간', key: 'registeredAt' },
  { label: '상품 명', key: 'productName' },
  { label: '비고', key: 'note' }
]

const rows = Array.from({ length: 10 }).map(() => ({
  contractCode: 'C-20240601',
  contractFile: '고성연–렌탈–계약서.pdf',
  rentalPrice: '55,000 원',
  contractState: '계약 중',
  customerName: '고성연',
  employeeName: '홍길동',
  startDate: '2025-02-01',
  endDate: '2027-03-31',
  paymentDay: '5일',
  registeredAt: '2025-05-23일 1시',
  productName: 'TV 외 3개',
  note: '장기 렌탈 고객'
}))
</script>

<style scoped>
section {
  padding: 20px;
}

.table-wrapper {
  margin-top: 24px;
}
</style>
