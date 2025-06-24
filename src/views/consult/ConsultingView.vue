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

const searchFilters = reactive({
  consultDateFrom: "",
  consultDateTo: "",
  content: "",
  minScore: "",
  maxScore: "",
});

const columns = ref([
  { key: "consultAt", label: "상담 일자", width: "180px" },
  { key: "content", label: "상담 내용", width: "300px" },
  { key: "customerName", label: "고객명", width: "130px" },
  { key: "feedbackScore", label: "피드백 점수", width: "120px" },
  { key: "etc", label: "비고", width: "200px" },
]);

const formattedConsults = computed(() => {
  return consults.value.map((c) => ({
    ...c,
    consultAt: c.consultAt
      ? new Date(c.consultAt).toLocaleString("ko-KR")
      : "-",
    feedbackScore: c.feedbackScore ? c.feedbackScore.toFixed(1) : "-",
    customerName: c.customerName || "-",
  }));
});

const fetchConsults = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const params = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, v]) => v)
    );
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
</style>
