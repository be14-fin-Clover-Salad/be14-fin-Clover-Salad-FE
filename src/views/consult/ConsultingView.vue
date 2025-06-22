<template>
  <div class="consulting-view">
    <div class="page-header">
      <h2>상담 관리</h2>
      <p class="page-description">상담 내역을 조회하고 관리할 수 있습니다.</p>
    </div>

    <ConsultSearch @search="handleSearch" />

    <ConsultTable ref="consultTableRef" @row-click="handleRowClick" />

    <div class="table-actions">
      <button class="register-btn" @click="goToRegister">상담 등록</button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/auth.js";
import { useAuthStore } from "@/stores/auth";
import { getAllConsults, getMyConsults } from "@/api/consult.js";
import ConsultSearch from "@/components/consult/ConsultSearch.vue";
import ConsultTable from "@/components/consult/ConsultTable.vue";
import ConsultDetailModal from "@/components/consult/ConsultDetailModal.vue";

const consultTableRef = ref(null);
const errorMessage = ref("");
const authStore = useAuthStore();
const showDetailModal = ref(false);
const selectedConsult = ref(null);
const router = useRouter();

const goToRegister = () => {
  router.push("/consult/register");
};

// 사용자 권한에 따른 상담 목록 조회
const fetchConsultsByRole = async () => {
  if (consultTableRef.value) {
    consultTableRef.value.setLoading(true);
  }
  errorMessage.value = "";

  try {
    const userRole = authStore.userRole;
    let response;

    // 사용자 권한에 따라 적절한 API 함수 호출
    if (userRole === "ROLE_ADMIN") {
      response = await getAllConsults();
    } else {
      // ROLE_MANAGER와 ROLE_MEMBER 모두 사원별 API 사용
      response = await getMyConsults();
    }

    if (consultTableRef.value) {
      consultTableRef.value.loadData(response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // 404 Not Found - 백엔드 엔드포인트가 구현되지 않았을 가능성
      console.error(
        "상담 API 엔드포인트를 찾을 수 없습니다:",
        error.config.url
      );
      errorMessage.value =
        "상담 목록을 조회할 수 없습니다. 백엔드 API가 구현되지 않았을 수 있습니다.";
      if (consultTableRef.value) {
        consultTableRef.value.loadData([]);
      }
    } else {
      // 그 외의 에러는 오류 메시지 표시
      console.error("상담 목록 조회 실패:", error);
      errorMessage.value = "상담 목록을 조회하는 중 오류가 발생했습니다.";
    }
  } finally {
    if (consultTableRef.value) {
      consultTableRef.value.setLoading(false);
    }
  }
};

const handleSearch = async (searchParams) => {
  if (consultTableRef.value) {
    consultTableRef.value.setLoading(true);
  }
  errorMessage.value = "";

  try {
    await fetchConsultsByRole();
  } catch (error) {
    console.error("상담 검색 실패:", error);
    errorMessage.value = "상담 목록을 검색하는 중 오류가 발생했습니다.";
  } finally {
    if (consultTableRef.value) {
      consultTableRef.value.setLoading(false);
    }
  }
};

// 행 클릭 이벤트 처리
const handleRowClick = (consult) => {
  selectedConsult.value = consult;
  showDetailModal.value = true;
};

// 상세 모달 닫기
const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedConsult.value = null;
};

// 상담 삭제 처리
const handleDeleteConsult = async (consultId) => {
  try {
    const token = authStore.accessToken;
    // 삭제 API는 ConsultationCommandController를 따름 (/api/consult)
    await api.delete(`/api/consult/${consultId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    await fetchConsultsByRole();
    closeDetailModal();
    errorMessage.value = "";
  } catch (error) {
    console.error("상담 삭제 실패:", error);
    errorMessage.value = "상담 삭제 중 오류가 발생했습니다.";
  }
};

onMounted(() => {
  fetchConsultsByRole();
});
</script>

<style scoped>
.consulting-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.register-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: #86b649;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-btn:hover {
  background-color: #709e3a;
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
