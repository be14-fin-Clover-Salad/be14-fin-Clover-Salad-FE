<template>
  <div class="customer-view">
    <CustomersSearch @search="handleSearch" />
    <CustomersTable :customers="filteredCustomers" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CustomersSearch from "./CustomersSearch.vue";
import CustomersTable from "./CustomersTable.vue";

const customers = ref([]);
const filteredCustomers = ref([]);

const handleSearch = (criteria) => {
  // 필터링 로직 (더미)
  filteredCustomers.value = customers.value.filter((c) =>
    c.name.includes(criteria.name)
  );
};

// 테스트용 더미 데이터
customers.value = [
  {
    id: 1,
    name: "로라",
    birth: "1998-04-12",
    phone: "010-1234-5678",
    address: "서울시 강남구",
    email: "laura@example.com",
    createdAt: "2024-01-01",
    note: "",
  },
  {
    id: 2,
    name: "루카",
    birth: "1999-07-08",
    phone: "010-9876-5432",
    address: "부산시 해운대구",
    email: "luca@example.com",
    createdAt: "2024-02-15",
    note: "VIP",
  },
];
filteredCustomers.value = customers.value;
</script>

<style scoped>
.customer-view {
  padding: 24px;
}
</style>
