<template>
  <div class="customer-view">
    <CustomerSearch @search="handleSearch" />
    <CustomerTable ref="customerTableRef" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import CustomerSearch from "./CustomerSearch.vue";
import CustomerTable from "./CustomerTable.vue";

const customerTableRef = ref(null);
const handleSearch = (conditions) => {
  customerTableRef.value?.loadData(conditions);
};
</script>

<style scoped>
.customer-view {
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
}
</style>
