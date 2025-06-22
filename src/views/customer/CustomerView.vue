<template>
  <div class="customer-view">
    <div class="page-header">
      <h2>고객 관리</h2>
      <p class="page-description">고객 정보를 조회할 수 있습니다.</p>
    </div>

    <CustomerSearch @search="handleSearch" />

    <CustomerTable ref="customerTableRef" />

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import CustomerSearch from "./CustomerSearch.vue";
import CustomerTable from "./CustomerTable.vue";

const router = useRouter();
const customerTableRef = ref(null);
const errorMessage = ref("");

const handleSearch = (conditions) => {
  customerTableRef.value?.loadData(conditions);
};
</script>

<style scoped>
.customer-view {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
}
</style>
