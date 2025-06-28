<template>
  <section>
    <SearchFilterShell
      :initial="searchForm"
      :expanded="isExpanded"
      @search="handleSearch"
      @reset="handleReset"
      @toggle-expand="isExpanded = !isExpanded"
    >
      <template #fields="{ filters, expanded }">
        <DepartmentGoalSearchFields :filters="filters" :departmentName="departmentName" :isAdmin="isAdmin"
                                    :expanded="expanded"/>
      </template>
    </SearchFilterShell>
    <div class="action-buttons">
    </div>
    <BaseDataTable
      :rows="rows"
      :columns="columns"
      :isLoading="isLoading"
      :selectedCode="selectedRowCode"
      @row-click="handleRowClick"
    />
  </section>
</template>

<script setup>
import BaseDataTable from "@/components/BaseDataTable.vue";
import SearchFilterShell from "@/components/common/SearchFilterShell.vue";
import DepartmentGoalSearchFields from "@/components/goal/DepartmentGoalSearchFields.vue";
import { onMounted, reactive, ref } from "vue";
import api from "@/api/auth.js";
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
const rows = reactive([]);
const isLoading = ref(false);
const userId = ref(authStore.userInfo?.id);
const isAdmin = ref(false);
const employeeCode = ref(null);
const departmentName = ref(null);
const selectedRowCode = ref(null);
const selectedGoal = ref(null);
const isExpanded = ref(false);

const searchForm = reactive({
  departmentName: '',
  startDate: '',
  endDate: '',
  minRentalProductCount: '',
  maxRentalProductCount: '',
  minRentalRetentionRate: '',
  maxRentalRetentionRate: '',
  minNewCustomerCount: '',
  maxNewCustomerCount: '',
  minTotalRentalAmount: '',
  maxTotalRentalAmount: '',
  minCustomerFeedbackScore: '',
  maxCustomerFeedbackScore: ''
});

const columns = [
  { label: '#', key: 'id'},
  { label: '부서명', key: 'departmentName' },
  { label: '대상연월', key: 'targetDate' },
  { label: '렌탈 상품 수', key: 'rentalProductCount' },
  { label: '렌탈 유지율', key: 'rentalRetentionRate' },
  { label: '신규 고객 수', key: 'newCustomerCount' },
  { label: '총 렌탈료', key: 'totalRentalAmount' },
  { label: '고객 만족도', key: 'customerFeedbackScore' },
];

onMounted(async () => {
  const response = await api.get(`/employee/detail?employeeId=${userId.value}`);
  departmentName.value = response.data.departmentName || undefined;
  searchForm.departmentName = departmentName.value;
  employeeCode.value = Number(response.data.code) || undefined;
  searchForm.employeeCode = employeeCode.value;
  isAdmin.value = response.data.level === "관리자";
})

async function handleSearch(data) {
  try {
    console.log(data)
    isLoading.value = true
    const response = await api.get('/api/goal/department', {
      params: data
    })
    console.log(response.data);
    // index 부여
    const indexedData = response.data.map((item, idx) => ({
        ...item,
        id: idx + 1,
        targetDate: formatDate(item.targetDate),
        totalRentalAmount: formatMoney(item.totalRentalAmount),
        rentalRetentionRate: formatNumber2(item.rentalRetentionCount * 100 / item.totalRentalCount),
        customerFeedbackScore: formatNumber2(item.customerFeedbackScore / item.customerFeedbackCount / 10)
      })
    )
    console.log(indexedData);
    rows.splice(0, rows.length, ...indexedData)
  } catch (error) {
    console.error('검색 실패:', error);
  } finally {
    isLoading.value = false
  }
}

function formatNumber2(num) {
  return num.toFixed(1);
}

function formatMoney(val) {
  if (val == null) return ''
  return Number(val).toLocaleString('ko-KR')
}

function formatDate(date) {
  const stringDate = date.toString();
  return stringDate.slice(0, 4) + "-" + stringDate.slice(-2);
}

function handleReset() {
  Object.keys(searchForm).forEach(key => searchForm[key] = '')
}

function handleRowClick(goal) {
  selectedRowCode.value = goal.id;
  selectedGoal.value = goal;
}
</script>

<style scoped>
section {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

::v-deep(.data-table) {
  width: 100%;
  table-layout: auto;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
