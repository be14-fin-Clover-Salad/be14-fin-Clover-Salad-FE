<template>
  <div class="customer-view">
    <SearchFilterShell
      :initial="searchForm"
      :show-toggle="true"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #fields="{ filters, expanded }">
        <CustomerSearchFields :filters="filters" :expanded="expanded" />
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="rows"
        :is-loading="isLoading"
        :selectedCode="selectedRowCode"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
      />
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import SearchFilterShell from "@/components/common/SearchFilterShell.vue";
import BaseDataTable from "@/components/BaseDataTable.vue";
import { searchCustomers } from "@/api/customer.js";
import CustomerSearchFields from "@/components/customer/CustomerSearchFields.vue";

const router = useRouter();
const searchForm = reactive({
  name: "",
  phone: "",
  type: "",
  birthdateFrom: "",
  birthdateTo: "",
  registerAtFrom: "",
  registerAtTo: "",
});
const rows = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const selectedRowCode = ref(null);

const columns = [
  {
    text: "No",
    value: "customerNo",
    label: "#",
    key: "customerNo",
    width: "30px",
  },
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
];

const fetchCustomers = async (params = {}) => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await searchCustomers(params);
    rows.value = response.data.content.map((c, index) => ({
      ...c,
      customerNo: index + 1,
      type: formatCustomerType(c.type),
      registerAt: formatDate(c.registerAt),
    }));
  } catch (err) {
    errorMessage.value = "고객 정보를 불러오는 데 실패했습니다.";
    rows.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = (filters) => {
  fetchCustomers(filters);
};

const handleReset = () => {
  Object.keys(searchForm).forEach((key) => (searchForm[key] = ""));
  fetchCustomers();
};

const handleRowClick = (row) => {
  selectedRowCode.value = row.id;
};

const handleRowDblClick = (customer) => {
  router.push({ name: "CustomerDetail", params: { id: customer.id } });
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
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}`;
};

fetchCustomers();
</script>

<style scoped>
.customer-view {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
}
.search-fields {
  padding: 16px 24px;
  margin-bottom: 12px;
  min-width: 0;
  overflow: hidden;
}
.search-fields {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}
.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
  white-space: nowrap;
}
input,
select {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}
input:focus,
select:focus {
  outline: none;
  border-color: #86b649;
  box-shadow: 0 0 0 2px rgba(134, 182, 73, 0.1);
}
.table-wrapper {
  margin-top: 24px;
  overflow-x: auto;
  max-width: 100%;
}

::v-deep(.data-table) {
  width: 100%;
  table-layout: auto;
}

::v-deep(.data-table tbody tr:hover) {
  cursor: pointer;
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
@media (max-width: 1200px) {
  .search-fields {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 992px) {
  .search-fields {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .search-fields {
    padding: 12px 16px;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .form-group label {
    font-size: 12px;
  }
  input,
  select {
    font-size: 12px;
    padding: 3px 6px;
  }
}
@media (max-width: 480px) {
  .search-fields {
    padding: 8px 12px;
    gap: 6px;
  }
}
.data-table tr:hover {
  background-color: #f9f9f9;
}
</style>
