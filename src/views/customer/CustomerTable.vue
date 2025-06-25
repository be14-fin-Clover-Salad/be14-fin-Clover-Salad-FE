<template>
  <div>
    <BaseDataTable
      :columns="headers"
      :rows="customers"
      :is-loading="loading"
      :selectedCode="selectedRowId"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDoubleClick"
    >
    </BaseDataTable>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseDataTable from "@/components/BaseDataTable.vue";
import { searchCustomers } from "@/api/customer.js";

const router = useRouter();
const customers = ref([]);
const loading = ref(false);
const error = ref(null);
let currentSearchConditions = {};
const selectedRowId = ref(null);

const headers = ref([
  { text: "No", value: "customerNo", label: "No", key: "customerNo" },
  { text: "고객명", value: "name", label: "고객명", key: "name" },
  { text: "고객 유형", value: "type", label: "고객 유형", key: "type" },
  { text: "생년월일", value: "birthdate", label: "생년월일", key: "birthdate" },
  { text: "연락처", value: "phone", label: "연락처", key: "phone" },
  {
    text: "고객 등록일",
    value: "registerAt",
    label: "고객 등록일",
    key: "registerAt",
  },
]);

const emit = defineEmits(["row-click"]);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await searchCustomers();
    customers.value = response.data.content.map((c, index) => ({
      ...c,
      id: c.id,
      customerNo: index + 1,
      type: formatCustomerType(c.type),
      registerAt: formatDate(c.registerAt),
    }));
  } catch (err) {
    error.value = "고객 정보를 불러오는 데 실패했습니다.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadData = (conditions) => {
  currentSearchConditions = conditions;
  fetchData();
};

const handleRowDoubleClick = (customer) => {
  emit("row-click", customer);
  router.push({ name: "CustomerDetail", params: { id: customer.id } });
};

const handleRowClick = (row) => {
  selectedRowId.value = Number(row.id);
};

const formatCustomerType = (type) => {
  const types = {
    CUSTOMER: "고객",
    PROSPECT: "리드",
  };
  return types[type] || type;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

onMounted(() => {
  fetchData();
});

defineExpose({
  loadData,
});
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
