<template>
  <div class="consulting-view">
    <SearchFilterShell
      :initial="searchFilters"
      :show-toggle="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #fields="{ filters }">
        <ConsultSearchFields :filters="filters" />
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <BaseDataTable
        :columns="columns"
        :rows="formattedConsults"
        :is-loading="isLoading"
        :selectedCode="selectedRowCode"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
      />
    </div>

    <div class="table-actions">
      <button class="register-btn" @click="goToRegister">등록</button>
    </div>

    <!-- 상담 상세 모달 -->
    <ConsultDetailModal
      :show="showDetailModal"
      :consult="selectedConsult"
      @close="closeDetailModal"
      @delete="handleDeleteConsult"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/auth.js";
import { useAuthStore } from "@/stores/auth";
import { searchConsults } from "@/api/consult.js";
import SearchFilterShell from "@/components/common/SearchFilterShell.vue";
import BaseDataTable from "@/components/BaseDataTable.vue";
import ConsultDetailModal from "@/components/consult/ConsultDetailModal.vue";
import ConsultSearchFields from "@/components/consult/ConsultSearchFields.vue";

const router = useRouter();
const authStore = useAuthStore();

const consults = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const showDetailModal = ref(false);
const selectedConsult = ref(null);
const selectedRowCode = ref(null);

const searchFilters = reactive({
  consultDateFrom: "",
  consultDateTo: "",
  content: "",
  minScore: "",
  maxScore: "",
  feedbackScore: "",
});

const columns = ref([
  {
    text: "No",
    value: "consultNo",
    label: "#",
    key: "consultNo",
    width: "30px",
  },
  { key: "consultAt", label: "상담 일자", width: "120px" },
  { key: "content", label: "상담 내용", width: "400px" },
  { key: "customerName", label: "고객명", width: "100px" },
  { key: "feedbackScore", label: "만족도", width: "80px" },
  { key: "etc", label: "비고", width: "250px" },
]);

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}`;
}

const formattedConsults = computed(() => {
  return consults.value.map((c, index) => ({
    ...c,
    consultNo: index + 1,
    consultAt: formatDateTime(c.consultAt),
    feedbackScore: c.feedbackScore ? c.feedbackScore.toFixed(1) : "-",
    customerName: c.customerName || "-",
  }));
});

const fetchConsults = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    let params = Object.fromEntries(
      Object.entries(searchFilters).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
    // feedbackScore가 있으면 minScore, maxScore로 변환
    if (params.feedbackScore) {
      params.minScore = params.maxScore = params.feedbackScore;
      delete params.feedbackScore;
    }
    const response = await searchConsults(params);
    consults.value = response.data;
  } catch (error) {
    console.error("상담 목록 조회 실패:", error);
    errorMessage.value = "상담 목록을 조회하는 중 오류가 발생했습니다.";
    consults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = (filters) => {
  Object.assign(searchFilters, filters);
  fetchConsults();
};

const handleReset = () => {
  Object.keys(searchFilters).forEach((key) => {
    searchFilters[key] = "";
  });
  fetchConsults();
};

const goToRegister = () => {
  router.push("/consult/register");
};

const handleRowClick = (row) => {
  selectedRowCode.value = row.id;
};

const handleRowDblClick = (consult) => {
  router.push(`/consult/detail/${consult.id}`);
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedConsult.value = null;
};

const handleDeleteConsult = async (consultId) => {
  try {
    await api.delete(`/api/consult/${consultId}`);
    closeDetailModal();
    fetchConsults();
  } catch (error) {
    console.error("상담 삭제 실패:", error);
    errorMessage.value = "상담 삭제 중 오류가 발생했습니다.";
  }
};

onMounted(fetchConsults);
</script>

<style scoped>
.consulting-view {
  padding: 20px;
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

.table-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.register-btn {
  background-color: #6c87c1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  border: 1px solid #ffcdd2;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}
</style>
