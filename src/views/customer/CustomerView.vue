<template>
  <div class="customer-view">
    <nav class="breadcrumb">
      <span>고객</span>
      <span class="divider">›</span>
      <span class="current">고객 관리</span>
    </nav>
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

.breadcrumb {
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.divider {
  margin: 0 6px;
  color: #ccc;
}
.current {
  color: #333;
}
</style>
