<template>
  <section>
    <h2>계약 관리</h2>
    <BaseDataTable :columns="columns" :rows="rows" />
  </section>
</template>

<script setup>
import BaseDataTable from '@/components/BaseDataTable.vue';

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
];

const rows = Array.from({ length: 10 }).map((_, index) => ({
  contractCode: 'con-001',
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
}));
</script>

<style scoped>
section {
  padding: 20px;
}
</style>
